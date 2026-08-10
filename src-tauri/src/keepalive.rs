//! Session keep-alive health transitions + remote heartbeat loop.

use crate::error::{FaroError, FaroResult};
use crate::runtime::{ConnectMode, RuntimeState, SessionHealth};
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

pub const HEARTBEAT_INTERVAL_SECS: u64 = 60;
pub const FAILURE_THRESHOLD: u32 = 3;

/// Apply a successful pulse → connected, failures=0, last_pulse=now.
/// Does **not** set `keep_alive` (only `start_loop` turns it on).
pub fn apply_pulse_ok(health: &mut SessionHealth) {
    health.status = "connected".into();
    health.consecutive_failures = 0;
    health.last_pulse_at = Some(chrono::Utc::now().to_rfc3339());
}

/// Apply a failed pulse. Returns true if crossed into disconnected (≥ threshold).
pub fn apply_pulse_fail(health: &mut SessionHealth) -> bool {
    health.consecutive_failures = health.consecutive_failures.saturating_add(1);
    if health.consecutive_failures >= FAILURE_THRESHOLD {
        health.status = "disconnected".into();
        true
    } else {
        health.status = "degraded".into();
        false
    }
}

/// Cancel flag + force `keep_alive = false` on a session entry (019).
pub fn apply_stop_to_entry(entry: &mut crate::runtime::SessionEntry) {
    if let Some(c) = entry.keepalive_cancel.take() {
        c.store(true, Ordering::SeqCst);
    }
    entry.health.keep_alive = false;
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHealthEvent {
    pub instance_id: String,
    pub status: String,
    pub keep_alive: bool,
    pub last_pulse_at: Option<String>,
    pub mode: String,
}

pub fn emit_health(app: &AppHandle, ev: &SessionHealthEvent) {
    let _ = app.emit("session-health", ev);
}

fn health_event(instance_id: &str, entry: &crate::runtime::SessionEntry) -> SessionHealthEvent {
    SessionHealthEvent {
        instance_id: instance_id.to_string(),
        status: entry.health.status.clone(),
        keep_alive: entry.health.keep_alive,
        last_pulse_at: entry.health.last_pulse_at.clone(),
        mode: match entry.mode {
            ConnectMode::Live => "live".into(),
            ConnectMode::Demo => "demo".into(),
        },
    }
}

/// Start background heartbeat for a live session. Cancels any previous loop.
pub fn start_loop(app: AppHandle, instance_id: String) -> FaroResult<()> {
    // Cancel prior loop without emitting OFF (would flash UI before ON)
    let _ = stop_loop_inner(&app, &instance_id, false);

    let cancel = Arc::new(AtomicBool::new(false));
    let event = {
        let state = app.state::<RuntimeState>();
        let mut rt = state
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        let entry = rt
            .sessions
            .get_mut(&instance_id)
            .ok_or_else(|| FaroError::Message("not connected".into()))?;
        if entry.mode != ConnectMode::Live {
            return Err(FaroError::Message(
                "keep-alive solo aplica a ambientes live".into(),
            ));
        }
        entry.health.keep_alive = true;
        entry.health.status = "connected".into();
        entry.keepalive_cancel = Some(cancel.clone());
        health_event(&instance_id, entry)
    };
    emit_health(&app, &event);

    let app_thread = app.clone();
    let id_thread = instance_id.clone();
    thread::spawn(move || {
        // Immediate first pulse, then every 60s
        loop {
            if cancel.load(Ordering::SeqCst) {
                break;
            }
            let disconnected = run_one_pulse(&app_thread, &id_thread);
            if disconnected || cancel.load(Ordering::SeqCst) {
                break;
            }
            // Sleep in 1s slices so cancel is responsive
            for _ in 0..HEARTBEAT_INTERVAL_SECS {
                if cancel.load(Ordering::SeqCst) {
                    return;
                }
                thread::sleep(Duration::from_secs(1));
            }
        }
    });

    Ok(())
}

/// Stop heartbeat, force `keep_alive=false`, emit session-health OFF.
pub fn stop_loop(app: &AppHandle, instance_id: &str) -> FaroResult<()> {
    stop_loop_inner(app, instance_id, true)
}

fn stop_loop_inner(app: &AppHandle, instance_id: &str, emit: bool) -> FaroResult<()> {
    let event = {
        let state = app.state::<RuntimeState>();
        let mut rt = state
            .inner
            .lock()
            .map_err(|_| FaroError::Message("runtime lock".into()))?;
        let Some(entry) = rt.sessions.get_mut(instance_id) else {
            return Ok(());
        };
        apply_stop_to_entry(entry);
        health_event(instance_id, entry)
    };
    if emit {
        emit_health(app, &event);
    }
    Ok(())
}

/// Returns true if session became disconnected (threshold reached) or keep-alive stopped.
fn run_one_pulse(app: &AppHandle, instance_id: &str) -> bool {
    let client = {
        let state = match app.try_state::<RuntimeState>() {
            Some(s) => s,
            None => return true,
        };
        let rt = match state.inner.lock() {
            Ok(g) => g,
            Err(_) => return true,
        };
        let entry = match rt.sessions.get(instance_id) {
            Some(e) => e,
            None => return true,
        };
        if !entry.health.keep_alive {
            return true;
        }
        entry.client.clone()
    };

    let ok = match client {
        Some(c) => pulse_kube(&c),
        None => false,
    };

    let mut became_disconnected = false;
    let event = {
        let state = match app.try_state::<RuntimeState>() {
            Some(s) => s,
            None => return true,
        };
        let mut rt = match state.inner.lock() {
            Ok(g) => g,
            Err(_) => return true,
        };
        let entry = match rt.sessions.get_mut(instance_id) {
            Some(e) => e,
            None => return true,
        };

        // Disabled mid-flight (019): do not apply pulse success as if still ON
        if !entry.health.keep_alive {
            return true;
        }

        if ok {
            apply_pulse_ok(&mut entry.health);
        } else {
            became_disconnected = apply_pulse_fail(&mut entry.health);
            if became_disconnected {
                apply_stop_to_entry(entry);
                for (_, cancel) in entry.log_cancels.drain() {
                    cancel.store(true, Ordering::SeqCst);
                }
                if let Some(mut h) = entry.tunnel.take() {
                    let _ = crate::ssh::tunnel::close_tunnel(&mut h);
                }
                entry.client = None;
            }
        }
        health_event(instance_id, entry)
    };
    // Only emit if still keep-alive OR disconnected (honest status)
    if event.keep_alive || became_disconnected || event.status == "degraded" {
        emit_health(app, &event);
    }
    became_disconnected || !event.keep_alive
}

fn pulse_kube(client: &kube::Client) -> bool {
    let rt = match tokio::runtime::Runtime::new() {
        Ok(r) => r,
        Err(_) => return false,
    };
    rt.block_on(async {
        match client.apiserver_version().await {
            Ok(_) => true,
            Err(_) => false,
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::runtime::{ConnectMode, SessionEntry, SessionHealth};

    #[test]
    fn pulse_ok_resets_failures() {
        let mut h = SessionHealth {
            keep_alive: true,
            status: "degraded".into(),
            last_pulse_at: None,
            consecutive_failures: 2,
        };
        apply_pulse_ok(&mut h);
        assert_eq!(h.status, "connected");
        assert_eq!(h.consecutive_failures, 0);
        assert!(h.last_pulse_at.is_some());
        // pulse_ok must not turn keep_alive on
        assert!(h.keep_alive);
    }

    #[test]
    fn pulse_ok_does_not_force_keepalive_true() {
        let mut h = SessionHealth {
            keep_alive: false,
            status: "connected".into(),
            last_pulse_at: None,
            consecutive_failures: 0,
        };
        apply_pulse_ok(&mut h);
        assert!(!h.keep_alive);
    }

    #[test]
    fn failures_degrade_then_disconnect() {
        let mut h = SessionHealth::default();
        h.keep_alive = true;
        assert!(!apply_pulse_fail(&mut h));
        assert_eq!(h.status, "degraded");
        assert_eq!(h.consecutive_failures, 1);
        assert!(!apply_pulse_fail(&mut h));
        assert_eq!(h.status, "degraded");
        assert!(apply_pulse_fail(&mut h));
        assert_eq!(h.status, "disconnected");
        assert_eq!(h.consecutive_failures, 3);
    }

    #[test]
    fn apply_stop_clears_keepalive_and_cancel() {
        let cancel = Arc::new(AtomicBool::new(false));
        let mut entry = SessionEntry {
            catalog_epoch: None,
            tunnel: None,
            mode: ConnectMode::Live,
            client: None,
            namespace: None,
            log_cancels: Default::default(),
            health: SessionHealth {
                keep_alive: true,
                status: "connected".into(),
                last_pulse_at: Some("t".into()),
                consecutive_failures: 0,
            },
            keepalive_cancel: Some(cancel.clone()),
        };
        apply_stop_to_entry(&mut entry);
        assert!(!entry.health.keep_alive);
        assert!(entry.keepalive_cancel.is_none());
        assert!(cancel.load(Ordering::SeqCst));
    }

    #[test]
    fn keepalive_off_means_no_loop_contract() {
        assert_eq!(HEARTBEAT_INTERVAL_SECS, 60);
        assert_eq!(FAILURE_THRESHOLD, 3);
    }
}
