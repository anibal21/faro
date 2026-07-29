//! Per-session Kubernetes client routed through the local SSH forward.

use crate::error::{FaroError, FaroResult};
use base64::Engine;

pub fn build_client(local_port: u16, ca_b64: &str, token: &str) -> FaroResult<kube::Client> {
    let ca = base64::engine::general_purpose::STANDARD
        .decode(ca_b64)
        .map_err(|_| FaroError::Message("EKS cluster CA is not valid base64".into()))?;
    let uri = format!("https://127.0.0.1:{local_port}")
        .parse()
        .map_err(|_| FaroError::Message("invalid local Kubernetes endpoint".into()))?;
    let mut config = kube::Config::new(uri);
    config.root_cert = Some(vec![ca]);
    config.auth_info.token = Some(token.into());
    kube::Client::try_from(config)
        .map_err(|_| FaroError::Message("unable to create Kubernetes client".into()))
}
