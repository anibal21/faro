//! Demo + live log follow streams (RAM only; never persist full dumps).

use futures::{AsyncBufReadExt, StreamExt};
use k8s_openapi::api::apps::v1::Deployment;
use k8s_openapi::api::core::v1::Pod;
use kube::api::{ListParams, LogParams};
use kube::{Api, Client};
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::task::JoinSet;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogsChunk {
    pub window_id: String,
    pub pod_name: String,
    pub text: String,
    pub timestamp: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogsStatus {
    pub window_id: String,
    pub status: String,
}

const LIVE_TAIL_LINES: i64 = 500;
pub const LOG_PAGE_LINES: i64 = 500;
const LINE_FLUSH_IDLE_MS: u64 = 120;
const DEMO_HISTORY_CAP: i64 = 2000;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PodTailBatch {
    pub pod_name: String,
    /// Live: full one-shot tail. Demo (`older_only`): already the older prefix to prepend.
    pub tail_text: String,
    pub request_depth: i64,
    pub exhausted: bool,
    pub older_only: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadOlderResult {
    pub pods: Vec<PodTailBatch>,
}

pub fn start_demo_follow(
    app: AppHandle,
    window_id: String,
    deployment: String,
    pod_name: Option<String>,
    cancel: Arc<AtomicBool>,
) {
    thread::spawn(move || {
        let _ = app.emit(
            "logs_status",
            LogsStatus {
                window_id: window_id.clone(),
                status: "siguiendo".into(),
            },
        );
        let pods = if let Some(p) = pod_name {
            vec![p]
        } else {
            vec![
                format!("{deployment}-aaa"),
                format!("{deployment}-bbb"),
                format!("{deployment}-ccc"),
            ]
        };
        let mut i = 0u64;
        while !cancel.load(Ordering::SeqCst) {
            let pod = &pods[(i as usize) % pods.len()];
            let (text, is_error) = if i % 7 == 0 {
                (
                    format!(
                        "ERROR org.springframework.web.servlet.DispatcherServlet - Nested exception\njava.lang.NullPointerException: Cannot invoke method on null\n\tat com.example.PaymentService.charge(PaymentService.java:42)\n\tat com.example.PaymentController.pay(PaymentController.java:18)\n"
                    ),
                    true,
                )
            } else {
                (
                    format!("INFO  c.e.PaymentService - processed request id={i}\n"),
                    false,
                )
            };
            let _ = is_error;
            let _ = app.emit(
                "logs_chunk",
                LogsChunk {
                    window_id: window_id.clone(),
                    pod_name: pod.clone(),
                    text,
                    timestamp: chrono::Utc::now().to_rfc3339(),
                },
            );
            i += 1;
            thread::sleep(Duration::from_millis(800));
        }
        let _ = app.emit(
            "logs_status",
            LogsStatus {
                window_id,
                status: "inactivo".into(),
            },
        );
    });
}

/// Live follow: fan-in pods for the Deployment, `follow=true`, emit while tab open.
pub fn start_live_follow(
    app: AppHandle,
    window_id: String,
    namespace: String,
    deployment: String,
    pod_filter: Option<String>,
    client: Client,
    cancel: Arc<AtomicBool>,
) {
    thread::spawn(move || {
        let _ = app.emit(
            "logs_status",
            LogsStatus {
                window_id: window_id.clone(),
                status: "siguiendo".into(),
            },
        );
        let rt = match tokio::runtime::Runtime::new() {
            Ok(rt) => rt,
            Err(_) => {
                let _ = app.emit(
                    "logs_status",
                    LogsStatus {
                        window_id: window_id.clone(),
                        status: "live log runtime failed".into(),
                    },
                );
                let _ = app.emit(
                    "logs_status",
                    LogsStatus {
                        window_id,
                        status: "inactivo".into(),
                    },
                );
                return;
            }
        };
        rt.block_on(async {
            let pod_names = if let Some(only) = pod_filter {
                vec![only]
            } else {
                match list_deployment_pods(&client, &namespace, &deployment).await {
                    Ok(names) => names,
                    Err(_) => {
                        let _ = app.emit(
                            "logs_status",
                            LogsStatus {
                                window_id: window_id.clone(),
                                status: "fallo al solicitar logs en vivo".into(),
                            },
                        );
                        return;
                    }
                }
            };
            if pod_names.is_empty() {
                let _ = app.emit(
                    "logs_status",
                    LogsStatus {
                        window_id: window_id.clone(),
                        status: "sin pods coincidentes".into(),
                    },
                );
                return;
            }
            let _ = app.emit(
                "logs_status",
                LogsStatus {
                    window_id: window_id.clone(),
                    status: format!("siguiendo ({} pods)", pod_names.len()),
                },
            );

            let api: Api<Pod> = Api::namespaced(client.clone(), &namespace);
            let mut set = JoinSet::new();
            for pod_name in pod_names {
                let app = app.clone();
                let api = api.clone();
                let window_id = window_id.clone();
                let cancel = Arc::clone(&cancel);
                set.spawn(async move {
                    follow_one_pod(app, window_id, api, pod_name, cancel).await;
                });
            }

            while !cancel.load(Ordering::SeqCst) {
                tokio::select! {
                    _ = tokio::time::sleep(Duration::from_millis(250)) => {}
                    joined = set.join_next() => {
                        if joined.is_none() {
                            break;
                        }
                    }
                }
                if set.is_empty() {
                    break;
                }
            }
            set.abort_all();
            while set.join_next().await.is_some() {}
        });
        let _ = app.emit(
            "logs_status",
            LogsStatus {
                window_id,
                status: "inactivo".into(),
            },
        );
    });
}

async fn list_deployment_pods(
    client: &Client,
    namespace: &str,
    deployment: &str,
) -> Result<Vec<String>, kube::Error> {
    let api: Api<Pod> = Api::namespaced(client.clone(), namespace);
    // Prefer Deployment selector (small list) over listing every pod in the namespace.
    let pods = {
        let dep_api: Api<Deployment> = Api::namespaced(client.clone(), namespace);
        match dep_api.get(deployment).await {
            Ok(dep) => {
                let label_sel = dep
                    .spec
                    .as_ref()
                    .and_then(|s| s.selector.match_labels.as_ref())
                    .map(|ml| {
                        ml.iter()
                            .map(|(k, v)| format!("{k}={v}"))
                            .collect::<Vec<_>>()
                            .join(",")
                    })
                    .filter(|s| !s.is_empty());
                if let Some(sel) = label_sel {
                    api.list(&ListParams::default().labels(&sel)).await?.items
                } else {
                    api.list(&ListParams::default()).await?.items
                }
            }
            Err(_) => api.list(&ListParams::default()).await?.items,
        }
    };
    let mut names: Vec<String> = pods
        .into_iter()
        .filter(|p| pod_matches_deployment(p, deployment))
        .filter_map(|p| p.metadata.name)
        .collect();
    names.sort();
    names.dedup();
    Ok(names)
}

fn pod_matches_deployment(pod: &Pod, deployment: &str) -> bool {
    let dep = deployment.trim();
    if dep.is_empty() {
        return false;
    }
    if let Some(name) = pod.metadata.name.as_deref() {
        if name == dep || name.starts_with(&format!("{dep}-")) {
            return true;
        }
    }
    if let Some(labels) = pod.metadata.labels.as_ref() {
        for key in ["app", "app.kubernetes.io/name", "app.kubernetes.io/instance"] {
            if labels.get(key).map(|v| v.as_str()) == Some(dep) {
                return true;
            }
        }
    }
    if let Some(owners) = pod.metadata.owner_references.as_ref() {
        for o in owners {
            if o.kind == "ReplicaSet" && o.name.starts_with(&format!("{dep}-")) {
                return true;
            }
        }
    }
    false
}

async fn follow_one_pod(
    app: AppHandle,
    window_id: String,
    api: Api<Pod>,
    pod_name: String,
    cancel: Arc<AtomicBool>,
) {
    let params = LogParams {
        follow: true,
        tail_lines: Some(LIVE_TAIL_LINES),
        timestamps: false,
        ..LogParams::default()
    };
    let stream = match api.log_stream(&pod_name, &params).await {
        Ok(s) => s,
        Err(_) => {
            let _ = app.emit(
                "logs_status",
                LogsStatus {
                    window_id: window_id.clone(),
                    status: format!("log stream failed ({pod_name})"),
                },
            );
            return;
        }
    };
    let mut lines = stream.lines();
    let mut pending = String::new();
    let flush_idle = Duration::from_millis(LINE_FLUSH_IDLE_MS);

    while !cancel.load(Ordering::SeqCst) {
        match tokio::time::timeout(flush_idle, lines.next()).await {
            Ok(Some(Ok(line))) => {
                pending.push_str(&line);
                pending.push('\n');
                // Flush on blank line or when buffer gets large (stacktrace-friendly).
                if line.is_empty() || pending.len() >= 4_096 {
                    emit_text(&app, &window_id, &pod_name, &pending);
                    pending.clear();
                }
            }
            Ok(Some(Err(_))) => break,
            Ok(None) => {
                if !pending.is_empty() {
                    emit_text(&app, &window_id, &pod_name, &pending);
                }
                break;
            }
            Err(_) => {
                // Idle timeout: flush partial buffer so UI updates, keep following.
                if !pending.is_empty() {
                    emit_text(&app, &window_id, &pod_name, &pending);
                    pending.clear();
                }
            }
        }
    }
}

fn emit_text(app: &AppHandle, window_id: &str, pod_name: &str, text: &str) {
    if text.is_empty() {
        return;
    }
    let _ = app.emit(
        "logs_chunk",
        LogsChunk {
            window_id: window_id.to_string(),
            pod_name: pod_name.to_string(),
            text: text.to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        },
    );
}

/// One-shot larger tail per matching pod (does not cancel follow).
pub fn load_older_live(
    namespace: String,
    deployment: String,
    client: Client,
    depths: std::collections::HashMap<String, i64>,
) -> Result<LoadOlderResult, String> {
    let rt = tokio::runtime::Runtime::new().map_err(|_| "live log runtime failed".to_string())?;
    rt.block_on(async {
        let api: Api<Pod> = Api::namespaced(client.clone(), &namespace);
        let pod_names = list_deployment_pods(&client, &namespace, &deployment)
            .await
            .map_err(|_| "unable to list pods for load older".to_string())?;
        if pod_names.is_empty() {
            return Ok(LoadOlderResult { pods: vec![] });
        }
        let mut pods = Vec::new();
        for pod_name in pod_names {
            let current = depths.get(&pod_name).copied().unwrap_or(LIVE_TAIL_LINES);
            let request_depth = current.saturating_add(LOG_PAGE_LINES);
            match fetch_pod_tail(&api, &pod_name, request_depth).await {
                Ok(tail_text) => {
                    let line_count = count_lines(&tail_text);
                    let exhausted = line_count <= current;
                    pods.push(PodTailBatch {
                        pod_name,
                        tail_text,
                        request_depth,
                        exhausted,
                        older_only: false,
                    });
                }
                Err(_) => {
                    pods.push(PodTailBatch {
                        pod_name,
                        tail_text: String::new(),
                        request_depth,
                        exhausted: true,
                        older_only: false,
                    });
                }
            }
        }
        Ok(LoadOlderResult { pods })
    })
}

async fn fetch_pod_tail(
    api: &Api<Pod>,
    pod_name: &str,
    tail_lines: i64,
) -> Result<String, kube::Error> {
    let params = LogParams {
        follow: false,
        tail_lines: Some(tail_lines),
        timestamps: false,
        ..LogParams::default()
    };
    api.logs(pod_name, &params).await
}

fn count_lines(text: &str) -> i64 {
    if text.is_empty() {
        return 0;
    }
    text.lines().count() as i64
}

/// Demo: synthesize older pages until a soft cap (no cluster).
pub fn load_older_demo(
    deployment: &str,
    depths: &std::collections::HashMap<String, i64>,
) -> LoadOlderResult {
    let pods = [
        format!("{deployment}-aaa"),
        format!("{deployment}-bbb"),
        format!("{deployment}-ccc"),
    ];
    let mut out = Vec::new();
    for pod_name in pods {
        let current = depths.get(&pod_name).copied().unwrap_or(LIVE_TAIL_LINES);
        if current >= DEMO_HISTORY_CAP {
            out.push(PodTailBatch {
                pod_name,
                tail_text: String::new(),
                request_depth: current,
                exhausted: true,
                older_only: true,
            });
            continue;
        }
        let request_depth = current.saturating_add(LOG_PAGE_LINES);
        let mut older = String::new();
        let start = current;
        let end = request_depth;
        for i in start..end {
            older.push_str(&format!(
                "INFO  c.e.PaymentService - older history id={} pod={pod_name}\n",
                end - 1 - (i - start)
            ));
        }
        out.push(PodTailBatch {
            pod_name,
            tail_text: older,
            request_depth,
            exhausted: false,
            older_only: true,
        });
    }
    LoadOlderResult { pods: out }
}

#[cfg(test)]
mod tests {
    use super::*;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::{ObjectMeta, OwnerReference};

    #[test]
    fn matches_deployment_by_name_prefix() {
        let pod = Pod {
            metadata: ObjectMeta {
                name: Some("payments-api-7d9f8c-xk2".into()),
                ..Default::default()
            },
            ..Default::default()
        };
        assert!(pod_matches_deployment(&pod, "payments-api"));
        assert!(!pod_matches_deployment(&pod, "other"));
    }

    #[test]
    fn matches_deployment_by_replicaset_owner() {
        let pod = Pod {
            metadata: ObjectMeta {
                name: Some("xyz-abc".into()),
                owner_references: Some(vec![OwnerReference {
                    api_version: "apps/v1".into(),
                    kind: "ReplicaSet".into(),
                    name: "payments-api-7d9f8c".into(),
                    uid: "1".into(),
                    ..Default::default()
                }]),
                ..Default::default()
            },
            ..Default::default()
        };
        assert!(pod_matches_deployment(&pod, "payments-api"));
    }
}
