//! SQLite access: durable + session tiers.

pub mod analysis_history;
pub mod connection_instance;
pub mod session_cache;
pub mod workspace;

use crate::error::{FaroError, FaroResult};
use rusqlite::{Connection, OptionalExtension};
use std::path::PathBuf;
use std::sync::Mutex;

pub const SESSION_TABLES: &[&str] = &[
    "cached_configmap_entry",
    "cached_pod_replica",
    "cached_configmap",
    "cached_service",
    "cached_deployment",
    "cached_namespace",
    "connection_session",
];

pub const DURABLE_TABLES: &[&str] = &[
    "connection_instance",
    "ui_preferences",
    "analysis_finding_history",
    "schema_meta",
];

pub struct DbState {
    pub conn: Mutex<Connection>,
    #[allow(dead_code)]
    pub path: PathBuf,
}

impl DbState {
    pub fn open(path: PathBuf) -> FaroResult<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let conn = Connection::open(&path)?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;
        let state = Self {
            conn: Mutex::new(conn),
            path,
        };
        state.migrate()?;
        Ok(state)
    }

    pub fn migrate(&self) -> FaroResult<()> {
        let conn = self.conn.lock().map_err(|_| FaroError::Message("db lock".into()))?;
        conn.execute_batch(include_str!("migrations/001_durable.sql"))?;
        conn.execute_batch(include_str!("migrations/002_session.sql"))?;
        conn.execute_batch(include_str!("migrations/003_services.sql"))?;
        Ok(())
    }

    /// DELETE all session-tier rows. Durable tables are untouched (FR-024).
    pub fn purge_ephemeral(&self) -> FaroResult<bool> {
        let conn = self.conn.lock().map_err(|_| FaroError::Message("db lock".into()))?;
        for table in SESSION_TABLES {
            conn.execute(&format!("DELETE FROM {table}"), [])?;
        }
        Ok(true)
    }

    #[allow(dead_code)]
    pub fn prefs_get(&self, key: &str) -> FaroResult<Option<String>> {
        let conn = self.conn.lock().map_err(|_| FaroError::Message("db lock".into()))?;
        let value = conn
            .query_row(
                "SELECT value FROM ui_preferences WHERE key = ?1",
                [key],
                |row| row.get(0),
            )
            .optional()?;
        Ok(value)
    }

    pub fn prefs_set(&self, key: &str, value: &str) -> FaroResult<()> {
        let conn = self.conn.lock().map_err(|_| FaroError::Message("db lock".into()))?;
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO ui_preferences (key, value, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            (key, value, now),
        )?;
        Ok(())
    }

    pub fn prefs_all(&self) -> FaroResult<std::collections::HashMap<String, String>> {
        let conn = self.conn.lock().map_err(|_| FaroError::Message("db lock".into()))?;
        let mut stmt = conn.prepare("SELECT key, value FROM ui_preferences")?;
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?;
        let mut map = std::collections::HashMap::new();
        for row in rows {
            let (k, v) = row?;
            map.insert(k, v);
        }
        Ok(map)
    }

    pub fn table_exists(conn: &Connection, name: &str) -> FaroResult<bool> {
        let exists: i64 = conn.query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?1",
            [name],
            |row| row.get(0),
        )?;
        Ok(exists > 0)
    }
}

pub fn default_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("faro")
        .join("faro.sqlite")
}

pub fn open_default() -> FaroResult<DbState> {
    DbState::open(default_db_path())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn migrations_create_durable_and_session_tables() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.sqlite");
        let db = DbState::open(path).unwrap();
        let conn = db.conn.lock().unwrap();
        for t in DURABLE_TABLES {
            assert!(DbState::table_exists(&conn, t).unwrap(), "missing durable {t}");
        }
        for t in SESSION_TABLES {
            assert!(DbState::table_exists(&conn, t).unwrap(), "missing session {t}");
        }
    }

    #[test]
    fn purge_deletes_session_only() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("purge.sqlite");
        let db = DbState::open(path).unwrap();
        {
            let conn = db.conn.lock().unwrap();
            let now = "2026-07-23T00:00:00Z";
            conn.execute(
                "INSERT INTO connection_instance (
                    id, name, bastion_host, ssh_port, ssh_user, pem_path, iam_credentials_path,
                    region_name, cluster_name, created_at, updated_at
                 ) VALUES (?1, ?2, 'h', 22, 'u', '/p.pem', '/iam', 'us-east-1', 'c', ?3, ?3)",
                ("env-1", "demo", now),
            )
            .unwrap();
            conn.execute(
                "INSERT INTO connection_session (
                    id, connection_instance_id, status, catalog_epoch
                 ) VALUES ('s1', 'env-1', 'connected', 'epoch-1')",
                [],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO cached_namespace (
                    id, connection_instance_id, catalog_epoch, name, fetched_at
                 ) VALUES ('n1', 'env-1', 'epoch-1', 'default', ?1)",
                [now],
            )
            .unwrap();
            conn.execute(
                "INSERT INTO ui_preferences (key, value, updated_at) VALUES ('theme', 'dark', ?1)",
                [now],
            )
            .unwrap();
        }

        assert!(db.purge_ephemeral().unwrap());

        let conn = db.conn.lock().unwrap();
        let sessions: i64 = conn
            .query_row("SELECT COUNT(*) FROM connection_session", [], |r| r.get(0))
            .unwrap();
        let namespaces: i64 = conn
            .query_row("SELECT COUNT(*) FROM cached_namespace", [], |r| r.get(0))
            .unwrap();
        let envs: i64 = conn
            .query_row("SELECT COUNT(*) FROM connection_instance", [], |r| r.get(0))
            .unwrap();
        let prefs: i64 = conn
            .query_row("SELECT COUNT(*) FROM ui_preferences", [], |r| r.get(0))
            .unwrap();
        assert_eq!(sessions, 0);
        assert_eq!(namespaces, 0);
        assert_eq!(envs, 1, "durable environments must survive purge");
        assert_eq!(prefs, 1, "prefs must survive purge");
    }
}
