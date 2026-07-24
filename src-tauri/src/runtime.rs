//! In-memory connection / log-window runtime (not persisted).

use crate::ssh::tunnel::TunnelHandle;
use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

#[derive(Default)]
pub struct RuntimeInner {
    pub connected_instance_id: Option<String>,
    pub catalog_epoch: Option<String>,
    pub tunnel: Option<TunnelHandle>,
    pub log_cancels: HashMap<String, Arc<AtomicBool>>,
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
