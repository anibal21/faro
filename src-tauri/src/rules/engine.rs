use serde::{Deserialize, Serialize};

const MAX_TEXT_BYTES: usize = 64 * 1024;
pub const DEFAULT_PACK_ID: &str = "springboot";

const SPRINGBOOT_PACK: &str = include_str!("../../../rules/springboot/default.json");
const NODEJS_PACK: &str = include_str!("../../../rules/nodejs/default.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisFinding {
    pub severity: String,
    pub rule_id: String,
    pub explanation: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeResult {
    pub findings: Vec<AnalysisFinding>,
    pub pack_id: String,
    pub pack_display_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RulePackFile {
    id: String,
    display_name: String,
    rules: Vec<RuleDef>,
}

#[derive(Debug, Deserialize)]
struct RuleDef {
    id: String,
    severity: String,
    #[serde(default)]
    match_contains: Vec<String>,
    #[serde(default)]
    match_all_contains: Vec<String>,
    explanation: String,
    recommendation: String,
}

fn pack_json(id: &str) -> Option<&'static str> {
    match id {
        "springboot" => Some(SPRINGBOOT_PACK),
        "nodejs" => Some(NODEJS_PACK),
        _ => None,
    }
}

pub fn pack_known(id: &str) -> bool {
    pack_json(id).is_some()
}

#[allow(dead_code)]
pub fn list_packs() -> Vec<(String, String)> {
    ["springboot", "nodejs"]
        .into_iter()
        .filter_map(|id| {
            let pack = load_pack(id)?;
            Some((pack.id, pack.display_name))
        })
        .collect()
}

fn load_pack(id: &str) -> Option<RulePackFile> {
    let raw = pack_json(id)?;
    serde_json::from_str(raw).ok()
}

pub fn truncate_text(text: &str) -> String {
    if text.len() <= MAX_TEXT_BYTES {
        return text.to_string();
    }
    let mut end = MAX_TEXT_BYTES;
    while end > 0 && !text.is_char_boundary(end) {
        end -= 1;
    }
    text[..end].to_string()
}

fn severity_rank(sev: &str) -> u8 {
    match sev {
        "critical" => 0,
        "warn" => 1,
        "info" => 2,
        _ => 3,
    }
}

pub fn sort_findings(mut findings: Vec<AnalysisFinding>) -> Vec<AnalysisFinding> {
    findings.sort_by(|a, b| {
        severity_rank(&a.severity)
            .cmp(&severity_rank(&b.severity))
            .then_with(|| a.rule_id.cmp(&b.rule_id))
    });
    findings
}

fn rule_matches(text: &str, rule: &RuleDef) -> bool {
    if rule.match_contains.is_empty() && rule.match_all_contains.is_empty() {
        return false;
    }
    let or_ok = if rule.match_contains.is_empty() {
        true
    } else {
        rule.match_contains.iter().any(|n| text.contains(n))
    };
    let and_ok = rule
        .match_all_contains
        .iter()
        .all(|n| text.contains(n));
    or_ok && and_ok
}

fn match_pack(text: &str, pack: &RulePackFile) -> Vec<AnalysisFinding> {
    let mut findings = Vec::new();
    for rule in &pack.rules {
        if rule_matches(text, rule) {
            findings.push(AnalysisFinding {
                severity: rule.severity.clone(),
                rule_id: rule.id.clone(),
                explanation: rule.explanation.clone(),
                recommendation: rule.recommendation.clone(),
            });
        }
    }
    sort_findings(findings)
}

/// Resolve pack id: known explicit → that pack; unknown → default; None handled by caller (auto-hint).
pub fn resolve_explicit_pack(rule_pack: Option<&str>) -> Option<String> {
    let id = rule_pack?.trim();
    if id.is_empty() {
        return None;
    }
    if pack_known(id) {
        Some(id.to_string())
    } else {
        Some(DEFAULT_PACK_ID.to_string())
    }
}

pub fn analyze_with_pack(text: &str, pack_id: &str) -> AnalyzeResult {
    let truncated = truncate_text(text);
    let effective_id = if pack_known(pack_id) {
        pack_id
    } else {
        DEFAULT_PACK_ID
    };
    let pack = load_pack(effective_id).unwrap_or(RulePackFile {
        id: DEFAULT_PACK_ID.into(),
        display_name: "Spring Boot / JVM".into(),
        rules: vec![],
    });
    let findings = if truncated.trim().is_empty() {
        vec![]
    } else {
        match_pack(&truncated, &pack)
    };
    AnalyzeResult {
        findings,
        pack_id: pack.id,
        pack_display_name: pack.display_name,
    }
}

/// Backward-compatible helper: analyze with default Spring pack.
#[allow(dead_code)]
pub fn analyze_text(text: &str) -> Vec<AnalysisFinding> {
    analyze_with_pack(text, DEFAULT_PACK_ID).findings
}

#[allow(dead_code)]
pub fn lightweight_error_hint(text: &str) -> bool {
    let upper = text.to_uppercase();
    upper.contains("ERROR")
        || upper.contains("EXCEPTION")
        || upper.contains("NULLPOINTER")
        || text.contains("\tat ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn matches_npe_rule() {
        let text =
            "java.lang.NullPointerException: Cannot invoke\n\tat com.example.PaymentService.charge";
        let result = analyze_with_pack(text, "springboot");
        assert!(!result.findings.is_empty());
        assert!(result.findings.iter().any(|f| f.severity == "critical"));
        assert!(result
            .findings
            .iter()
            .any(|f| f.rule_id == "springboot.npe"));
        assert_eq!(result.pack_id, "springboot");
    }

    #[test]
    fn matches_sql_rule() {
        let text = "org.springframework.dao.DataAccessException: SQLException: connection refused";
        let findings = analyze_with_pack(text, "springboot").findings;
        assert!(findings.iter().any(|f| f.rule_id == "springboot.sql"));
    }

    #[test]
    fn generic_error_gated_from_info_only() {
        let text = "INFO something fine happened";
        let findings = analyze_with_pack(text, "springboot").findings;
        assert!(findings.iter().all(|f| f.severity != "critical"));
        assert!(!findings.iter().any(|f| f.rule_id == "springboot.generic_error"));
    }

    #[test]
    fn benign_info_no_critical() {
        let text = "INFO Application started successfully";
        let findings = analyze_with_pack(text, "springboot").findings;
        assert!(!findings.iter().any(|f| f.severity == "critical"));
        assert!(findings.is_empty() || findings.iter().all(|f| f.severity != "critical"));
    }

    #[test]
    fn node_fixture_matches_nodejs_pack() {
        let text = "UnhandledPromiseRejectionWarning: TypeError: Cannot read properties of undefined\n    at Object.handler (/app/index.js:10:5)";
        let node = analyze_with_pack(text, "nodejs");
        assert!(!node.findings.is_empty());
        assert!(node
            .findings
            .iter()
            .any(|f| f.rule_id.starts_with("nodejs.")));
        let spring = analyze_with_pack(text, "springboot");
        assert!(!spring
            .findings
            .iter()
            .any(|f| f.rule_id == "nodejs.typeerror"));
        assert!(!spring
            .findings
            .iter()
            .any(|f| f.rule_id == "nodejs.unhandled_rejection"));
    }

    #[test]
    fn unknown_pack_falls_back_to_springboot() {
        let text = "java.lang.NullPointerException";
        let result = analyze_with_pack(text, "unknown-pack");
        assert_eq!(result.pack_id, "springboot");
        assert!(!result.findings.is_empty());
    }

    #[test]
    fn resolve_explicit_unknown_to_default() {
        assert_eq!(
            resolve_explicit_pack(Some("nope")),
            Some(DEFAULT_PACK_ID.into())
        );
        assert_eq!(
            resolve_explicit_pack(Some("nodejs")),
            Some("nodejs".into())
        );
        assert_eq!(resolve_explicit_pack(None), None);
        assert_eq!(resolve_explicit_pack(Some("  ")), None);
    }

    #[test]
    fn truncate_and_severity_sort() {
        let long = "x".repeat(MAX_TEXT_BYTES + 100);
        assert_eq!(truncate_text(&long).len(), MAX_TEXT_BYTES);
        let mixed = vec![
            AnalysisFinding {
                severity: "info".into(),
                rule_id: "a".into(),
                explanation: "".into(),
                recommendation: "".into(),
            },
            AnalysisFinding {
                severity: "critical".into(),
                rule_id: "b".into(),
                explanation: "".into(),
                recommendation: "".into(),
            },
            AnalysisFinding {
                severity: "warn".into(),
                rule_id: "c".into(),
                explanation: "".into(),
                recommendation: "".into(),
            },
        ];
        let sorted = sort_findings(mixed);
        assert_eq!(sorted[0].severity, "critical");
        assert_eq!(sorted[1].severity, "warn");
        assert_eq!(sorted[2].severity, "info");
    }

    #[test]
    fn match_all_contains_requires_all() {
        let pack = RulePackFile {
            id: "t".into(),
            display_name: "t".into(),
            rules: vec![RuleDef {
                id: "and.rule".into(),
                severity: "warn".into(),
                match_contains: vec!["ERROR".into()],
                match_all_contains: vec!["timeout".into()],
                explanation: "e".into(),
                recommendation: "r".into(),
            }],
        };
        assert!(match_pack("ERROR timeout happened", &pack)
            .iter()
            .any(|f| f.rule_id == "and.rule"));
        assert!(!match_pack("ERROR only", &pack)
            .iter()
            .any(|f| f.rule_id == "and.rule"));
    }
}
