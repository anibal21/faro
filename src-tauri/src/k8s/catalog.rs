//! Catalog hydrate helpers. Live environments never use demo data.

use crate::db::session_cache;
use crate::error::{FaroError, FaroResult};
use k8s_openapi::api::apps::v1::Deployment;
use k8s_openapi::api::core::v1::{ConfigMap, Pod};
use kube::{Api, Client};
use serde_json::{json, Value};
use rusqlite::Connection;
use uuid::Uuid;

/// Seed a realistic demo catalog into session tables for offline MVP demos.
pub fn hydrate_demo_catalog(
    conn: &Connection,
    instance_id: &str,
    catalog_epoch: &str,
) -> FaroResult<()> {
    session_cache::purge_for_instance(conn, instance_id)?;
    let ns_id = Uuid::new_v4().to_string();
    session_cache::insert_namespace(conn, &ns_id, instance_id, catalog_epoch, "default")?;

    let dep_api = Uuid::new_v4().to_string();
    session_cache::insert_deployment(
        conn,
        &dep_api,
        instance_id,
        catalog_epoch,
        "default",
        "payments-api",
        3,
        3,
        true,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_api,
        "payments-api-7d9f8b-aaa",
        "Running",
        r#"["app"]"#,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_api,
        "payments-api-7d9f8b-bbb",
        "Running",
        r#"["app"]"#,
    )?;

    let dep_worker = Uuid::new_v4().to_string();
    session_cache::insert_deployment(
        conn,
        &dep_worker,
        instance_id,
        catalog_epoch,
        "default",
        "payments-worker",
        1,
        1,
        true,
    )?;
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_worker,
        "payments-worker-0",
        "Running",
        r#"["worker"]"#,
    )?;

    let cm_id = Uuid::new_v4().to_string();
    session_cache::insert_configmap(
        conn,
        &cm_id,
        instance_id,
        catalog_epoch,
        "default",
        "payments-config",
        2,
        true,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_id,
        "application.yml",
        "server:\n  port: 8080\nspring:\n  profiles: active: prod\n",
        false,
        false,
        64,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_id,
        "feature.flags",
        "payments.v2=true",
        false,
        false,
        16,
    )?;
    Ok(())
}

pub fn hydrate_live_catalog(
    conn: &Connection,
    instance_id: &str,
    catalog_epoch: &str,
    namespace: &str,
    client: &Client,
) -> FaroResult<()> {
    let namespace = namespace.trim();
    if namespace.is_empty() {
        return Err(FaroError::Message("namespace is required for a live catalog".into()));
    }
    let runtime = tokio::runtime::Runtime::new()
        .map_err(|_| FaroError::Message("unable to start Kubernetes task runtime".into()))?;
    let (deployments, pods, configmaps) = runtime.block_on(async {
        let deployments: Vec<Deployment> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default()).await.map_err(|_| FaroError::Message("unable to list live deployments".into()))?
            .items;
        let pods: Vec<Pod> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default()).await.map_err(|_| FaroError::Message("unable to list live pods".into()))?
            .items;
        let configmaps: Vec<ConfigMap> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default()).await.map_err(|_| FaroError::Message("unable to list live ConfigMaps".into()))?
            .items;
        Ok::<_, FaroError>((deployments, pods, configmaps))
    })?;

    session_cache::purge_for_instance(conn, instance_id)?;
    session_cache::insert_namespace(conn, &Uuid::new_v4().to_string(), instance_id, catalog_epoch, namespace)?;
    let mut deployment_ids = std::collections::HashMap::new();
    for deployment in deployments {
        let name = deployment.metadata.name.unwrap_or_default();
        let spec_replicas = deployment.spec.as_ref().and_then(|s| s.replicas).unwrap_or(0);
        let ready = deployment.status.as_ref().and_then(|s| s.ready_replicas).unwrap_or(0);
        let available = deployment.status.as_ref().and_then(|s| s.available_replicas).unwrap_or(0) > 0;
        let id = Uuid::new_v4().to_string();
        session_cache::insert_deployment(conn, &id, instance_id, catalog_epoch, namespace, &name, spec_replicas.into(), ready.into(), available)?;
        deployment_ids.insert(name, id);
    }
    for pod in pods {
        let name = pod.metadata.name.unwrap_or_default();
        let owner = pod.metadata.owner_references.as_ref()
            .and_then(|owners| owners.iter().find(|o| o.kind == "ReplicaSet"))
            .map(|o| o.name.rsplit_once('-').map_or(o.name.as_str(), |(deployment, _)| deployment).to_string());
        if let Some(deployment) = owner.and_then(|name| deployment_ids.get(&name).cloned()) {
            let phase = pod.status.as_ref().and_then(|s| s.phase.as_deref()).unwrap_or("Unknown");
            let containers = pod.spec.as_ref().map(|s| s.containers.iter().map(|c| c.name.clone()).collect::<Vec<_>>()).unwrap_or_default();
            let containers_json = serde_json::to_string(&containers).unwrap_or_else(|_| "[]".into());
            session_cache::insert_pod(conn, &Uuid::new_v4().to_string(), &deployment, &name, phase, &containers_json)?;
        }
    }
    for cm in configmaps {
        let name = cm.metadata.name.unwrap_or_default();
        let data = cm.data.unwrap_or_default();
        let cm_id = Uuid::new_v4().to_string();
        session_cache::insert_configmap(conn, &cm_id, instance_id, catalog_epoch, namespace, &name, data.len() as i64, true)?;
        for (key, value) in data {
            let (value, truncated) = session_cache::truncate_value(&value, 32_768);
            session_cache::insert_configmap_entry(conn, &Uuid::new_v4().to_string(), &cm_id, &key, &value, truncated, false, value.len() as i64)?;
        }
    }
    Ok(())
}

pub fn get_live_configmap(client: &Client, namespace: &str, name: &str) -> FaroResult<Value> {
    let runtime = tokio::runtime::Runtime::new()
        .map_err(|_| FaroError::Message("unable to start Kubernetes task runtime".into()))?;
    let cm = runtime.block_on(Api::<ConfigMap>::namespaced(client.clone(), namespace).get(name))
        .map_err(|_| FaroError::Message("unable to get live ConfigMap".into()))?;
    let entries: Vec<Value> = cm.data.unwrap_or_default().into_iter().map(|(key, value)| {
        let (value_text, is_truncated) = session_cache::truncate_value(&value, 32_768);
        json!({
            "keyName": key,
            "valueText": value_text,
            "isTruncated": is_truncated,
            "isBinary": false,
            "byteLength": value.len(),
        })
    }).collect();
    Ok(json!({
        "id": format!("{namespace}/{name}"),
        "namespace": namespace,
        "name": name,
        "keyCount": entries.len(),
        "entries": entries,
    }))
}
