//! Connect / disconnect — PEM + bastion describe/token + catalog hydrate.
//! Multi-session: connecting B does not disconnect A.
//! Live connect runs on a blocking worker (Windows WebView2 must not block UI IPC).

use crate::db::connection_instance;
use crate::db::session_cache;
use crate::db::workspace;
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::k8s::{catalog, eks_auth};
use crate::keepalive;
use crate::runtime::{ConnectMode, RuntimeState, SessionEntry, SessionHealth};
use crate::ssh::tunnel;
use serde::Serialize;
use serde_json::{json, Value};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};
use uuid::Uuid;

pub const MAX_CONNECTIONS: usize = 2;

fn ensure_connection_capacity(
    sessions: &std::collections::HashMap<String, SessionEntry>,
    instance_id: &str,
) -> FaroResult<()> {
    if !sessions.contains_key(instance_id) && sessions.len() >= MAX_CONNECTIONS {
        return Err(FaroError::Message(
            "connection_limit: Solo puedes tener dos ambientes conectados a la vez.".into(),
        ));
    }
    Ok(())
}

/// Resolve absolute paths to bundled or repo `fixtures/` demo files (offline connect helpers).
pub fn resolve_demo_fixture_paths(app: &AppHandle) -> FaroResult<Value> {
    let mut fixture_dirs: Vec<PathBuf> = Vec::new();
    if let Ok(resource_dir) = app.path().resource_dir() {
        fixture_dirs.push(resource_dir.join("fixtures"));
    }
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    fixture_dirs.push(manifest.join("..").join("fixtures"));
    if let Ok(cwd) = std::env::current_dir() {
        fixture_dirs.push(cwd.join("fixtures"));
        if let Some(parent) = cwd.parent() {
            fixture_dirs.push(parent.join("fixtures"));
        }
    }
    fixture_dirs.push(PathBuf::from("fixtures"));
    fixture_dirs.push(PathBuf::from("../fixtures"));

    for dir in fixture_dirs {
        let pem = dir.join("demo.pem");
        if pem.is_file() {
            let iam = dir.join("demo-iam-credentials");
            return Ok(json!({
                "pemPath": pem.canonicalize().unwrap_or(pem).to_string_lossy(),
                "iamCredentialsPath": if iam.is_file() {
                    iam.canonicalize().unwrap_or(iam).to_string_lossy().to_string()
                } else {
                    String::new()
                },
            }));
        }
    }
    Err(FaroError::Message(
        "demo fixtures not found — create fixtures/demo.pem".into(),
    ))
}

#[tauri::command]
pub fn demo_fixture_paths(app: AppHandle) -> FaroResult<Value> {
    resolve_demo_fixture_paths(&app)
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
pub async fn env_connect(app: AppHandle, instance_id: Option<String>) -> FaroResult<Value> {
    tauri::async_runtime::spawn_blocking(move || env_connect_blocking(&app, instance_id))
        .await
        .map_err(|_| FaroError::Message("connect worker failed unexpectedly".into()))?
}

fn env_connect_blocking(app: &AppHandle, instance_id: Option<String>) -> FaroResult<Value> {
    let db = app.state::<DbState>();
    let runtime = app.state::<RuntimeState>();

    let id = {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        match instance_id {
            Some(id) if !id.trim().is_empty() => id,
            _ => session_cache::require_active_instance(&conn)?,
        }
    };

    {
        let rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        ensure_connection_capacity(&rt.sessions, &id)?;
    }

    let env = {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        connection_instance::get_by_id(&conn, &id)?.ok_or_else(|| {
            FaroError::Message("environment not found — load it before connecting".into())
        })?
    };

    // Tear down only this instance if reconnecting; leave other sessions alone
    {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        let mut rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        if let Some(mut prev) = rt.sessions.remove(&id) {
            if let Some(c) = prev.keepalive_cancel.take() {
                c.store(true, std::sync::atomic::Ordering::SeqCst);
            }
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
    let (mode, handle, client, namespace) = if connection_instance::is_fixture_backed(&env) {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        catalog::hydrate_demo_catalog(&conn, &id, &catalog_epoch)?;
        (ConnectMode::Demo, None, None, None)
    } else {
        let namespace = env
            .namespace_default
            .clone()
            .filter(|v| !v.trim().is_empty())
            .ok_or_else(|| {
                FaroError::Message("namespace_default is required for live environments".into())
            })?;

        // Discovery + kube token via bastion identity — no laptop IAM file.
        let (api_host, ca_b64) = eks_auth::describe_cluster_endpoint_via_bastion(
            &env.bastion_host,
            env.ssh_port,
            &env.ssh_user,
            &env.pem_path,
            &env.region_name,
            &env.cluster_name,
        )?;
        let mut handle = tunnel::open_tunnel(
            &env.bastion_host,
            env.ssh_port,
            &env.ssh_user,
            &env.pem_path,
            &api_host,
        )?;
        let result = (|| {
            let token = eks_auth::mint_eks_token_via_bastion(
                &env.bastion_host,
                env.ssh_port,
                &env.ssh_user,
                &env.pem_path,
                &env.region_name,
                &env.cluster_name,
            )?;
            let client =
                crate::k8s::client::build_client(handle.local_port, &api_host, &ca_b64, &token)?;
            let conn = db
                .conn
                .lock()
                .map_err(|_| FaroError::Message("db lock".into()))?;
            catalog::hydrate_live_catalog(&conn, &id, &catalog_epoch, &namespace, &client)?;
            Ok::<_, FaroError>(client)
        })();
        match result {
            Ok(client) => (
                ConnectMode::Live,
                Some(handle),
                Some(client),
                Some(namespace),
            ),
            Err(error) => {
                let _ = tunnel::close_tunnel(&mut handle);
                return Err(error);
            }
        }
    };

    {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
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
    }
    let want_keepalive = {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        // 018: missing pref ⇒ ON; materialize true so later OFF is explicit
        match workspace::get_keepalive_pref_opt(&conn, &id)? {
            None => {
                if mode == ConnectMode::Live {
                    workspace::set_keepalive_pref(&conn, &id, true)?;
                }
                true
            }
            Some(v) => v,
        }
    };

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
                health: SessionHealth {
                    keep_alive: false,
                    status: "connected".into(),
                    last_pulse_at: None,
                    consecutive_failures: 0,
                },
                keepalive_cancel: None,
            },
        );
        rt.focused_instance_id = Some(id.clone());
    }

    if want_keepalive && mode == ConnectMode::Live {
        let _ = keepalive::start_loop(app.clone(), id.clone());
    }

    Ok(json!(ConnectResult {
        status: "connected".into(),
        cluster_name: env.cluster_name,
        catalog_epoch,
        instance_id: id,
    }))
}

#[cfg(test)]
mod connection_limit_tests {
    use super::*;

    fn session() -> SessionEntry {
        SessionEntry {
            catalog_epoch: None,
            tunnel: None,
            mode: ConnectMode::Demo,
            client: None,
            namespace: None,
            log_cancels: Default::default(),
            health: SessionHealth::default(),
            keepalive_cancel: None,
        }
    }

    #[test]
    fn rejects_third_distinct_session_but_allows_reconnect() {
        let mut sessions = std::collections::HashMap::new();
        sessions.insert("a".into(), session());
        sessions.insert("b".into(), session());
        assert!(ensure_connection_capacity(&sessions, "c").is_err());
        assert!(ensure_connection_capacity(&sessions, "a").is_ok());
    }
}

#[tauri::command]
pub fn env_focus(runtime: State<'_, RuntimeState>, instance_id: String) -> FaroResult<()> {
    let mut rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    if !rt.sessions.contains_key(&instance_id) {
        return Err(FaroError::Message("el ambiente no está conectado".into()));
    }
    rt.focused_instance_id = Some(instance_id);
    Ok(())
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
        if let Some(c) = entry.keepalive_cancel.take() {
            c.store(true, std::sync::atomic::Ordering::SeqCst);
        }
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
        .iter()
        .map(|(instance_id, entry)| {
            json!({
                "instanceId": instance_id,
                "status": entry.health.status,
                "keepAlive": entry.health.keep_alive,
                "lastPulseAt": entry.health.last_pulse_at,
                "mode": match entry.mode {
                    ConnectMode::Live => "live",
                    ConnectMode::Demo => "demo",
                },
            })
        })
        .collect();
    Ok(json!(list))
}

#[tauri::command]
pub fn env_set_keep_alive(
    app: AppHandle,
    db: State<'_, DbState>,
    runtime: State<'_, RuntimeState>,
    instance_id: String,
    enabled: bool,
) -> FaroResult<Value> {
    let id = instance_id.trim().to_string();
    if id.is_empty() {
        return Err(FaroError::Message("instanceId required".into()));
    }
    if connection_instance::is_builtin_demo(&id) {
        return Err(FaroError::Message(
            "keep-alive no aplica al ambiente demo".into(),
        ));
    }

    {
        let conn = db
            .conn
            .lock()
            .map_err(|_| FaroError::Message("db lock".into()))?;
        workspace::set_keepalive_pref(&conn, &id, enabled)?;
    }

    let mode = {
        let rt = runtime
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        rt.sessions.get(&id).map(|e| e.mode)
    };

    match (enabled, mode) {
        (true, Some(ConnectMode::Live)) => {
            keepalive::start_loop(app, id.clone())?;
        }
        (true, Some(ConnectMode::Demo)) => {
            return Err(FaroError::Message(
                "keep-alive no aplica al ambiente demo".into(),
            ));
        }
        (true, None) => {
            return Err(FaroError::Message(
                "conecta el ambiente live antes de activar keep-alive".into(),
            ));
        }
        (false, _) => {
            keepalive::stop_loop(&app, &id)?;
        }
    }

    Ok(json!({ "instanceId": id, "keepAlive": enabled }))
}
