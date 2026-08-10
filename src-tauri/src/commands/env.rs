use crate::db::connection_instance::{self, ConnectionInstance, EnvUpsertInput};
use crate::db::workspace::{self, WorkspaceState};
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use tauri::State;

#[tauri::command]
pub fn env_list(db: State<'_, DbState>) -> FaroResult<Vec<ConnectionInstance>> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    connection_instance::list_all(&conn)
}

#[tauri::command]
pub fn env_restore_demo(db: State<'_, DbState>) -> FaroResult<ConnectionInstance> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    connection_instance::ensure_demo(&conn)?;
    connection_instance::get_by_id(&conn, connection_instance::DEMO_INSTANCE_ID)?
        .ok_or_else(|| FaroError::Message("no se pudo restaurar el ambiente demo".into()))
}

#[tauri::command]
pub fn env_upsert(
    db: State<'_, DbState>,
    payload: EnvUpsertInput,
) -> FaroResult<ConnectionInstance> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    connection_instance::upsert(&conn, payload)
}

#[tauri::command]
pub fn env_delete(db: State<'_, DbState>, id: String) -> FaroResult<()> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    connection_instance::delete_by_id(&conn, &id)?;
    workspace::on_instance_deleted(&conn, &id)?;
    Ok(())
}

#[tauri::command]
pub fn env_load(db: State<'_, DbState>, ids: Vec<String>) -> FaroResult<WorkspaceState> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    workspace::load_ids(&conn, &ids)
}

#[tauri::command]
pub fn env_set_active(db: State<'_, DbState>, id: String) -> FaroResult<WorkspaceState> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    workspace::set_active(&conn, &id)
}

#[tauri::command]
pub fn env_workspace_get(db: State<'_, DbState>) -> FaroResult<WorkspaceState> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    workspace::get_state(&conn)
}
