//! Durable `connection_instance` repository.

use crate::error::{FaroError, FaroResult};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const DEMO_INSTANCE_ID: &str = "faro-demo";

pub fn is_builtin_demo(id: &str) -> bool {
    id == DEMO_INSTANCE_ID
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionInstance {
    pub id: String,
    pub name: String,
    pub bastion_host: String,
    pub ssh_port: i64,
    pub ssh_user: String,
    pub pem_path: String,
    pub iam_credentials_path: String,
    pub region_name: String,
    pub cluster_name: String,
    pub namespace_default: Option<String>,
    pub sort_order: Option<i64>,
    pub is_favorite: bool,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(default)]
    pub is_builtin_demo: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvUpsertInput {
    pub id: Option<String>,
    pub name: String,
    pub bastion_host: String,
    pub ssh_port: i64,
    pub ssh_user: String,
    pub pem_path: String,
    pub iam_credentials_path: String,
    pub region_name: String,
    pub cluster_name: String,
    pub namespace_default: Option<String>,
    pub notes: Option<String>,
    pub is_favorite: Option<bool>,
    pub sort_order: Option<i64>,
}

const FORBIDDEN_BODY_MARKERS: &[&str] = &[
    "BEGIN ",
    "PRIVATE KEY",
    "AWS_SECRET",
    "aws_secret_access_key",
    "-----",
];

fn reject_secret_material(label: &str, value: &str) -> FaroResult<()> {
    let upper = value.to_uppercase();
    for marker in FORBIDDEN_BODY_MARKERS {
        if upper.contains(&marker.to_uppercase()) {
            return Err(FaroError::Message(format!(
                "{label} looks like secret content; store a filesystem path only"
            )));
        }
    }
    Ok(())
}

fn require_non_empty(label: &str, value: &str) -> FaroResult<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(FaroError::Message(format!("{label} is required")));
    }
    Ok(trimmed.to_string())
}

pub fn validate_upsert(input: &EnvUpsertInput) -> FaroResult<()> {
    if input.id.as_deref().is_some_and(is_builtin_demo) {
        return Err(FaroError::Message("the built-in demo environment cannot be edited".into()));
    }
    require_non_empty("name", &input.name)?;
    require_non_empty("bastion_host", &input.bastion_host)?;
    require_non_empty("ssh_user", &input.ssh_user)?;
    let pem = require_non_empty("pem_path", &input.pem_path)?;
    let iam = require_non_empty("iam_credentials_path", &input.iam_credentials_path)?;
    require_non_empty("region_name", &input.region_name)?;
    require_non_empty("cluster_name", &input.cluster_name)?;
    require_non_empty(
        "namespace_default",
        input.namespace_default.as_deref().unwrap_or(""),
    )?;
    if input.ssh_port <= 0 || input.ssh_port > 65535 {
        return Err(FaroError::Message("ssh_port must be 1–65535".into()));
    }
    reject_secret_material("pem_path", &pem)?;
    reject_secret_material("iam_credentials_path", &iam)?;
    if let Some(notes) = &input.notes {
        reject_secret_material("notes", notes)?;
    }
    Ok(())
}

fn map_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<ConnectionInstance> {
    let favorite: i64 = row.get(11)?;
    let id: String = row.get(0)?;
    Ok(ConnectionInstance {
        is_builtin_demo: is_builtin_demo(&id),
        id,
        name: row.get(1)?,
        bastion_host: row.get(2)?,
        ssh_port: row.get(3)?,
        ssh_user: row.get(4)?,
        pem_path: row.get(5)?,
        iam_credentials_path: row.get(6)?,
        region_name: row.get(7)?,
        cluster_name: row.get(8)?,
        namespace_default: row.get(9)?,
        sort_order: row.get(10)?,
        is_favorite: favorite != 0,
        notes: row.get(12)?,
        created_at: row.get(13)?,
        updated_at: row.get(14)?,
    })
}

const SELECT_COLS: &str = "id, name, bastion_host, ssh_port, ssh_user, pem_path, iam_credentials_path,
    region_name, cluster_name, namespace_default, sort_order, is_favorite, notes, created_at, updated_at";

/// Materialize the offline demo so it participates in normal workspace/list flows.
/// Its connection fields are placeholders and are never used.
pub fn ensure_demo(conn: &Connection) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT OR IGNORE INTO connection_instance (
            id, name, bastion_host, ssh_port, ssh_user, pem_path, iam_credentials_path,
            region_name, cluster_name, namespace_default, sort_order, is_favorite, notes,
            created_at, updated_at
         ) VALUES (?1, 'demo', 'offline', 22, 'offline', 'offline', 'offline',
                   'offline', 'demo', 'default', 0, 0, NULL, ?2, ?2)",
        params![DEMO_INSTANCE_ID, now],
    )?;
    Ok(())
}

pub fn list_all(conn: &Connection) -> FaroResult<Vec<ConnectionInstance>> {
    ensure_demo(conn)?;
    let mut stmt = conn.prepare(&format!(
        "SELECT {SELECT_COLS} FROM connection_instance
         ORDER BY CASE WHEN id = 'faro-demo' THEN 0 ELSE 1 END, COALESCE(sort_order, 999999), name"
    ))?;
    let rows = stmt.query_map([], map_row)?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn get_by_id(conn: &Connection, id: &str) -> FaroResult<Option<ConnectionInstance>> {
    if is_builtin_demo(id) {
        ensure_demo(conn)?;
    }
    let mut stmt = conn.prepare(&format!(
        "SELECT {SELECT_COLS} FROM connection_instance WHERE id = ?1"
    ))?;
    let row = stmt.query_row([id], map_row).optional()?;
    Ok(row)
}

pub fn upsert(conn: &Connection, input: EnvUpsertInput) -> FaroResult<ConnectionInstance> {
    validate_upsert(&input)?;
    let now = chrono::Utc::now().to_rfc3339();
    let id = input
        .id
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let name = input.name.trim().to_string();
    let bastion_host = input.bastion_host.trim().to_string();
    let ssh_user = input.ssh_user.trim().to_string();
    let pem_path = input.pem_path.trim().to_string();
    let iam_credentials_path = input.iam_credentials_path.trim().to_string();
    let region_name = input.region_name.trim().to_string();
    let cluster_name = input.cluster_name.trim().to_string();
    let namespace_default = input
        .namespace_default
        .as_ref()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    let notes = input
        .notes
        .as_ref()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    let is_favorite = if input.is_favorite.unwrap_or(false) {
        1
    } else {
        0
    };

    let existing = get_by_id(conn, &id)?;
    if let Some(prev) = existing {
        conn.execute(
            "UPDATE connection_instance SET
                name = ?1, bastion_host = ?2, ssh_port = ?3, ssh_user = ?4,
                pem_path = ?5, iam_credentials_path = ?6, region_name = ?7, cluster_name = ?8,
                namespace_default = ?9, sort_order = ?10, is_favorite = ?11, notes = ?12, updated_at = ?13
             WHERE id = ?14",
            params![
                name,
                bastion_host,
                input.ssh_port,
                ssh_user,
                pem_path,
                iam_credentials_path,
                region_name,
                cluster_name,
                namespace_default,
                input.sort_order.or(prev.sort_order),
                is_favorite,
                notes,
                now,
                id,
            ],
        )?;
    } else {
        conn.execute(
            "INSERT INTO connection_instance (
                id, name, bastion_host, ssh_port, ssh_user, pem_path, iam_credentials_path,
                region_name, cluster_name, namespace_default, sort_order, is_favorite, notes,
                created_at, updated_at
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?14)",
            params![
                id,
                name,
                bastion_host,
                input.ssh_port,
                ssh_user,
                pem_path,
                iam_credentials_path,
                region_name,
                cluster_name,
                namespace_default,
                input.sort_order,
                is_favorite,
                notes,
                now,
            ],
        )?;
    }

    get_by_id(conn, &id)?.ok_or_else(|| FaroError::Message("upsert failed to read back".into()))
}

pub fn delete_by_id(conn: &Connection, id: &str) -> FaroResult<()> {
    if is_builtin_demo(id) {
        return Err(FaroError::Message("the built-in demo environment cannot be deleted".into()));
    }
    let n = conn.execute("DELETE FROM connection_instance WHERE id = ?1", [id])?;
    if n == 0 {
        return Err(FaroError::Message(format!("environment not found: {id}")));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::DbState;
    use tempfile::tempdir;

    fn sample(name: &str) -> EnvUpsertInput {
        EnvUpsertInput {
            id: None,
            name: name.into(),
            bastion_host: "bastion.example".into(),
            ssh_port: 22,
            ssh_user: "ec2-user".into(),
            pem_path: r"C:\keys\demo.pem".into(),
            iam_credentials_path: r"C:\aws\creds".into(),
            region_name: "us-east-1".into(),
            cluster_name: "demo-cluster".into(),
            namespace_default: Some("default".into()),
            notes: None,
            is_favorite: None,
            sort_order: None,
        }
    }

    #[test]
    fn upsert_rejects_empty_paths() {
        let mut input = sample("a");
        input.pem_path = "  ".into();
        assert!(validate_upsert(&input).is_err());
    }

    #[test]
    fn upsert_rejects_pem_body() {
        let mut input = sample("a");
        input.pem_path = "-----BEGIN PRIVATE KEY-----\nabc".into();
        assert!(validate_upsert(&input).is_err());
    }

    #[test]
    fn crud_round_trip() {
        let dir = tempdir().unwrap();
        let db = DbState::open(dir.path().join("env.sqlite")).unwrap();
        let conn = db.conn.lock().unwrap();

        let a = upsert(&conn, sample("env-a")).unwrap();
        let b = upsert(&conn, sample("env-b")).unwrap();
        let list = list_all(&conn).unwrap();
        assert_eq!(list.len(), 3);
        assert_eq!(list[0].id, DEMO_INSTANCE_ID);

        let mut edit = sample("env-a-renamed");
        edit.id = Some(a.id.clone());
        edit.bastion_host = "bastion-2.example".into();
        let updated = upsert(&conn, edit).unwrap();
        assert_eq!(updated.bastion_host, "bastion-2.example");
        assert_eq!(updated.name, "env-a-renamed");

        delete_by_id(&conn, &b.id).unwrap();
        let list = list_all(&conn).unwrap();
        assert_eq!(list.len(), 2);
        assert_eq!(list[1].id, a.id);
    }

    #[test]
    fn namespace_is_required_and_demo_is_protected() {
        let mut input = sample("a");
        input.namespace_default = None;
        assert!(validate_upsert(&input).is_err());

        let dir = tempdir().unwrap();
        let db = DbState::open(dir.path().join("env.sqlite")).unwrap();
        let conn = db.conn.lock().unwrap();
        ensure_demo(&conn).unwrap();
        assert!(delete_by_id(&conn, DEMO_INSTANCE_ID).is_err());
    }
}
