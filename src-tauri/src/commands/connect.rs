//! Connect / disconnect — SSH path validate + IAM file + catalog hydrate.
//! Multi-session: connecting B does not disconnect A.

use crate::db::connection_instance;
use crate::db::session_cache;
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::k8s::{catalog, eks_auth};
use crate::runtime::{ConnectMode, RuntimeState, SessionEntry};
use crate::ssh::tunnel;
use serde::Serialize;
use serde_json::{json, Value};
use std::path::PathBuf;
use tauri::State;
use uuid::Uuid;

/// Resolve absolute paths to repo `fixtures/` demo files (offline connect).
#[tauri::command]
pub fn demo_fixture_paths() -> FaroResult<Value> {
    let mut bases = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        bases.push(cwd.clone());
        if let Some(parent) = cwd.parent() {
            bases.push(parent.to_path_buf());
        }
    }
    bases.push(PathBuf::from(".."));
    bases.push(PathBuf::from("."));
    for base in bases {
        let pem = base.join("fixtures").join("demo.pem");
        let iam = base.join("fixtures").join("demo-iam-credentials");
        if pem.is_file() && iam.is_file() {
            return Ok(json!({
                "pemPath": pem.canonicalize().unwrap_or(pem).to_string_lossy(),
                "iamCredentialsPath": iam.canonicalize().unwrap_or(iam).to_string_lossy(),
            }));
        }
    }
    Err(FaroError::Message(
        "demo fixtures not found — create fixtures/demo.pem and fixtures/demo-iam-credentials"
            .into(),
    ))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    pub status: String,
    pub cluster_name: String,
    pub catalog_epoch: String,
    pub instance_id: String,
}

#[tauri::command]
pub fn env_connect(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    instance_id: Option<String>,
) -> FaroResult<Value> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;

    let id = match instance_id {
        Some(id) if !id.trim().is_empty() => id,
        _ => session_cache::require_active_instance(&conn)?,
    };

    let env = connection_instance::get_by_id(&conn, &id)?.ok_or_else(|| {
        FaroError::Message("environment not found — load it before connecting".into())
    })?;

    // Tear down only this instance if reconnecting; leave other sessions alone
    {
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        if let Some(mut prev) = rt.sessions.remove(&id) {
            if let Some(mut h) = prev.tunnel.take() {
                let _ = tunnel::close_tunnel(&mut h);
            }
            for (_, cancel) in prev.log_cancels.drain() {
                cancel.store(true, std::sync::atomic::Ordering::SeqCst);
            }
            session_cache::purge_for_instance(&conn, &id)?;
        }
    }

    let catalog_epoch = Uuid::new_v4().to_string();
    let (mode, handle, client, namespace) = if connection_instance::is_builtin_demo(&id) {
        catalog::hydrate_demo_catalog(&conn, &id, &catalog_epoch)?;
        (ConnectMode::Demo, None, None, None)
    } else {
        let namespace = env.namespace_default.clone().filter(|v| !v.trim().is_empty())
            .ok_or_else(|| FaroError::Message("namespace_default is required for live environments".into()))?;
        eks_auth::validate_iam_credentials_file(&env.iam_credentials_path)?;
        let (api_host, ca_b64) = eks_auth::describe_cluster_endpoint(
            &env.region_name, &env.cluster_name, &env.iam_credentials_path,
        )?;
        let mut handle = tunnel::open_tunnel(
            &env.bastion_host, env.ssh_port, &env.ssh_user, &env.pem_path, &api_host,
        )?;
        let result = (|| {
            let token = eks_auth::mint_eks_token(
                &env.region_name, &env.cluster_name, &env.iam_credentials_path,
            )?;
            let client = crate::k8s::client::build_client(handle.local_port, &ca_b64, &token)?;
            catalog::hydrate_live_catalog(&conn, &id, &catalog_epoch, &namespace, &client)?;
            Ok::<_, FaroError>(client)
        })();
        match result {
            Ok(client) => (ConnectMode::Live, Some(handle), Some(client), Some(namespace)),
            Err(error) => {
                let _ = tunnel::close_tunnel(&mut handle);
                return Err(error);
            }
        }
    };

    let session_id = Uuid::new_v4().to_string();
    session_cache::insert_session(
        &conn,
        &session_id,
        &id,
        "connected",
        &catalog_epoch,
        None,
        None,
    )?;
    {
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        rt.sessions.insert(
            id.clone(),
            SessionEntry {
                catalog_epoch: Some(catalog_epoch.clone()),
                tunnel: handle,
                mode,
                client,
                namespace,
                log_cancels: Default::default(),
            },
        );
        rt.focused_instance_id = Some(id.clone());
    }

    Ok(json!(ConnectResult {
        status: "connected".into(),
        cluster_name: env.cluster_name,
        catalog_epoch,
        instance_id: id,
    }))
}

#[tauri::command]
pub fn env_disconnect(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    instance_id: Option<String>,
) -> FaroResult<()> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let mut rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;

    let id = match instance_id {
        Some(id) if !id.trim().is_empty() => id,
        _ => rt
            .focused_instance_id
            .clone()
            .ok_or_else(|| FaroError::Message("not connected".into()))?,
    };

    if let Some(mut entry) = rt.sessions.remove(&id) {
        for (_, cancel) in entry.log_cancels.drain() {
            cancel.store(true, std::sync::atomic::Ordering::SeqCst);
        }
        if let Some(mut h) = entry.tunnel.take() {
            tunnel::close_tunnel(&mut h)?;
        }
        session_cache::purge_for_instance(&conn, &id)?;
    }

    if rt.focused_instance_id.as_deref() == Some(id.as_str()) {
        rt.focused_instance_id = rt.sessions.keys().next().cloned();
    }
    Ok(())
}

#[tauri::command]
pub fn env_connection_states(runtime: State<'_, RuntimeState>) -> FaroResult<Value> {
    let rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    let list: Vec<Value> = rt
        .sessions
        .keys()
        .map(|instance_id| {
            json!({
                "instanceId": instance_id,
                "status": "connected",
            })
        })
        .collect();
    Ok(json!(list))
}
