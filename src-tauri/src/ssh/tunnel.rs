//! SSH tunnel — PEM path only (no key material in DB).

use crate::error::{FaroError, FaroResult};
use std::path::Path;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct TunnelHandle {
    pub bastion_host: String,
    pub ssh_port: i64,
    pub ssh_user: String,
    pub pem_path: String,
    pub local_port: u16,
}

/// Validate PEM path and open a logical tunnel handle.
/// Full russh port-forward can replace this stub without changing the IPC contract.
pub fn open_tunnel(
    bastion_host: &str,
    ssh_port: i64,
    ssh_user: &str,
    pem_path: &str,
) -> FaroResult<TunnelHandle> {
    let path = Path::new(pem_path);
    if !path.is_file() {
        return Err(FaroError::Message(format!(
            "PEM file not found at path (check the configured path)"
        )));
    }
    if bastion_host.trim().is_empty() || ssh_user.trim().is_empty() {
        return Err(FaroError::Message(
            "bastion host and SSH user are required to connect".into(),
        ));
    }
    if !(1..=65535).contains(&ssh_port) {
        return Err(FaroError::Message("invalid SSH port".into()));
    }
    // Demo/local: allocate a logical local port; real port-forward lands in a later hardening pass.
    Ok(TunnelHandle {
        bastion_host: bastion_host.trim().to_string(),
        ssh_port,
        ssh_user: ssh_user.trim().to_string(),
        pem_path: pem_path.trim().to_string(),
        local_port: 18443,
    })
}

pub fn close_tunnel(_handle: &TunnelHandle) -> FaroResult<()> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn rejects_missing_pem() {
        let err = open_tunnel("h", 22, "u", r"C:\no\such\file.pem").unwrap_err();
        assert!(err.to_string().contains("PEM file not found"));
    }

    #[test]
    fn accepts_existing_pem_path() {
        let mut f = NamedTempFile::new().unwrap();
        writeln!(f, "placeholder").unwrap();
        let handle = open_tunnel("bastion", 22, "ec2-user", f.path().to_str().unwrap()).unwrap();
        assert_eq!(handle.local_port, 18443);
    }
}
