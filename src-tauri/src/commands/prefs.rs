use crate::db::DbState;
use crate::error::FaroResult;
use tauri::State;

#[tauri::command]
pub fn prefs_get(db: State<'_, DbState>) -> FaroResult<std::collections::HashMap<String, String>> {
    db.prefs_all()
}

#[tauri::command]
pub fn prefs_set(db: State<'_, DbState>, key: String, value: String) -> FaroResult<()> {
    db.prefs_set(&key, &value)
}
