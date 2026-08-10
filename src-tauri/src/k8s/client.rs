//! Per-session Kubernetes client routed through the local SSH forward.

use crate::error::{FaroError, FaroResult};
use base64::Engine;

/// Decode EKS `certificateAuthority.data` into DER cert bytes for kube/rustls.
/// EKS returns base64(PEM); kube `root_cert` expects DER (PEM body), not PEM text.
fn ca_ders_from_eks_b64(ca_b64: &str) -> FaroResult<Vec<Vec<u8>>> {
    let raw = base64::engine::general_purpose::STANDARD
        .decode(ca_b64.trim())
        .or_else(|_| base64::engine::general_purpose::STANDARD_NO_PAD.decode(ca_b64.trim()))
        .map_err(|_| FaroError::Message("EKS cluster CA is not valid base64".into()))?;
    if raw.is_empty() {
        return Err(FaroError::Message("EKS cluster CA is empty".into()));
    }
    // Already DER (ASN.1 SEQUENCE)
    if raw.first() == Some(&0x30) {
        return Ok(vec![raw]);
    }
    let parsed = pem::parse_many(&raw)
        .map_err(|_| FaroError::Message("EKS cluster CA is not valid PEM/DER".into()))?;
    let ders: Vec<Vec<u8>> = parsed
        .into_iter()
        .filter(|p| p.tag() == "CERTIFICATE")
        .map(|p| p.into_contents())
        .collect();
    if ders.is_empty() {
        return Err(FaroError::Message(
            "EKS cluster CA PEM contained no CERTIFICATE blocks".into(),
        ));
    }
    Ok(ders)
}

/// Build a kube client that talks to the EKS API via `https://127.0.0.1:{local_port}`
/// (SSH `-L` forward). `api_host` is the real EKS API hostname (no scheme) used for TLS SNI
/// so the cluster CA validates correctly despite connecting to loopback.
pub fn build_client(
    local_port: u16,
    api_host: &str,
    ca_b64: &str,
    token: &str,
) -> FaroResult<kube::Client> {
    let ca_ders = ca_ders_from_eks_b64(ca_b64)?;
    if token.trim().is_empty() {
        return Err(FaroError::Message("EKS token is empty".into()));
    }
    let host = api_host
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/')
        .to_string();
    if host.is_empty() {
        return Err(FaroError::Message(
            "EKS API host is required for Kubernetes TLS".into(),
        ));
    }
    let uri = format!("https://127.0.0.1:{local_port}")
        .parse()
        .map_err(|_| FaroError::Message("invalid local Kubernetes endpoint".into()))?;
    let mut config = kube::Config::new(uri);
    config.root_cert = Some(ca_ders);
    config.auth_info.token = Some(token.trim().into());
    // Cert is issued for the EKS hostname, not 127.0.0.1 — set SNI/server name.
    config.tls_server_name = Some(host);
    kube::Client::try_from(config).map_err(|e| {
        FaroError::Message(format!(
            "unable to create Kubernetes client ({e}); check tunnel, cluster CA, and EKS token"
        ))
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    fn pem_ca_b64() -> String {
        let der = vec![0x30u8, 0x03, 0x01, 0x01, 0xff];
        let body = base64::engine::general_purpose::STANDARD.encode(&der);
        let pem = format!("-----BEGIN CERTIFICATE-----\n{body}\n-----END CERTIFICATE-----\n");
        base64::engine::general_purpose::STANDARD.encode(pem.as_bytes())
    }

    #[test]
    fn rejects_empty_token() {
        match build_client(8443, "api.example.eks.amazonaws.com", &pem_ca_b64(), "") {
            Err(e) => assert!(e.to_string().contains("token is empty")),
            Ok(_) => panic!("expected error"),
        }
    }

    #[test]
    fn rejects_empty_api_host() {
        match build_client(8443, "  ", &pem_ca_b64(), "tok") {
            Err(e) => assert!(e.to_string().contains("API host")),
            Ok(_) => panic!("expected error"),
        }
    }

    #[test]
    fn decodes_pem_wrapped_ca_to_der() {
        let ders = ca_ders_from_eks_b64(&pem_ca_b64()).expect("decode");
        assert_eq!(ders.len(), 1);
        assert_eq!(ders[0], vec![0x30, 0x03, 0x01, 0x01, 0xff]);
    }

    #[test]
    fn accepts_raw_der_after_b64() {
        let der = vec![0x30, 0x03, 0x01, 0x01, 0xff];
        let b64 = base64::engine::general_purpose::STANDARD.encode(&der);
        let ders = ca_ders_from_eks_b64(&b64).expect("decode");
        assert_eq!(ders, vec![der]);
    }
}
