//! SSH tunnel — PEM path only (no key material in DB).

use crate::error::{FaroError, FaroResult};
use std::net::{TcpListener, TcpStream};
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

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
        return Err(FaroError::Message(
            "PEM file not found at path (check the configured path)".into(),
        ));
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
        return Err(FaroError::Message(
            "EKS API host is required to open SSH tunnel".into(),
        ));
    }
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|_| FaroError::Message("unable to allocate local tunnel port".into()))?;
    let local_port = listener
        .local_addr()
        .map_err(|_| FaroError::Message("unable to inspect local tunnel port".into()))?
        .port();
    drop(listener);
    let child = Command::new("ssh")
        .args([
            "-i",
            pem_path,
            "-N",
            "-L",
            &format!("{local_port}:{}:443", forward_host.trim()),
            "-p",
            &ssh_port.to_string(),
            &format!("{}@{}", ssh_user.trim(), bastion_host.trim()),
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=accept-new",
            "-o",
            "ExitOnForwardFailure=yes",
            "-o",
            "ServerAliveInterval=15",
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| {
            FaroError::Message(
                "unable to start OpenSSH tunnel; install/configure the ssh client".into(),
            )
        })?;
    let mut handle = TunnelHandle {
        bastion_host: bastion_host.trim().to_string(),
        ssh_port,
        ssh_user: ssh_user.trim().to_string(),
        pem_path: pem_path.trim().to_string(),
        local_port,
        child,
    };
    if let Err(e) = wait_local_port(local_port, Duration::from_secs(15)) {
        let _ = close_tunnel(&mut handle);
        return Err(e);
    }
    Ok(handle)
}

fn wait_local_port(port: u16, timeout: Duration) -> FaroResult<()> {
    let deadline = Instant::now() + timeout;
    let addr = format!("127.0.0.1:{port}");
    while Instant::now() < deadline {
        if TcpStream::connect_timeout(
            &addr
                .parse()
                .map_err(|_| FaroError::Message("invalid tunnel address".into()))?,
            Duration::from_millis(200),
        )
        .is_ok()
        {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(150));
    }
    Err(FaroError::Message(
        "SSH tunnel did not become ready in time (check bastion host, PEM, and network)".into(),
    ))
}

pub fn close_tunnel(handle: &mut TunnelHandle) -> FaroResult<()> {
    let _ = handle.child.kill();
    let _ = handle.child.wait();
    Ok(())
}

/// Run a remote command on the bastion over SSH (BatchMode). Returns stdout.
/// `remote_command` must already be a safe, non-interactive shell string.
pub fn ssh_exec(
    bastion_host: &str,
    ssh_port: i64,
    ssh_user: &str,
    pem_path: &str,
    remote_command: &str,
) -> FaroResult<String> {
    let path = Path::new(pem_path);
    if !path.is_file() {
        return Err(FaroError::Message(
            "PEM file not found at path (check the configured path)".into(),
        ));
    }
    if bastion_host.trim().is_empty() || ssh_user.trim().is_empty() {
        return Err(FaroError::Message(
            "bastion host and SSH user are required".into(),
        ));
    }
    if remote_command.trim().is_empty() {
        return Err(FaroError::Message("remote command is empty".into()));
    }
    let output = Command::new("ssh")
        .args([
            "-i",
            pem_path,
            "-p",
            &ssh_port.to_string(),
            &format!("{}@{}", ssh_user.trim(), bastion_host.trim()),
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=accept-new",
            "-o",
            "ConnectTimeout=20",
            remote_command,
        ])
        .stdin(Stdio::null())
        .output()
        .map_err(|_| {
            FaroError::Message(
                "unable to run SSH command on bastion; install/configure the ssh client".into(),
            )
        })?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let detail = stderr.replace('\r', " ").replace('\n', " ");
        let detail = detail.trim();
        let detail = if detail.len() > 220 {
            format!("{}…", &detail[..220])
        } else {
            detail.to_string()
        };
        return Err(FaroError::Message(if detail.is_empty() {
            "bastion SSH command failed".into()
        } else {
            format!("bastion SSH command failed: {detail}")
        }));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
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
