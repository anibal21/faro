//! Workspace chrome state: loaded environments + one active (US3).

use crate::db::connection_instance;
use crate::error::{FaroError, FaroResult};
use rusqlite::{Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

pub const PREF_LOADED_IDS: &str = "loaded_instance_ids";
pub const PREF_ACTIVE_ID: &str = "last_active_instance_id";
pub const PREF_LIVE_GEN: &str = "live_generation";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceState {
    pub loaded_ids: Vec<String>,
    pub active_id: Option<String>,
    /// Bumped when active changes so UI can invalidate live windows.
    pub live_generation: u64,
}

fn read_loaded(conn: &Connection) -> FaroResult<Vec<String>> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT value FROM ui_preferences WHERE key = ?1",
            [PREF_LOADED_IDS],
            |row| row.get(0),
        )
        .optional()?;
    match raw {
        None => Ok(vec![]),
        Some(s) if s.trim().is_empty() => Ok(vec![]),
        Some(s) => {
            let ids: Vec<String> = serde_json::from_str(&s).map_err(|e| {
                FaroError::Message(format!("invalid loaded_instance_ids prefs: {e}"))
            })?;
            Ok(ids)
        }
    }
}

fn read_active(conn: &Connection) -> FaroResult<Option<String>> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT value FROM ui_preferences WHERE key = ?1",
            [PREF_ACTIVE_ID],
            |row| row.get(0),
        )
        .optional()?;
    Ok(raw.filter(|s| !s.trim().is_empty()))
}

fn write_pref(conn: &Connection, key: &str, value: &str) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO ui_preferences (key, value, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        (key, value, now),
    )?;
    Ok(())
}

fn read_live_generation(conn: &Connection) -> FaroResult<u64> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT value FROM ui_preferences WHERE key = ?1",
            [PREF_LIVE_GEN],
            |row| row.get(0),
        )
        .optional()?;
    Ok(raw.and_then(|s| s.parse().ok()).unwrap_or(0))
}

fn bump_live_generation(conn: &Connection) -> FaroResult<u64> {
    let next = read_live_generation(conn)?.saturating_add(1);
    write_pref(conn, PREF_LIVE_GEN, &next.to_string())?;
    Ok(next)
}

pub fn get_state(conn: &Connection) -> FaroResult<WorkspaceState> {
    Ok(WorkspaceState {
        loaded_ids: read_loaded(conn)?,
        active_id: read_active(conn)?,
        live_generation: read_live_generation(conn)?,
    })
}

/// Merge `ids` into the loaded set (dedup, preserve order). Validates each id exists.
pub fn load_ids(conn: &Connection, ids: &[String]) -> FaroResult<WorkspaceState> {
    if ids.is_empty() {
        return Err(FaroError::Message(
            "env_load requires at least one id".into(),
        ));
    }
    for id in ids {
        if connection_instance::get_by_id(conn, id)?.is_none() {
            return Err(FaroError::Message(format!(
                "cannot load unknown environment: {id}"
            )));
        }
    }
    let mut loaded = read_loaded(conn)?;
    for id in ids {
        if !loaded.iter().any(|x| x == id) {
            loaded.push(id.clone());
        }
    }
    write_pref(
        conn,
        PREF_LOADED_IDS,
        &serde_json::to_string(&loaded).unwrap(),
    )?;

    let active = read_active(conn)?;
    let active = match active {
        Some(a) if loaded.iter().any(|x| x == &a) => Some(a),
        _ => {
            let pick = ids.first().cloned().or_else(|| loaded.first().cloned());
            if let Some(ref p) = pick {
                write_pref(conn, PREF_ACTIVE_ID, p)?;
            }
            pick
        }
    };

    Ok(WorkspaceState {
        loaded_ids: loaded,
        active_id: active,
        live_generation: read_live_generation(conn)?,
    })
}

pub fn set_active(conn: &Connection, id: &str) -> FaroResult<WorkspaceState> {
    if connection_instance::get_by_id(conn, id)?.is_none() {
        return Err(FaroError::Message(format!(
            "cannot activate unknown environment: {id}"
        )));
    }
    let mut loaded = read_loaded(conn)?;
    if !loaded.iter().any(|x| x == id) {
        loaded.push(id.to_string());
        write_pref(
            conn,
            PREF_LOADED_IDS,
            &serde_json::to_string(&loaded).unwrap(),
        )?;
    }
    let prev = read_active(conn)?;
    write_pref(conn, PREF_ACTIVE_ID, id)?;
    let gen = if prev.as_deref() != Some(id) {
        bump_live_generation(conn)?
    } else {
        read_live_generation(conn)?
    };
    Ok(WorkspaceState {
        loaded_ids: loaded,
        active_id: Some(id.to_string()),
        live_generation: gen,
    })
}

/// When deleting an environment, drop it from loaded/active prefs.
pub fn on_instance_deleted(conn: &Connection, id: &str) -> FaroResult<()> {
    let mut loaded = read_loaded(conn)?;
    loaded.retain(|x| x != id);
    write_pref(
        conn,
        PREF_LOADED_IDS,
        &serde_json::to_string(&loaded).unwrap(),
    )?;
    if read_active(conn)?.as_deref() == Some(id) {
        let next = loaded.first().cloned().unwrap_or_default();
        write_pref(conn, PREF_ACTIVE_ID, &next)?;
        bump_live_generation(conn)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::connection_instance::{upsert, EnvUpsertInput};
    use crate::db::DbState;
    use tempfile::tempdir;

    fn sample(name: &str) -> EnvUpsertInput {
        EnvUpsertInput {
            id: None,
            name: name.into(),
            bastion_host: "h".into(),
            ssh_port: 22,
            ssh_user: "u".into(),
            pem_path: r"C:\a.pem".into(),
            iam_credentials_path: r"C:\iam".into(),
            region_name: "us-east-1".into(),
            cluster_name: "c".into(),
            namespace_default: Some("default".into()),
            notes: None,
            is_favorite: None,
            sort_order: None,
        }
    }

    #[test]
    fn load_and_set_active() {
        let dir = tempdir().unwrap();
        let db = DbState::open(dir.path().join("ws.sqlite")).unwrap();
        let conn = db.conn.lock().unwrap();
        let a = upsert(&conn, sample("a")).unwrap();
        let b = upsert(&conn, sample("b")).unwrap();

        let s1 = load_ids(&conn, &[a.id.clone()]).unwrap();
        assert_eq!(s1.loaded_ids, vec![a.id.clone()]);
        assert_eq!(s1.active_id.as_deref(), Some(a.id.as_str()));

        let s2 = load_ids(&conn, &[b.id.clone()]).unwrap();
        assert_eq!(s2.loaded_ids.len(), 2);
        let s3 = set_active(&conn, &b.id).unwrap();
        assert_eq!(s3.active_id.as_deref(), Some(b.id.as_str()));
        assert!(s3.live_generation >= 1);
    }
}
