//! Catalog IPC — read session cache + refresh.

use crate::db::session_cache::{
    self, ConfigMapEntryRow, ConfigMapRow, DeploymentRow, FlatPodRow, ServiceDetail, ServiceRow,
};
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::k8s::catalog;
use crate::runtime::{ConnectMode, RuntimeState};
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
pub fn k8s_list_pods(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
) -> FaroResult<Vec<FlatPodRow>> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    session_cache::list_all_pods(&conn, &instance_id)
}

#[tauri::command]
pub fn k8s_list_services(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
) -> FaroResult<Vec<ServiceRow>> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    session_cache::list_services(&conn, &instance_id)
}

#[tauri::command]
pub fn k8s_get_service(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    namespace: String,
    name: String,
) -> FaroResult<ServiceDetail> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let instance_id = connected_instance(&runtime)?;
    session_cache::get_service(&conn, &instance_id, &namespace, &name)?
        .ok_or_else(|| FaroError::Message("Service not found in session cache".into()))
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
    let live_client = {
        let rt = runtime.inner.lock().map_err(|_| FaroError::Message("runtime lock".into()))?;
        rt.sessions.get(&instance_id).and_then(|entry| {
            (entry.mode == ConnectMode::Live).then(|| entry.client.clone()).flatten()
        })
    };
    if let Some(client) = live_client {
        return catalog::get_live_configmap(&client, &namespace, &name);
    }
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
pub fn k8s_get_deployment_yaml(
    runtime: State<'_, RuntimeState>,
    namespace: String,
    name: String,
) -> FaroResult<Value> {
    let instance_id = connected_instance(&runtime)?;
    let (mode, client) = {
        let rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        let entry = rt
            .sessions
            .get(&instance_id)
            .ok_or_else(|| FaroError::Message("not connected".into()))?;
        (entry.mode, entry.client.clone())
    };
    let yaml_text = match mode {
        ConnectMode::Demo => catalog::demo_deployment_yaml(&namespace, &name),
        ConnectMode::Live => {
            let client = client.ok_or_else(|| {
                FaroError::Message("live Kubernetes session unavailable".into())
            })?;
            catalog::get_live_deployment_yaml(&client, &namespace, &name)?
        }
    };
    Ok(json!({
        "namespace": namespace,
        "name": name,
        "yamlText": yaml_text,
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
    let (mode, client, namespace) = {
        let rt = runtime.inner.lock().map_err(|_| FaroError::Message("runtime lock".into()))?;
        let entry = rt.sessions.get(&instance_id)
            .ok_or_else(|| FaroError::Message("not connected".into()))?;
        (entry.mode, entry.client.clone(), entry.namespace.clone())
    };
    match mode {
        ConnectMode::Demo => catalog::hydrate_demo_catalog(&conn, &instance_id, &catalog_epoch)?,
        ConnectMode::Live => {
            let client = client.ok_or_else(|| FaroError::Message("live Kubernetes session unavailable".into()))?;
            let namespace = namespace.ok_or_else(|| FaroError::Message("live namespace unavailable".into()))?;
            catalog::hydrate_live_catalog(&conn, &instance_id, &catalog_epoch, &namespace, &client)?;
        }
    }
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
