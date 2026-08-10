use serde::de::{self, Deserializer};
use serde::{Deserialize, Serialize};

use super::signal;

const MAX_TEXT_BYTES: usize = 64 * 1024;
pub const DEFAULT_PACK_ID: &str = "springboot";

const SPRINGBOOT_PACK: &str = include_str!("../../../rules/springboot/default.json");
const LIQUIBASE_PACK: &str = include_str!("../../../rules/liquibase/default.json");
const NODEJS_PACK: &str = include_str!("../../../rules/nodejs/default.json");
const REACT_PACK: &str = include_str!("../../../rules/react/default.json");
const PYTHON_PACK: &str = include_str!("../../../rules/python/default.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisFinding {
    pub severity: String,
    pub rule_id: String,
    pub title: String,
    pub summary: String,
    pub why: String,
    pub what_to_look_for: Vec<String>,
    pub recommendation: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
}

impl AnalysisFinding {
    pub fn explanation_for_history(&self) -> &str {
        &self.summary
    }

    pub fn recommendation_for_history(&self) -> String {
        self.recommendation.join(" · ")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeResult {
    pub findings: Vec<AnalysisFinding>,
    pub pack_id: String,
    pub pack_display_name: String,
    pub signal_snippet: Option<String>,
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
    #[serde(default)]
    title: String,
    #[serde(default)]
    summary: String,
    #[serde(default)]
    explanation: String,
    #[serde(default)]
    why: String,
    #[serde(default, rename = "whatToLookFor", alias = "what_to_look_for")]
    what_to_look_for: Vec<String>,
    #[serde(default, deserialize_with = "string_or_vec")]
    recommendation: Vec<String>,
    #[serde(default)]
    tags: Vec<String>,
}

fn string_or_vec<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
    D: Deserializer<'de>,
{
    struct Visitor;
    impl<'de> de::Visitor<'de> for Visitor {
        type Value = Vec<String>;
        fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            f.write_str("string or array of strings")
        }
        fn visit_str<E: de::Error>(self, v: &str) -> Result<Self::Value, E> {
            Ok(if v.is_empty() {
                vec![]
            } else {
                vec![v.to_string()]
            })
        }
        fn visit_string<E: de::Error>(self, v: String) -> Result<Self::Value, E> {
            Ok(if v.is_empty() { vec![] } else { vec![v] })
        }
        fn visit_seq<A: de::SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
            let mut out = Vec::new();
            while let Some(s) = seq.next_element::<String>()? {
                out.push(s);
            }
            Ok(out)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(vec![])
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(vec![])
        }
    }
    deserializer.deserialize_any(Visitor)
}

fn pack_json(id: &str) -> Option<&'static str> {
    match id {
        "springboot" => Some(SPRINGBOOT_PACK),
        "liquibase" => Some(LIQUIBASE_PACK),
        "nodejs" => Some(NODEJS_PACK),
        "react" => Some(REACT_PACK),
        "python" => Some(PYTHON_PACK),
        _ => None,
    }
}

pub fn pack_known(id: &str) -> bool {
    pack_json(id).is_some()
}

#[allow(dead_code)]
pub fn list_packs() -> Vec<(String, String)> {
    ["springboot", "liquibase", "nodejs", "react", "python"]
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
    let and_ok = rule.match_all_contains.iter().all(|n| text.contains(n));
    or_ok && and_ok
}

fn finding_from_rule(rule: &RuleDef) -> AnalysisFinding {
    let summary = if !rule.summary.is_empty() {
        rule.summary.clone()
    } else {
        rule.explanation.clone()
    };
    let title = if !rule.title.is_empty() {
        rule.title.clone()
    } else {
        rule.id
            .rsplit('.')
            .next()
            .unwrap_or(rule.id.as_str())
            .to_string()
    };
    AnalysisFinding {
        severity: rule.severity.clone(),
        rule_id: rule.id.clone(),
        title,
        summary,
        why: rule.why.clone(),
        what_to_look_for: rule.what_to_look_for.clone(),
        recommendation: rule.recommendation.clone(),
        tags: rule.tags.clone(),
    }
}

fn match_pack(text: &str, pack: &RulePackFile) -> Vec<AnalysisFinding> {
    let mut findings = Vec::new();
    for rule in &pack.rules {
        if rule_matches(text, rule) {
            findings.push(finding_from_rule(rule));
        }
    }
    sort_findings(findings)
}

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
    let signal_snippet = if truncated.trim().is_empty() {
        None
    } else {
        signal::extract_signal_snippet(&truncated)
    };
    AnalyzeResult {
        findings,
        pack_id: pack.id,
        pack_display_name: pack.display_name,
        signal_snippet,
    }
}

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

    fn bare_finding(sev: &str, id: &str) -> AnalysisFinding {
        AnalysisFinding {
            severity: sev.into(),
            rule_id: id.into(),
            title: id.into(),
            summary: "".into(),
            why: "".into(),
            what_to_look_for: vec![],
            recommendation: vec![],
            tags: vec![],
        }
    }

    #[test]
    fn matches_npe_rule_rich() {
        let text =
            "java.lang.NullPointerException: Cannot invoke\n\tat com.example.PaymentService.charge";
        let result = analyze_with_pack(text, "springboot");
        assert!(!result.findings.is_empty());
        let npe = result
            .findings
            .iter()
            .find(|f| f.rule_id == "springboot.npe")
            .expect("npe");
        assert_eq!(npe.severity, "critical");
        assert!(!npe.title.is_empty());
        assert!(!npe.summary.is_empty());
        assert!(!npe.recommendation.is_empty());
        assert!(result
            .signal_snippet
            .as_ref()
            .unwrap()
            .contains("NullPointerException"));
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
        assert!(!findings
            .iter()
            .any(|f| f.rule_id == "springboot.generic_error"));
    }

    #[test]
    fn benign_info_no_critical() {
        let text = "INFO Application started successfully";
        let findings = analyze_with_pack(text, "springboot").findings;
        assert!(!findings.iter().any(|f| f.severity == "critical"));
    }

    #[test]
    fn liquibase_lock_matches() {
        let text = "liquibase.exception.LockException: Could not acquire change log lock. Waiting for changelog lock...";
        let r = analyze_with_pack(text, "liquibase");
        assert!(!r.findings.is_empty());
        assert!(r.findings.iter().any(|f| f.rule_id.contains("lock")));
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
    }

    #[test]
    fn react_chunk_matches() {
        let text = "ChunkLoadError: Loading chunk 3 failed.\n(error: Failed to fetch)";
        let r = analyze_with_pack(text, "react");
        assert!(!r.findings.is_empty());
    }

    #[test]
    fn python_traceback_matches() {
        let text = "Traceback (most recent call last):\n  File \"app.py\", line 10, in <module>\nModuleNotFoundError: No module named 'foo'";
        let r = analyze_with_pack(text, "python");
        assert!(!r.findings.is_empty());
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
        assert_eq!(resolve_explicit_pack(Some("nodejs")), Some("nodejs".into()));
        assert_eq!(resolve_explicit_pack(None), None);
    }

    #[test]
    fn truncate_and_severity_sort() {
        let long = "x".repeat(MAX_TEXT_BYTES + 100);
        assert_eq!(truncate_text(&long).len(), MAX_TEXT_BYTES);
        let sorted = sort_findings(vec![
            bare_finding("info", "a"),
            bare_finding("critical", "b"),
            bare_finding("warn", "c"),
        ]);
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
                title: "t".into(),
                summary: "s".into(),
                explanation: "".into(),
                why: "".into(),
                what_to_look_for: vec![],
                recommendation: vec!["r".into()],
                tags: vec![],
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
