//! On-click Spring Boot analysis (local rules only).

use crate::db::analysis_history;
use crate::db::session_cache;
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::rules::engine::{self, AnalysisFinding};
use serde::Deserialize;
use tauri::State;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeInput {
    pub text: String,
    pub rule_pack: Option<String>,
    pub source_hint: Option<String>,
}

#[tauri::command]
pub fn analyze_write_group(
    db: State<'_, DbState>,
    payload: AnalyzeInput,
) -> FaroResult<Vec<AnalysisFinding>> {
    let _ = payload.rule_pack;
    if payload.text.trim().is_empty() {
        return Ok(vec![]);
    }
    let findings = engine::analyze_text(&payload.text);
    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    if let Ok(Some(instance_id)) = session_cache::active_instance_id(&conn) {
        for f in &findings {
            let _ = analysis_history::insert_light(
                &conn,
                &instance_id,
                &f.rule_id,
                &f.severity,
                &f.explanation,
                &f.recommendation,
                payload.source_hint.as_deref(),
            );
        }
    }
    Ok(findings)
}
