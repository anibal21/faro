//! Catalog IPC — read session cache + refresh.

use crate::db::session_cache::{self, ConfigMapEntryRow, ConfigMapRow, DeploymentRow};
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::k8s::catalog;
use crate::runtime::RuntimeState;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogRefreshResult {
    pub catalog_epoch: String,
}

#[tauri::command]
pub fn k8s_list_deployments(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    namespace: Option<String>,
    name_filter: Option<String>,
) -> FaroResult<Vec<DeploymentRow>> {
    let _ = namespace;
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    session_cache::list_deployments(&conn, &instance_id, name_filter.as_deref())
}

#[tauri::command]
pub fn k8s_list_configmaps(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    namespace: Option<String>,
) -> FaroResult<Vec<ConfigMapRow>> {
    let _ = namespace;
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    session_cache::list_configmaps(&conn, &instance_id)
}

#[tauri::command]
pub fn k8s_get_configmap(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    namespace: String,
    name: String,
) -> FaroResult<Value> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    let maps = session_cache::list_configmaps(&conn, &instance_id)?;
    let cm = maps
        .into_iter()
        .find(|m| m.namespace == namespace && m.name == name)
        .ok_or_else(|| FaroError::Message("ConfigMap not found in session cache".into()))?;
    let entries: Vec<ConfigMapEntryRow> = session_cache::get_configmap_entries(&conn, &cm.id)?;
    Ok(json!({
        "id": cm.id,
        "namespace": cm.namespace,
        "name": cm.name,
        "keyCount": cm.key_count,
        "entries": entries,
    }))
}

#[tauri::command]
pub fn catalog_refresh(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
) -> FaroResult<CatalogRefreshResult> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    let catalog_epoch = Uuid::new_v4().to_string();
    catalog::hydrate_catalog(&conn, &instance_id, &catalog_epoch)?;
    {
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        if let Some(entry) = rt.sessions.get_mut(&instance_id) {
            entry.catalog_epoch = Some(catalog_epoch.clone());
        }
    }
    Ok(CatalogRefreshResult { catalog_epoch })
}

fn connected_instance(runtime: &State<'_, RuntimeState>) -> FaroResult<String> {
    let rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    rt.focused_instance_id.clone().ok_or_else(|| {
        FaroError::Message("not connected — use Ambiente → Conectar first".into())
    })
}
