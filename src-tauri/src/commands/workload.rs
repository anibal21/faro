//! Workload summary IPC.

use crate::error::{FaroError, FaroResult};
use crate::k8s::metrics::{self, WorkloadSummary};
use crate::runtime::{ConnectMode, RuntimeState};
use tauri::State;

#[tauri::command]
pub fn workload_summary(
    runtime: State<'_, RuntimeState>,
    namespace: String,
    deployment: String,
) -> FaroResult<WorkloadSummary> {
    let rt = runtime
        .inner
        .lock()
        .map_err(|_| FaroError::Message("runtime lock".into()))?;
    let entry = rt.focused_session().ok_or_else(|| FaroError::Message(
        "not connected — connect before requesting summary".into(),
    ))?;
    let mode = entry.mode;
    if rt.focused_instance_id.is_none() {
        return Err(FaroError::Message(
            "not connected — connect before requesting summary".into(),
        ));
    }
    drop(rt);
    Ok(match mode {
        ConnectMode::Demo => metrics::demo_summary(&namespace, &deployment),
        ConnectMode::Live => metrics::live_summary(&namespace, &deployment),
    })
}
