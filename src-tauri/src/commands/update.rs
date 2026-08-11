//! App update check / install via `tauri-plugin-updater` (GitHub Releases feed).
//!
//! Privacy: payloads carry only product version / release metadata — never profiles,
//! bastion hosts, PEM paths, logs, or analysis results.
//!
//! Windows install: the updater launches the NSIS setup (may show UAC). Do **not**
//! apply `CREATE_NO_WINDOW` to the installer process — that would hide the installer UI.

use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_updater::{Update, UpdaterExt};

use crate::{FaroError, FaroResult};

#[derive(Default)]
pub struct PendingUpdateState {
    inner: Mutex<Option<Update>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheckResult {
    pub status: String,
    pub current: String,
    pub available: Option<String>,
    pub notes: Option<String>,
    pub can_install: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadProgressPayload {
    downloaded: u64,
    content_length: Option<u64>,
    percent: Option<f64>,
}

fn can_install_platform() -> bool {
    cfg!(target_os = "windows")
}

fn current_version(app: &AppHandle) -> String {
    app.package_info().version.to_string()
}

/// Compare installed version against the configured updater feed.
#[tauri::command]
pub async fn update_check(
    app: AppHandle,
    pending: State<'_, PendingUpdateState>,
) -> FaroResult<UpdateCheckResult> {
    let current = current_version(&app);
    let can_install = can_install_platform();

    let updater = match app.updater() {
        Ok(u) => u,
        Err(e) => {
            clear_pending(&pending);
            return Ok(UpdateCheckResult {
                status: "unavailable".into(),
                current,
                available: None,
                notes: Some(format!("Actualizador no disponible: {e}")),
                can_install,
            });
        }
    };

    match updater.check().await {
        Ok(Some(update)) => {
            let available = update.version.clone();
            let notes = update.body.clone();
            set_pending(&pending, Some(update))?;
            Ok(UpdateCheckResult {
                status: "available".into(),
                current,
                available: Some(available),
                notes,
                can_install,
            })
        }
        Ok(None) => {
            clear_pending(&pending);
            Ok(UpdateCheckResult {
                status: "upToDate".into(),
                current,
                available: None,
                notes: None,
                can_install,
            })
        }
        Err(e) => {
            clear_pending(&pending);
            Ok(UpdateCheckResult {
                status: "unavailable".into(),
                current,
                available: None,
                notes: Some(format!("No se pudo consultar actualizaciones: {e}")),
                can_install,
            })
        }
    }
}

/// Download and install the update from the last successful `update_check` offer.
/// Windows only. Failures leave the prior install usable.
#[tauri::command]
pub async fn update_install(
    app: AppHandle,
    pending: State<'_, PendingUpdateState>,
) -> FaroResult<()> {
    if !can_install_platform() {
        return Err(FaroError::Message(
            "La instalación automática solo está disponible en Windows.".into(),
        ));
    }

    let update = take_pending(&pending)?.ok_or_else(|| {
        FaroError::Message(
            "No hay una actualización pendiente. Busca actualizaciones de nuevo.".into(),
        )
    })?;

    let app_for_progress = app.clone();
    let mut downloaded: u64 = 0;

    // NSIS may present UAC / installer UI — do not hide the child process window.
    update
        .download_and_install(
            |chunk_len, content_len| {
                downloaded = downloaded.saturating_add(chunk_len as u64);
                let percent = content_len.map(|total| {
                    if total == 0 {
                        0.0
                    } else {
                        (downloaded as f64 / total as f64) * 100.0
                    }
                });
                let _ = app_for_progress.emit(
                    "update_download_progress",
                    DownloadProgressPayload {
                        downloaded,
                        content_length: content_len,
                        percent,
                    },
                );
            },
            || {},
        )
        .await
        .map_err(|e| {
            FaroError::Message(format!(
                "No se pudo descargar o instalar la actualización: {e}"
            ))
        })?;

    Ok(())
}

fn set_pending(pending: &PendingUpdateState, update: Option<Update>) -> FaroResult<()> {
    let mut guard = pending
        .inner
        .lock()
        .map_err(|_| FaroError::Message("Estado de actualización bloqueado".into()))?;
    *guard = update;
    Ok(())
}

fn clear_pending(pending: &PendingUpdateState) {
    let _ = set_pending(pending, None);
}

fn take_pending(pending: &PendingUpdateState) -> FaroResult<Option<Update>> {
    let mut guard = pending
        .inner
        .lock()
        .map_err(|_| FaroError::Message("Estado de actualización bloqueado".into()))?;
    Ok(guard.take())
}
