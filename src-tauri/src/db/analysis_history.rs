//! Light analysis history (metadata only — no log bodies).

use crate::error::FaroResult;
use rusqlite::{params, Connection};
use uuid::Uuid;

pub fn insert_light(
    conn: &Connection,
    connection_instance_id: &str,
    rule_id: &str,
    severity: &str,
    explanation: &str,
    recommendation: &str,
    source_hint: Option<&str>,
) -> FaroResult<()> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let (namespace, artifact_name) = match source_hint {
        Some(h) => {
            let parts: Vec<&str> = h.splitn(2, '/').collect();
            if parts.len() == 2 {
                (Some(parts[0].to_string()), Some(parts[1].to_string()))
            } else {
                (None, Some(h.to_string()))
            }
        }
        None => (None, None),
    };
    conn.execute(
        "INSERT INTO analysis_finding_history (
            id, connection_instance_id, namespace, artifact_name, artifact_kind,
            severity, rule_id, explanation_summary, recommendation_summary, created_at
         ) VALUES (?1, ?2, ?3, ?4, 'write_group', ?5, ?6, ?7, ?8, ?9)",
        params![
            id,
            connection_instance_id,
            namespace,
            artifact_name,
            severity,
            rule_id,
            explanation,
            recommendation,
            now
        ],
    )?;
    Ok(())
}
