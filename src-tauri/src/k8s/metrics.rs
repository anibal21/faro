//! Best-effort workload summary (demo-friendly; N/D via nulls).

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkloadSummary {
    pub namespace: String,
    pub deployment: String,
    pub replica_count: i64,
    pub ready_replicas: Option<i64>,
    pub ram_consumed: Option<String>,
    pub cpu_consumed: Option<String>,
    pub uptime: Option<String>,
    pub fetched_at: String,
}

/// Demo/offline summary — never invents secrets; uses plausible placeholders.
pub fn demo_summary(namespace: &str, deployment: &str) -> WorkloadSummary {
    let (replicas, ready, ram, cpu, up) = match deployment {
        "payments-api" => (3, Some(3), Some("512Mi".into()), Some("250m".into()), Some("3d4h".into())),
        "payments-worker" => (1, Some(1), Some("256Mi".into()), Some("100m".into()), Some("1d2h".into())),
        _ => (1, Some(1), None, None, Some("12h".into())),
    };
    WorkloadSummary {
        namespace: namespace.to_string(),
        deployment: deployment.to_string(),
        replica_count: replicas,
        ready_replicas: ready,
        ram_consumed: ram,
        cpu_consumed: cpu,
        uptime: up,
        fetched_at: chrono::Utc::now().to_rfc3339(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn demo_payments_api_has_metrics() {
        let s = demo_summary("default", "payments-api");
        assert_eq!(s.replica_count, 3);
        assert!(s.ram_consumed.is_some());
        assert!(s.cpu_consumed.is_some());
    }

    #[test]
    fn unknown_may_omit_ram_cpu() {
        let s = demo_summary("default", "other");
        assert!(s.ram_consumed.is_none());
        assert!(s.cpu_consumed.is_none());
    }
}
