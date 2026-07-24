use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisFinding {
    pub severity: String,
    pub rule_id: String,
    pub explanation: String,
    pub recommendation: String,
}

#[derive(Debug, Deserialize)]
struct RulePack {
    rules: Vec<RuleDef>,
}

#[derive(Debug, Deserialize)]
struct RuleDef {
    id: String,
    severity: String,
    match_contains: Vec<String>,
    explanation: String,
    recommendation: String,
}

const DEFAULT_PACK: &str = include_str!("../../../rules/springboot/default.json");

pub fn analyze_text(text: &str) -> Vec<AnalysisFinding> {
    let pack: RulePack = serde_json::from_str(DEFAULT_PACK).unwrap_or(RulePack { rules: vec![] });
    let mut findings = Vec::new();
    for rule in pack.rules {
        if rule
            .match_contains
            .iter()
            .any(|needle| text.contains(needle))
        {
            findings.push(AnalysisFinding {
                severity: rule.severity,
                rule_id: rule.id,
                explanation: rule.explanation,
                recommendation: rule.recommendation,
            });
        }
    }
    findings
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
        let text = "java.lang.NullPointerException: Cannot invoke\n\tat com.example.PaymentService.charge";
        let findings = analyze_text(text);
        assert!(!findings.is_empty());
        assert!(findings.iter().any(|f| f.severity == "critical"));
    }
}
