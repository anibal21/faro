//! Workload summary: provisioned one-pod request/limit + replica/uptime status.

use k8s_openapi::api::apps::v1::Deployment;
use k8s_openapi::apimachinery::pkg::api::resource::Quantity;
use kube::{Api, Client};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkloadSummary {
    pub namespace: String,
    pub deployment: String,
    pub replica_count: i64,
    pub ready_replicas: Option<i64>,
    /// Provisioned memory as `request / limit` (legacy field name).
    pub ram_consumed: Option<String>,
    /// Provisioned CPU as `request / limit` (legacy field name).
    pub cpu_consumed: Option<String>,
    pub uptime: Option<String>,
    pub fetched_at: String,
}

/// Demo/offline summary — provisioned-looking placeholders.
pub fn demo_summary(namespace: &str, deployment: &str) -> WorkloadSummary {
    let (replicas, ready, ram, cpu, up) = match deployment {
        "payments-api" => (
            3,
            Some(3),
            Some("256Mi / 512Mi".into()),
            Some("100m / 250m".into()),
            Some("3d4h".into()),
        ),
        "payments-worker" => (
            1,
            Some(1),
            Some("128Mi / 256Mi".into()),
            Some("50m / 100m".into()),
            Some("1d2h".into()),
        ),
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

pub fn live_summary(client: &Client, namespace: &str, deployment: &str) -> WorkloadSummary {
    let rt = match tokio::runtime::Runtime::new() {
        Ok(rt) => rt,
        Err(_) => {
            return empty_summary(namespace, deployment);
        }
    };
    match rt.block_on(fetch_deployment_summary(client, namespace, deployment)) {
        Ok(s) => s,
        Err(_) => empty_summary(namespace, deployment),
    }
}

fn empty_summary(namespace: &str, deployment: &str) -> WorkloadSummary {
    WorkloadSummary {
        namespace: namespace.to_string(),
        deployment: deployment.to_string(),
        replica_count: 0,
        ready_replicas: None,
        ram_consumed: None,
        cpu_consumed: None,
        uptime: None,
        fetched_at: chrono::Utc::now().to_rfc3339(),
    }
}

async fn fetch_deployment_summary(
    client: &Client,
    namespace: &str,
    deployment: &str,
) -> Result<WorkloadSummary, kube::Error> {
    let api: Api<Deployment> = Api::namespaced(client.clone(), namespace);
    let dep = api.get(deployment).await?;
    let replica_count = dep.spec.as_ref().and_then(|s| s.replicas).unwrap_or(0) as i64;
    let ready_replicas = dep
        .status
        .as_ref()
        .and_then(|s| s.ready_replicas)
        .map(|v| v as i64);
    let (ram, cpu) = provisioned_from_template(&dep);
    let uptime = dep
        .metadata
        .creation_timestamp
        .as_ref()
        .map(|t| human_uptime(t.0));
    Ok(WorkloadSummary {
        namespace: namespace.to_string(),
        deployment: deployment.to_string(),
        replica_count,
        ready_replicas,
        ram_consumed: ram,
        cpu_consumed: cpu,
        uptime,
        fetched_at: chrono::Utc::now().to_rfc3339(),
    })
}

fn provisioned_from_template(dep: &Deployment) -> (Option<String>, Option<String>) {
    let containers = dep
        .spec
        .as_ref()
        .and_then(|s| s.template.spec.as_ref())
        .map(|p| p.containers.as_slice())
        .unwrap_or(&[]);
    let mut mem_req: i64 = 0;
    let mut mem_lim: i64 = 0;
    let mut cpu_req: i64 = 0;
    let mut cpu_lim: i64 = 0;
    let mut any_mem_req = false;
    let mut any_mem_lim = false;
    let mut any_cpu_req = false;
    let mut any_cpu_lim = false;
    for c in containers {
        if let Some(res) = c.resources.as_ref() {
            if let Some(req) = res.requests.as_ref() {
                if let Some(q) = req.get("memory") {
                    mem_req += parse_memory_bytes(q);
                    any_mem_req = true;
                }
                if let Some(q) = req.get("cpu") {
                    cpu_req += parse_cpu_millis(q);
                    any_cpu_req = true;
                }
            }
            if let Some(lim) = res.limits.as_ref() {
                if let Some(q) = lim.get("memory") {
                    mem_lim += parse_memory_bytes(q);
                    any_mem_lim = true;
                }
                if let Some(q) = lim.get("cpu") {
                    cpu_lim += parse_cpu_millis(q);
                    any_cpu_lim = true;
                }
            }
        }
    }
    (
        format_pair(
            any_mem_req.then(|| format_memory(mem_req)),
            any_mem_lim.then(|| format_memory(mem_lim)),
        ),
        format_pair(
            any_cpu_req.then(|| format_cpu(cpu_req)),
            any_cpu_lim.then(|| format_cpu(cpu_lim)),
        ),
    )
}

pub fn format_pair(req: Option<String>, lim: Option<String>) -> Option<String> {
    match (req, lim) {
        (None, None) => None,
        (r, l) => Some(format!(
            "{} / {}",
            r.unwrap_or_else(|| "N/D".into()),
            l.unwrap_or_else(|| "N/D".into())
        )),
    }
}

pub fn parse_cpu_millis(q: &Quantity) -> i64 {
    let s = q.0.trim();
    if let Some(n) = s.strip_suffix('m') {
        return n.parse().unwrap_or(0);
    }
    if let Ok(cores) = s.parse::<f64>() {
        return (cores * 1000.0).round() as i64;
    }
    0
}

pub fn parse_memory_bytes(q: &Quantity) -> i64 {
    let s = q.0.trim();
    let lower = s.to_lowercase();
    let (num, mult) = if let Some(n) = lower.strip_suffix("gi") {
        (n, 1024_i64.pow(3))
    } else if let Some(n) = lower.strip_suffix("mi") {
        (n, 1024_i64.pow(2))
    } else if let Some(n) = lower.strip_suffix("ki") {
        (n, 1024_i64)
    } else if let Some(n) = lower.strip_suffix('g') {
        (n, 1000_i64.pow(3))
    } else if let Some(n) = lower.strip_suffix('m') {
        (n, 1000_i64.pow(2))
    } else if let Some(n) = lower.strip_suffix('k') {
        (n, 1000_i64)
    } else {
        (s, 1_i64)
    };
    (num.parse::<f64>().unwrap_or(0.0) * mult as f64).round() as i64
}

pub fn format_cpu(millis: i64) -> String {
    if millis % 1000 == 0 {
        format!("{}", millis / 1000)
    } else {
        format!("{millis}m")
    }
}

pub fn format_memory(bytes: i64) -> String {
    if bytes >= 1024_i64.pow(3) && bytes % 1024_i64.pow(3) == 0 {
        format!("{}Gi", bytes / 1024_i64.pow(3))
    } else if bytes >= 1024_i64.pow(2) {
        format!("{}Mi", bytes / 1024_i64.pow(2))
    } else if bytes >= 1024 {
        format!("{}Ki", bytes / 1024)
    } else {
        format!("{bytes}")
    }
}

fn human_uptime(created: chrono::DateTime<chrono::Utc>) -> String {
    let secs = (chrono::Utc::now() - created).num_seconds().max(0);
    let days = secs / 86_400;
    let hours = (secs % 86_400) / 3600;
    if days > 0 {
        format!("{days}d{hours}h")
    } else if hours > 0 {
        let mins = (secs % 3600) / 60;
        format!("{hours}h{mins}m")
    } else {
        format!("{}m", secs / 60)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn demo_payments_api_has_metrics() {
        let s = demo_summary("default", "payments-api");
        assert_eq!(s.replica_count, 3);
        assert_eq!(s.ram_consumed.as_deref(), Some("256Mi / 512Mi"));
        assert_eq!(s.cpu_consumed.as_deref(), Some("100m / 250m"));
    }

    #[test]
    fn format_pair_both_sides() {
        assert_eq!(
            format_pair(Some("100m".into()), Some("250m".into())).as_deref(),
            Some("100m / 250m")
        );
        assert_eq!(
            format_pair(None, Some("250m".into())).as_deref(),
            Some("N/D / 250m")
        );
        assert!(format_pair(None, None).is_none());
    }

    #[test]
    fn parse_and_format_cpu_memory() {
        assert_eq!(parse_cpu_millis(&Quantity("100m".into())), 100);
        assert_eq!(parse_cpu_millis(&Quantity("1".into())), 1000);
        assert_eq!(format_cpu(100), "100m");
        assert_eq!(format_cpu(2000), "2");
        assert_eq!(
            parse_memory_bytes(&Quantity("256Mi".into())),
            256 * 1024 * 1024
        );
        assert_eq!(format_memory(512 * 1024 * 1024), "512Mi");
    }

    #[test]
    fn unknown_may_omit_ram_cpu() {
        let s = demo_summary("default", "other");
        assert!(s.ram_consumed.is_none());
        assert!(s.cpu_consumed.is_none());
    }
}
