//! Session-cache writers/readers.

use crate::error::{FaroError, FaroResult};
use rusqlite::{params, Connection};
use serde::Serialize;

pub fn purge_for_instance(conn: &Connection, instance_id: &str) -> FaroResult<()> {
    // Order matters for FKs
    conn.execute(
        "DELETE FROM cached_configmap_entry WHERE cached_configmap_id IN (
            SELECT id FROM cached_configmap WHERE connection_instance_id = ?1
         )",
        [instance_id],
    )?;
    conn.execute(
        "DELETE FROM cached_pod_replica WHERE cached_deployment_id IN (
            SELECT id FROM cached_deployment WHERE connection_instance_id = ?1
         )",
        [instance_id],
    )?;
    conn.execute(
        "DELETE FROM cached_configmap WHERE connection_instance_id = ?1",
        [instance_id],
    )?;
    conn.execute(
        "DELETE FROM cached_deployment WHERE connection_instance_id = ?1",
        [instance_id],
    )?;
    conn.execute(
        "DELETE FROM cached_namespace WHERE connection_instance_id = ?1",
        [instance_id],
    )?;
    conn.execute(
        "DELETE FROM connection_session WHERE connection_instance_id = ?1",
        [instance_id],
    )?;
    Ok(())
}

pub fn insert_session(
    conn: &Connection,
    id: &str,
    instance_id: &str,
    status: &str,
    catalog_epoch: &str,
    error_code: Option<&str>,
    error_message: Option<&str>,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO connection_session (
            id, connection_instance_id, status, connected_at, last_catalog_refresh_at,
            last_error_code, last_error_message, catalog_epoch
         ) VALUES (?1,?2,?3,?4,?4,?5,?6,?7)",
        params![
            id,
            instance_id,
            status,
            now,
            error_code,
            error_message,
            catalog_epoch
        ],
    )?;
    Ok(())
}

pub fn insert_namespace(
    conn: &Connection,
    id: &str,
    instance_id: &str,
    epoch: &str,
    name: &str,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cached_namespace (id, connection_instance_id, catalog_epoch, name, fetched_at)
         VALUES (?1,?2,?3,?4,?5)",
        params![id, instance_id, epoch, name, now],
    )?;
    Ok(())
}

pub fn insert_deployment(
    conn: &Connection,
    id: &str,
    instance_id: &str,
    epoch: &str,
    namespace: &str,
    name: &str,
    replicas: i64,
    ready: i64,
    available: bool,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cached_deployment (
            id, connection_instance_id, catalog_epoch, namespace, name,
            replica_count, ready_replicas, available, labels_json, fetched_at
         ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,NULL,?9)",
        params![
            id,
            instance_id,
            epoch,
            namespace,
            name,
            replicas,
            ready,
            if available { 1 } else { 0 },
            now
        ],
    )?;
    Ok(())
}

pub fn insert_pod(
    conn: &Connection,
    id: &str,
    deployment_id: &str,
    pod_name: &str,
    phase: &str,
    containers_json: &str,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cached_pod_replica (
            id, cached_deployment_id, pod_name, phase, node_name, container_names_json, fetched_at
         ) VALUES (?1,?2,?3,?4,NULL,?5,?6)",
        params![id, deployment_id, pod_name, phase, containers_json, now],
    )?;
    Ok(())
}

pub fn insert_configmap(
    conn: &Connection,
    id: &str,
    instance_id: &str,
    epoch: &str,
    namespace: &str,
    name: &str,
    key_count: i64,
    data_loaded: bool,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cached_configmap (
            id, connection_instance_id, catalog_epoch, namespace, name, key_count, data_loaded, fetched_at
         ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        params![
            id,
            instance_id,
            epoch,
            namespace,
            name,
            key_count,
            if data_loaded { 1 } else { 0 },
            now
        ],
    )?;
    Ok(())
}

pub fn insert_configmap_entry(
    conn: &Connection,
    id: &str,
    cm_id: &str,
    key: &str,
    value: &str,
    truncated: bool,
    binary: bool,
    byte_length: i64,
) -> FaroResult<()> {
    conn.execute(
        "INSERT INTO cached_configmap_entry (
            id, cached_configmap_id, key_name, value_text, is_truncated, is_binary, byte_length
         ) VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![
            id,
            cm_id,
            key,
            value,
            if truncated { 1 } else { 0 },
            if binary { 1 } else { 0 },
            byte_length
        ],
    )?;
    Ok(())
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeploymentRow {
    pub id: String,
    pub namespace: String,
    pub name: String,
    pub replica_count: i64,
    pub ready_replicas: i64,
    pub available: bool,
    pub pods: Vec<PodRow>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PodRow {
    pub pod_name: String,
    pub phase: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigMapRow {
    pub id: String,
    pub namespace: String,
    pub name: String,
    pub key_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigMapEntryRow {
    pub key_name: String,
    pub value_text: Option<String>,
    pub is_truncated: bool,
    pub is_binary: bool,
    pub byte_length: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceRow {
    pub id: String,
    pub namespace: String,
    pub name: String,
    pub service_type: Option<String>,
    pub cluster_ip: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceDetail {
    pub id: String,
    pub namespace: String,
    pub name: String,
    pub service_type: Option<String>,
    pub cluster_ip: Option<String>,
    pub ports_json: Option<String>,
    pub selector_json: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FlatPodRow {
    pub id: String,
    pub namespace: String,
    pub pod_name: String,
    pub phase: String,
    pub deployment_name: Option<String>,
}

pub const UNASSIGNED_DEPLOYMENT: &str = "__unassigned__";

pub fn insert_service(
    conn: &Connection,
    id: &str,
    instance_id: &str,
    epoch: &str,
    namespace: &str,
    name: &str,
    service_type: Option<&str>,
    cluster_ip: Option<&str>,
    ports_json: &str,
    selector_json: &str,
) -> FaroResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cached_service (
            id, connection_instance_id, catalog_epoch, namespace, name,
            service_type, cluster_ip, ports_json, selector_json, fetched_at
         ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
        params![
            id,
            instance_id,
            epoch,
            namespace,
            name,
            service_type,
            cluster_ip,
            ports_json,
            selector_json,
            now
        ],
    )?;
    Ok(())
}

pub fn list_services(conn: &Connection, instance_id: &str) -> FaroResult<Vec<ServiceRow>> {
    let mut stmt = conn.prepare(
        "SELECT id, namespace, name, service_type, cluster_ip FROM cached_service
         WHERE connection_instance_id = ?1 ORDER BY namespace, name",
    )?;
    let rows = stmt.query_map([instance_id], |row| {
        Ok(ServiceRow {
            id: row.get(0)?,
            namespace: row.get(1)?,
            name: row.get(2)?,
            service_type: row.get(3)?,
            cluster_ip: row.get(4)?,
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn get_service(
    conn: &Connection,
    instance_id: &str,
    namespace: &str,
    name: &str,
) -> FaroResult<Option<ServiceDetail>> {
    let mut stmt = conn.prepare(
        "SELECT id, namespace, name, service_type, cluster_ip, ports_json, selector_json
         FROM cached_service
         WHERE connection_instance_id = ?1 AND namespace = ?2 AND name = ?3",
    )?;
    let mut rows = stmt.query(params![instance_id, namespace, name])?;
    if let Some(row) = rows.next()? {
        Ok(Some(ServiceDetail {
            id: row.get(0)?,
            namespace: row.get(1)?,
            name: row.get(2)?,
            service_type: row.get(3)?,
            cluster_ip: row.get(4)?,
            ports_json: row.get(5)?,
            selector_json: row.get(6)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn list_all_pods(conn: &Connection, instance_id: &str) -> FaroResult<Vec<FlatPodRow>> {
    let mut stmt = conn.prepare(
        "SELECT p.id, d.namespace, p.pod_name, p.phase, d.name
         FROM cached_pod_replica p
         JOIN cached_deployment d ON d.id = p.cached_deployment_id
         WHERE d.connection_instance_id = ?1
         ORDER BY d.namespace, p.pod_name",
    )?;
    let rows = stmt.query_map([instance_id], |row| {
        let dep_name: String = row.get(4)?;
        Ok(FlatPodRow {
            id: row.get(0)?,
            namespace: row.get(1)?,
            pod_name: row.get(2)?,
            phase: row.get(3)?,
            deployment_name: if dep_name == UNASSIGNED_DEPLOYMENT {
                None
            } else {
                Some(dep_name)
            },
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn list_deployments(
    conn: &Connection,
    instance_id: &str,
    name_filter: Option<&str>,
) -> FaroResult<Vec<DeploymentRow>> {
    let mut stmt = conn.prepare(
        "SELECT id, namespace, name, replica_count, ready_replicas, available
         FROM cached_deployment WHERE connection_instance_id = ?1
         ORDER BY namespace, name",
    )?;
    let rows = stmt.query_map([instance_id], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, i64>(4)?,
            row.get::<_, i64>(5)?,
        ))
    })?;
    let mut out = Vec::new();
    for row in rows {
        let (id, namespace, name, replica_count, ready_replicas, available) = row?;
        if name == UNASSIGNED_DEPLOYMENT {
            continue;
        }
        if let Some(f) = name_filter {
            if !name.to_lowercase().contains(&f.to_lowercase()) {
                continue;
            }
        }
        let pods = list_pods(conn, &id)?;
        out.push(DeploymentRow {
            id,
            namespace,
            name,
            replica_count,
            ready_replicas,
            available: available != 0,
            pods,
        });
    }
    Ok(out)
}

fn list_pods(conn: &Connection, deployment_id: &str) -> FaroResult<Vec<PodRow>> {
    let mut stmt = conn.prepare(
        "SELECT pod_name, phase FROM cached_pod_replica WHERE cached_deployment_id = ?1",
    )?;
    let rows = stmt.query_map([deployment_id], |row| {
        Ok(PodRow {
            pod_name: row.get(0)?,
            phase: row.get(1)?,
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn list_configmaps(conn: &Connection, instance_id: &str) -> FaroResult<Vec<ConfigMapRow>> {
    let mut stmt = conn.prepare(
        "SELECT id, namespace, name, key_count FROM cached_configmap
         WHERE connection_instance_id = ?1 ORDER BY namespace, name",
    )?;
    let rows = stmt.query_map([instance_id], |row| {
        Ok(ConfigMapRow {
            id: row.get(0)?,
            namespace: row.get(1)?,
            name: row.get(2)?,
            key_count: row.get(3)?,
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn get_configmap_entries(conn: &Connection, cm_id: &str) -> FaroResult<Vec<ConfigMapEntryRow>> {
    let mut stmt = conn.prepare(
        "SELECT key_name, value_text, is_truncated, is_binary, byte_length
         FROM cached_configmap_entry WHERE cached_configmap_id = ?1 ORDER BY key_name",
    )?;
    let rows = stmt.query_map([cm_id], |row| {
        let trunc: i64 = row.get(2)?;
        let bin: i64 = row.get(3)?;
        Ok(ConfigMapEntryRow {
            key_name: row.get(0)?,
            value_text: row.get(1)?,
            is_truncated: trunc != 0,
            is_binary: bin != 0,
            byte_length: row.get(4)?,
        })
    })?;
    let mut out = Vec::new();
    for row in rows {
        out.push(row?);
    }
    Ok(out)
}

pub fn truncate_value(value: &str, max_chars: usize) -> (String, bool) {
    if value.chars().count() <= max_chars {
        return (value.to_string(), false);
    }
    let truncated: String = value.chars().take(max_chars).collect();
    (format!("{truncated}…"), true)
}

pub fn active_instance_id(conn: &Connection) -> FaroResult<Option<String>> {
    use crate::db::workspace;
    Ok(workspace::get_state(conn)?.active_id)
}

pub fn require_active_instance(conn: &Connection) -> FaroResult<String> {
    active_instance_id(conn)?.ok_or_else(|| {
        FaroError::Message("no active environment — load and activate one first".into())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn truncates_long_values() {
        let (v, t) = truncate_value(&"x".repeat(100), 10);
        assert!(t);
        assert!(v.ends_with('…'));
        assert_eq!(v.chars().count(), 11);
    }
}
