//! Catalog hydrate helpers. Live environments never use demo data.

use crate::db::session_cache;
use crate::error::{FaroError, FaroResult};
use k8s_openapi::api::apps::v1::Deployment;
use k8s_openapi::api::core::v1::{ConfigMap, Pod, Service};
use kube::{Api, Client};
use rusqlite::Connection;
use serde_json::{json, Value};
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
        2,
        2,
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
        2,
        2,
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
    session_cache::insert_pod(
        conn,
        &Uuid::new_v4().to_string(),
        &dep_worker,
        "payments-worker-1",
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
    session_cache::insert_service(
        conn,
        &Uuid::new_v4().to_string(),
        instance_id,
        catalog_epoch,
        "default",
        "payments-api",
        Some("ClusterIP"),
        Some("10.96.0.10"),
        r#"[{"port":8080,"targetPort":"8080","protocol":"TCP"}]"#,
        r#"{"app":"payments-api"}"#,
    )?;

    let cm_secrets = Uuid::new_v4().to_string();
    session_cache::insert_configmap(
        conn,
        &cm_secrets,
        instance_id,
        catalog_epoch,
        "default",
        "payments-secrets",
        2,
        true,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_secrets,
        "db.url",
        "jdbc:postgresql://payments-db:5432/payments",
        false,
        false,
        48,
    )?;
    session_cache::insert_configmap_entry(
        conn,
        &Uuid::new_v4().to_string(),
        &cm_secrets,
        "api.token",
        "demo-token-not-real",
        false,
        false,
        18,
    )?;
    session_cache::insert_service(
        conn,
        &Uuid::new_v4().to_string(),
        instance_id,
        catalog_epoch,
        "default",
        "payments-worker",
        Some("ClusterIP"),
        Some("10.96.0.11"),
        r#"[{"port":9090,"targetPort":"9090","protocol":"TCP"}]"#,
        r#"{"app":"payments-worker"}"#,
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
        return Err(FaroError::Message(
            "namespace is required for a live catalog".into(),
        ));
    }
    let runtime = tokio::runtime::Runtime::new()
        .map_err(|_| FaroError::Message("unable to start Kubernetes task runtime".into()))?;
    let (deployments, pods, configmaps, services) = runtime.block_on(async {
        let deployments: Vec<Deployment> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default())
            .await
            .map_err(|e| kube_list_err("Deployments", namespace, &e))?
            .items;
        let pods: Vec<Pod> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default())
            .await
            .map_err(|e| kube_list_err("Pods", namespace, &e))?
            .items;
        let configmaps: Vec<ConfigMap> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default())
            .await
            .map_err(|e| kube_list_err("ConfigMaps", namespace, &e))?
            .items;
        let services: Vec<Service> = Api::namespaced(client.clone(), namespace)
            .list(&Default::default())
            .await
            .map_err(|e| kube_list_err("Services", namespace, &e))?
            .items;
        Ok::<_, FaroError>((deployments, pods, configmaps, services))
    })?;

    session_cache::purge_for_instance(conn, instance_id)?;
    session_cache::insert_namespace(
        conn,
        &Uuid::new_v4().to_string(),
        instance_id,
        catalog_epoch,
        namespace,
    )?;
    let mut deployment_ids = std::collections::HashMap::new();
    for deployment in deployments {
        let name = deployment.metadata.name.unwrap_or_default();
        let spec_replicas = deployment
            .spec
            .as_ref()
            .and_then(|s| s.replicas)
            .unwrap_or(0);
        let ready = deployment
            .status
            .as_ref()
            .and_then(|s| s.ready_replicas)
            .unwrap_or(0);
        let available = deployment
            .status
            .as_ref()
            .and_then(|s| s.available_replicas)
            .unwrap_or(0)
            > 0;
        let id = Uuid::new_v4().to_string();
        session_cache::insert_deployment(
            conn,
            &id,
            instance_id,
            catalog_epoch,
            namespace,
            &name,
            spec_replicas.into(),
            ready.into(),
            available,
        )?;
        deployment_ids.insert(name, id);
    }
    let unassigned_id = Uuid::new_v4().to_string();
    session_cache::insert_deployment(
        conn,
        &unassigned_id,
        instance_id,
        catalog_epoch,
        namespace,
        session_cache::UNASSIGNED_DEPLOYMENT,
        0,
        0,
        false,
    )?;
    for pod in pods {
        let name = pod.metadata.name.unwrap_or_default();
        let owner = pod
            .metadata
            .owner_references
            .as_ref()
            .and_then(|owners| owners.iter().find(|o| o.kind == "ReplicaSet"))
            .map(|o| {
                o.name
                    .rsplit_once('-')
                    .map_or(o.name.as_str(), |(deployment, _)| deployment)
                    .to_string()
            });
        let deployment_id = owner
            .and_then(|dep_name| deployment_ids.get(&dep_name).cloned())
            .unwrap_or_else(|| unassigned_id.clone());
        let phase = pod
            .status
            .as_ref()
            .and_then(|s| s.phase.as_deref())
            .unwrap_or("Unknown");
        let containers = pod
            .spec
            .as_ref()
            .map(|s| {
                s.containers
                    .iter()
                    .map(|c| c.name.clone())
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        let containers_json = serde_json::to_string(&containers).unwrap_or_else(|_| "[]".into());
        session_cache::insert_pod(
            conn,
            &Uuid::new_v4().to_string(),
            &deployment_id,
            &name,
            phase,
            &containers_json,
        )?;
    }
    for cm in configmaps {
        let name = cm.metadata.name.unwrap_or_default();
        let data = cm.data.unwrap_or_default();
        let cm_id = Uuid::new_v4().to_string();
        session_cache::insert_configmap(
            conn,
            &cm_id,
            instance_id,
            catalog_epoch,
            namespace,
            &name,
            data.len() as i64,
            true,
        )?;
        for (key, value) in data {
            let (value, truncated) = session_cache::truncate_value(&value, 32_768);
            session_cache::insert_configmap_entry(
                conn,
                &Uuid::new_v4().to_string(),
                &cm_id,
                &key,
                &value,
                truncated,
                false,
                value.len() as i64,
            )?;
        }
    }
    for svc in services {
        let name = svc.metadata.name.unwrap_or_default();
        let stype = svc.spec.as_ref().and_then(|s| s.type_.clone());
        let cluster_ip = svc.spec.as_ref().and_then(|s| s.cluster_ip.clone());
        let ports = svc
            .spec
            .as_ref()
            .and_then(|s| s.ports.as_ref())
            .map(|ports| {
                ports
                    .iter()
                    .map(|p| {
                        json!({
                            "port": p.port,
                            "targetPort": p.target_port.as_ref().map(|t| format!("{t:?}")),
                            "protocol": p.protocol,
                        })
                    })
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        let selector = svc
            .spec
            .as_ref()
            .and_then(|s| s.selector.clone())
            .unwrap_or_default();
        let ports_json = serde_json::to_string(&ports).unwrap_or_else(|_| "[]".into());
        let selector_json = serde_json::to_string(&selector).unwrap_or_else(|_| "{}".into());
        session_cache::insert_service(
            conn,
            &Uuid::new_v4().to_string(),
            instance_id,
            catalog_epoch,
            namespace,
            &name,
            stype.as_deref(),
            cluster_ip.as_deref(),
            &ports_json,
            &selector_json,
        )?;
    }
    Ok(())
}

fn kube_list_err(kind: &str, namespace: &str, err: &kube::Error) -> FaroError {
    let raw = err.to_string();
    let lower = raw.to_lowercase();
    let hint = if lower.contains("forbidden")
        || lower.contains("unauthorized")
        || lower.contains("401")
        || lower.contains("403")
    {
        " IAM/user may lack RBAC (get/list deployments) or aws-auth mapping for this cluster"
    } else if lower.contains("not found") || lower.contains("404") {
        " check that the namespace exists on the cluster"
    } else if lower.contains("timed out")
        || lower.contains("timeout")
        || lower.contains("connection")
        || lower.contains("tls")
    {
        " check bastion tunnel reachability to the EKS API"
    } else {
        ""
    };
    let detail = sanitize_kube_err(&raw);
    FaroError::Message(format!(
        "unable to list live {kind} in namespace '{namespace}' ({detail}){hint}"
    ))
}

fn sanitize_kube_err(raw: &str) -> String {
    let mut out = raw.replace('\r', " ").replace('\n', " ");
    for marker in ["Bearer ", "token:", "AKIA", "ASIA"] {
        if let Some(idx) = out.find(marker) {
            let end = (idx + marker.len() + 8).min(out.len());
            out.replace_range(idx..end, "[redacted]");
        }
    }
    let trimmed = out.trim();
    if trimmed.len() > 240 {
        format!("{}…", &trimmed[..240])
    } else {
        trimmed.to_string()
    }
}

pub fn get_live_configmap(client: &Client, namespace: &str, name: &str) -> FaroResult<Value> {
    let runtime = tokio::runtime::Runtime::new()
        .map_err(|_| FaroError::Message("unable to start Kubernetes task runtime".into()))?;
    let cm = runtime
        .block_on(Api::<ConfigMap>::namespaced(client.clone(), namespace).get(name))
        .map_err(|_| FaroError::Message("unable to get live ConfigMap".into()))?;
    let entries: Vec<Value> = cm
        .data
        .unwrap_or_default()
        .into_iter()
        .map(|(key, value)| {
            let (value_text, is_truncated) = session_cache::truncate_value(&value, 32_768);
            json!({
                "keyName": key,
                "valueText": value_text,
                "isTruncated": is_truncated,
                "isBinary": false,
                "byteLength": value.len(),
            })
        })
        .collect();
    Ok(json!({
        "id": format!("{namespace}/{name}"),
        "namespace": namespace,
        "name": name,
        "keyCount": entries.len(),
        "entries": entries,
    }))
}

/// Demo Deployment YAML fixtures (read-only).
pub fn demo_deployment_yaml(namespace: &str, name: &str) -> String {
    let replicas = 2;
    let (cpu_req, cpu_lim, mem_req, mem_lim) = if name == "payments-worker" {
        ("50m", "100m", "128Mi", "256Mi")
    } else {
        ("100m", "250m", "256Mi", "512Mi")
    };
    format!(
        r#"apiVersion: apps/v1
kind: Deployment
metadata:
  name: {name}
  namespace: {namespace}
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {name}
  template:
    metadata:
      labels:
        app: {name}
    spec:
      containers:
        - name: app
          image: example/{name}:latest
          resources:
            requests:
              cpu: {cpu_req}
              memory: {mem_req}
            limits:
              cpu: {cpu_lim}
              memory: {mem_lim}
status:
  readyReplicas: {replicas}
  replicas: {replicas}
"#
    )
}

/// Live get Deployment serialized as YAML.
pub fn get_live_deployment_yaml(
    client: &Client,
    namespace: &str,
    name: &str,
) -> FaroResult<String> {
    let runtime = tokio::runtime::Runtime::new()
        .map_err(|_| FaroError::Message("unable to start Kubernetes task runtime".into()))?;
    let dep = runtime
        .block_on(Api::<Deployment>::namespaced(client.clone(), namespace).get(name))
        .map_err(|_| FaroError::Message("unable to get Deployment".into()))?;
    serde_yaml::to_string(&dep)
        .map_err(|_| FaroError::Message("unable to serialize Deployment YAML".into()))
}

#[cfg(test)]
mod yaml_tests {
    use super::demo_deployment_yaml;

    #[test]
    fn demo_payments_api_yaml_non_empty() {
        let y = demo_deployment_yaml("default", "payments-api");
        assert!(y.contains("kind: Deployment"));
        assert!(y.contains("name: payments-api"));
        assert!(y.contains("256Mi"));
    }
}

#[cfg(test)]
mod hydrate_tests {
    use super::hydrate_demo_catalog;
    use crate::db::connection_instance::{self, EnvUpsertInput};
    use crate::db::DbState;
    use tempfile::tempdir;

    fn sample(name: &str) -> EnvUpsertInput {
        EnvUpsertInput {
            id: Some(name.into()),
            name: format!("Env {name}"),
            bastion_host: "bastion.example".into(),
            ssh_port: 22,
            ssh_user: "ec2-user".into(),
            pem_path: r"C:\keys\id.pem".into(),
            iam_credentials_path: r"C:\keys\iam.json".into(),
            region_name: "us-east-1".into(),
            cluster_name: "demo".into(),
            namespace_default: Some("default".into()),
            notes: None,
            is_favorite: None,
            sort_order: None,
        }
    }

    #[test]
    fn hydrate_demo_catalog_scopes_to_instance_id() {
        let dir = tempdir().unwrap();
        let db = DbState::open(dir.path().join("cat.sqlite")).unwrap();
        let conn = db.conn.lock().unwrap();
        connection_instance::upsert(&conn, sample("custom-fixture-env")).unwrap();
        let epoch = "epoch-1";
        hydrate_demo_catalog(&conn, "custom-fixture-env", epoch).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM cached_deployment WHERE connection_instance_id = ?1",
                ["custom-fixture-env"],
                |r| r.get(0),
            )
            .unwrap();
        assert!(count >= 2);
        let svc: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM cached_service WHERE connection_instance_id = ?1",
                ["custom-fixture-env"],
                |r| r.get(0),
            )
            .unwrap();
        assert!(svc >= 2);
        let cm: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM cached_configmap WHERE connection_instance_id = ?1",
                ["custom-fixture-env"],
                |r| r.get(0),
            )
            .unwrap();
        assert!(cm >= 2);
        let other: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM cached_deployment WHERE connection_instance_id = ?1",
                ["faro-demo"],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(other, 0);
    }
}
