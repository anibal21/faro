//! Live log window commands.

use crate::error::{FaroError, FaroResult};
use crate::k8s::logs;
use crate::runtime::RuntimeState;
use serde::Serialize;
use serde_json::{json, Value};
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tauri::{AppHandle, State};
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogsOpenResult {
    pub window_id: String,
}

#[tauri::command]
pub fn logs_open(
    app: AppHandle,
    runtime: State<'_, RuntimeState>,
    namespace: String,
    deployment: String,
) -> FaroResult<Value> {
    let _ = namespace;
    let mut rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    if rt.connected_instance_id.is_none() {
        return Err(FaroError::Message(
            "not connected — connect before opening logs".into(),
        ));
    }
    let window_id = Uuid::new_v4().to_string();
    let cancel = Arc::new(AtomicBool::new(false));
    rt.log_cancels
        .insert(window_id.clone(), Arc::clone(&cancel));
    drop(rt);

    logs::start_demo_follow(app, window_id.clone(), deployment, cancel);
    Ok(json!(LogsOpenResult { window_id }))
}

#[tauri::command]
pub fn logs_close(runtime: State<'_, RuntimeState>, window_id: String) -> FaroResult<()> {
    let mut rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    if let Some(cancel) = rt.log_cancels.remove(&window_id) {
        cancel.store(true, std::sync::atomic::Ordering::SeqCst);
    }
    Ok(())
}

#[tauri::command]
pub fn logs_set_view(window_id: String, view: String) -> FaroResult<()> {
    let _ = window_id;
    if view != "structured" && view != "raw" {
        return Err(FaroError::Message(
            "view must be 'structured' or 'raw'".into(),
        ));
    }
    // View mode is primarily UI state; command exists for IPC contract parity.
    Ok(())
}
