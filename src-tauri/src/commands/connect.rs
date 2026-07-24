//! Connect / disconnect — SSH path validate + IAM file + catalog hydrate.

use crate::db::connection_instance;
use crate::db::session_cache;
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::k8s::{catalog, eks_auth};
use crate::runtime::RuntimeState;
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
    // src-tauri → repo root
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

    // Tear down any prior live connection first
    {
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        if let Some(prev) = rt.connected_instance_id.take() {
            if let Some(h) = rt.tunnel.take() {
                let _ = tunnel::close_tunnel(&h);
            }
            for (_, cancel) in rt.log_cancels.drain() {
                cancel.store(true, std::sync::atomic::Ordering::SeqCst);
            }
            session_cache::purge_for_instance(&conn, &prev)?;
        }
    }

    let handle = tunnel::open_tunnel(
        &env.bastion_host,
        env.ssh_port,
        &env.ssh_user,
        &env.pem_path,
    )?;
    let _presence = eks_auth::validate_iam_credentials_file(&env.iam_credentials_path)?;
    let _token = eks_auth::mint_eks_token_stub(&env.region_name, &env.cluster_name)?;
    // Drop token immediately — never persist
    drop(_token);

    let catalog_epoch = Uuid::new_v4().to_string();
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
    catalog::hydrate_catalog(&conn, &id, &catalog_epoch)?;

    {
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        rt.connected_instance_id = Some(id.clone());
        rt.catalog_epoch = Some(catalog_epoch.clone());
        rt.tunnel = Some(handle);
    }

    Ok(json!(ConnectResult {
        status: "connected".into(),
        cluster_name: env.cluster_name,
        catalog_epoch,
    }))
}

#[tauri::command]
pub fn env_disconnect(
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
) -> FaroResult<()> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    let mut rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;

    for (_, cancel) in rt.log_cancels.drain() {
        cancel.store(true, std::sync::atomic::Ordering::SeqCst);
    }
    if let Some(h) = rt.tunnel.take() {
        tunnel::close_tunnel(&h)?;
    }
    if let Some(id) = rt.connected_instance_id.take() {
        session_cache::purge_for_instance(&conn, &id)?;
    }
    rt.catalog_epoch = None;
    Ok(())
}
