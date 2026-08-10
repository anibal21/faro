//! On-click write-group analysis (local multi-pack rules only).

use crate::db::analysis_history;
use crate::db::session_cache;
use crate::db::DbState;
use crate::error::{FaroError, FaroResult};
use crate::rules::engine::{self, AnalyzeResult};
use crate::rules::hint;
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
) -> FaroResult<AnalyzeResult> {
    let pack_id = match engine::resolve_explicit_pack(payload.rule_pack.as_deref()) {
        Some(id) => id,
        None => hint::auto_hint(&payload.text, payload.source_hint.as_deref()).0,
    };

    let result = if payload.text.trim().is_empty() {
        let empty = engine::analyze_with_pack("", &pack_id);
        AnalyzeResult {
            findings: vec![],
            pack_id: empty.pack_id,
            pack_display_name: empty.pack_display_name,
            signal_snippet: None,
        }
    } else {
        engine::analyze_with_pack(&payload.text, &pack_id)
    };

    let conn = db
        .conn
        .lock()
        .map_err(|_| FaroError::Message("db lock".into()))?;
    if let Ok(Some(instance_id)) = session_cache::active_instance_id(&conn) {
        for f in &result.findings {
            let _ = analysis_history::insert_light(
                &conn,
                &instance_id,
                &f.rule_id,
                &f.severity,
                f.explanation_for_history(),
                &f.recommendation_for_history(),
                payload.source_hint.as_deref(),
            );
        }
    }
    Ok(result)
}
