//! In-memory connection / log-window runtime (not persisted).

use crate::ssh::tunnel::TunnelHandle;
use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectMode {
    Demo,
    Live,
}

pub struct SessionEntry {
    pub catalog_epoch: Option<String>,
    pub tunnel: Option<TunnelHandle>,
    pub mode: ConnectMode,
    pub client: Option<kube::Client>,
    pub namespace: Option<String>,
    pub log_cancels: HashMap<String, Arc<AtomicBool>>,
}

#[derive(Default)]
pub struct RuntimeInner {
    /// Multi-session map keyed by environment instance id.
    pub sessions: HashMap<String, SessionEntry>,
    /// Focus session for catalog/logs commands that omit instanceId (compat).
    pub focused_instance_id: Option<String>,
}

impl RuntimeInner {
    pub fn focused_session(&self) -> Option<&SessionEntry> {
        self.focused_instance_id
            .as_ref()
            .and_then(|id| self.sessions.get(id))
    }

    pub fn focused_session_mut(&mut self) -> Option<&mut SessionEntry> {
        let id = self.focused_instance_id.clone()?;
        self.sessions.get_mut(&id)
    }
}

pub struct RuntimeState {
    pub inner: Mutex<RuntimeInner>,
}

impl RuntimeState {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(RuntimeInner::default()),
        }
    }
}
