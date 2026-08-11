use crate::db::DbState;
use crate::error::FaroResult;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct PurgeResult {
    pub purged: bool,
}

#[tauri::command]
pub fn session_purge_ephemeral(db: State<'_, DbState>) -> FaroResult<PurgeResult> {
    let purged = db.purge_ephemeral()?;
    Ok(PurgeResult { purged })
}
