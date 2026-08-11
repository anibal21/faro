//! Write operator-chosen export files (local path only; no secrets).

use crate::error::{FaroError, FaroResult};
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub fn export_write_text(path: String, contents: String) -> FaroResult<()> {
    let p = PathBuf::from(path.trim());
    if p.as_os_str().is_empty() {
        return Err(FaroError::Message("export path is required".into()));
    }
    // Refuse obviously wrong targets; still user-chosen local path.
    if contents.contains("BEGIN RSA PRIVATE KEY")
        || contents.contains("BEGIN OPENSSH PRIVATE KEY")
        || contents.contains("aws_secret_access_key")
    {
        return Err(FaroError::Message(
            "export blocked: content looks like secret material".into(),
        ));
    }
    if let Some(parent) = p.parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent).map_err(|e| {
                FaroError::Message(format!("unable to create export directory: {e}"))
            })?;
        }
    }
    fs::write(&p, contents.as_bytes())
        .map_err(|e| FaroError::Message(format!("unable to write export file: {e}")))?;
    Ok(())
}
