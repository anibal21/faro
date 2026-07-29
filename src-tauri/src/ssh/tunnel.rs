//! SSH tunnel — PEM path only (no key material in DB).

use crate::error::{FaroError, FaroResult};
use std::path::Path;
use std::net::TcpListener;
use std::process::{Child, Command, Stdio};

#[derive(Debug)]
#[allow(dead_code)]
pub struct TunnelHandle {
    pub bastion_host: String,
    pub ssh_port: i64,
    pub ssh_user: String,
    pub pem_path: String,
    pub local_port: u16,
    child: Child,
}

/// Open a distinct OpenSSH local forward for this environment session.
pub fn open_tunnel(
    bastion_host: &str,
    ssh_port: i64,
    ssh_user: &str,
    pem_path: &str,
    forward_host: &str,
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
    if forward_host.trim().is_empty() {
        return Err(FaroError::Message("EKS API host is required to open SSH tunnel".into()));
    }
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|_| FaroError::Message("unable to allocate local tunnel port".into()))?;
    let local_port = listener.local_addr()
        .map_err(|_| FaroError::Message("unable to inspect local tunnel port".into()))?
        .port();
    drop(listener);
    let child = Command::new("ssh")
        .args([
            "-i", pem_path,
            "-N",
            "-L", &format!("{local_port}:{}:443", forward_host.trim()),
            "-p", &ssh_port.to_string(),
            &format!("{}@{}", ssh_user.trim(), bastion_host.trim()),
            "-o", "BatchMode=yes",
            "-o", "StrictHostKeyChecking=accept-new",
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| FaroError::Message("unable to start OpenSSH tunnel; install/configure the ssh client".into()))?;
    Ok(TunnelHandle {
        bastion_host: bastion_host.trim().to_string(),
        ssh_port,
        ssh_user: ssh_user.trim().to_string(),
        pem_path: pem_path.trim().to_string(),
        local_port,
        child,
    })
}

pub fn close_tunnel(handle: &mut TunnelHandle) -> FaroResult<()> {
    let _ = handle.child.kill();
    let _ = handle.child.wait();
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn rejects_missing_pem() {
        let err = open_tunnel("h", 22, "u", r"C:\no\such\file.pem", "api.example").unwrap_err();
        assert!(err.to_string().contains("PEM file not found"));
    }

    #[test]
    fn validates_forward_host_before_spawning() {
        let mut f = NamedTempFile::new().unwrap();
        writeln!(f, "placeholder").unwrap();
        assert!(open_tunnel("bastion", 22, "ec2-user", f.path().to_str().unwrap(), "").is_err());
    }
}
