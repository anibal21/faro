//! Demo log follow stream (RAM only).

use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use k8s_openapi::api::core::v1::Pod;
use kube::{Api, Client};

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

pub fn start_demo_follow(
    app: AppHandle,
    window_id: String,
    deployment: String,
    cancel: Arc<AtomicBool>,
) {
    thread::spawn(move || {
        let _ = app.emit(
            "logs_status",
            LogsStatus {
                window_id: window_id.clone(),
                status: "following".into(),
            },
        );
        let pods = [
            format!("{deployment}-aaa"),
            format!("{deployment}-bbb"),
            format!("{deployment}-ccc"),
        ];
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
                    format!("INFO  c.e.PaymentService - processed request id={i}"),
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
                status: "idle".into(),
            },
        );
    });
}

/// Best-effort live log read. The runtime session owns the client and cancellation flag.
pub fn start_live_follow(
    app: AppHandle,
    window_id: String,
    namespace: String,
    deployment: String,
    client: Client,
    cancel: Arc<AtomicBool>,
) {
    thread::spawn(move || {
        let _ = app.emit("logs_status", LogsStatus { window_id: window_id.clone(), status: "following".into() });
        let result: Result<(String, String), ()> = tokio::runtime::Runtime::new()
            .map_err(|_| ())
            .and_then(|runtime| runtime.block_on(async {
            let pods: Vec<Pod> = Api::namespaced(client.clone(), &namespace).list(&Default::default()).await?.items;
            let pod = pods.into_iter().find_map(|pod| {
                pod.metadata.name.as_ref()
                    .filter(|name| name.starts_with(&deployment))
                    .map(|name| name.clone())
            });
            match pod {
                Some(pod) => Api::<Pod>::namespaced(client, &namespace).logs(&pod, &Default::default()).await.map(|text| (pod, text)),
                None => Ok(("".into(), "".into())),
            }
        }).map_err(|_| ()));
        if !cancel.load(Ordering::SeqCst) {
            match result {
                Ok((pod_name, text)) if !pod_name.is_empty() => {
                    let _ = app.emit("logs_chunk", LogsChunk {
                        window_id: window_id.clone(), pod_name, text, timestamp: chrono::Utc::now().to_rfc3339(),
                    });
                }
                Ok(_) => {
                    let _ = app.emit("logs_status", LogsStatus { window_id: window_id.clone(), status: "no matching pods".into() });
                }
                Err(_) => {
                    let _ = app.emit("logs_status", LogsStatus { window_id: window_id.clone(), status: "live log request failed".into() });
                }
            }
        }
        let _ = app.emit("logs_status", LogsStatus { window_id, status: "idle".into() });
    });
}
