//! EKS auth: bastion describe-cluster + get-token; optional legacy local IAM helpers.

use crate::error::{FaroError, FaroResult};
use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone)]
pub struct IamFilePresence {
    pub has_access_key_id: bool,
    pub has_secret_access_key: bool,
}

/// Parse a simple credentials file (INI-like or KEY=VALUE lines).
/// Legacy helper — live connect no longer requires a laptop IAM file.
#[allow(dead_code)]
pub fn validate_iam_credentials_file(path: &str) -> FaroResult<IamFilePresence> {
    let keys = read_iam_keys(path)?;
    Ok(IamFilePresence {
        has_access_key_id: !keys.access_key_id.is_empty(),
        has_secret_access_key: !keys.secret_access_key.is_empty(),
    })
}

struct IamKeys {
    access_key_id: String,
    secret_access_key: String,
    session_token: Option<String>,
}

fn read_iam_keys(path: &str) -> FaroResult<IamKeys> {
    let p = Path::new(path);
    if !p.is_file() {
        return Err(FaroError::Message(
            "IAM credentials file not found at the configured path".into(),
        ));
    }
    let content = fs::read_to_string(p).map_err(|_| {
        FaroError::Message("unable to read IAM credentials file (check permissions)".into())
    })?;
    let mut access_key_id = String::new();
    let mut secret_access_key = String::new();
    let mut session_token = String::new();
    for raw in content.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with('[') {
            continue;
        }
        let Some((k, v)) = line.split_once('=') else {
            continue;
        };
        let key = k.trim().to_ascii_lowercase();
        let val = v.trim().trim_matches('"').to_string();
        match key.as_str() {
            "aws_access_key_id" => access_key_id = val,
            "aws_secret_access_key" => secret_access_key = val,
            "aws_session_token" => session_token = val,
            _ => {}
        }
    }
    if access_key_id.is_empty() || secret_access_key.is_empty() {
        return Err(FaroError::Message(
            "IAM credentials file must include aws_access_key_id and aws_secret_access_key".into(),
        ));
    }
    if access_key_id.starts_with("ASIA") && session_token.is_empty() {
        return Err(FaroError::Message(
            "IAM file uses temporary keys (ASIA…); add aws_session_token or use long-lived AKIA keys"
                .into(),
        ));
    }
    Ok(IamKeys {
        access_key_id,
        secret_access_key,
        session_token: if session_token.is_empty() {
            None
        } else {
            Some(session_token)
        },
    })
}

fn sanitize_aws_stderr(raw: &str) -> String {
    let mut out = raw.replace('\r', " ").replace('\n', " ");
    for marker in [
        "AKIA",
        "ASIA",
        "aws_secret",
        "SecretAccessKey",
        "SessionToken",
    ] {
        if let Some(idx) = out.to_lowercase().find(&marker.to_lowercase()) {
            let end = (idx + 12).min(out.len());
            out.replace_range(idx..end, "[redacted]");
        }
    }
    let trimmed = out.trim();
    if trimmed.len() > 280 {
        format!("{}…", &trimmed[..280])
    } else {
        trimmed.to_string()
    }
}

fn aws_json(args: &[&str], iam_path: &str, region_name: &str) -> FaroResult<serde_json::Value> {
    let keys = read_iam_keys(iam_path)?;
    let mut cmd = Command::new("aws");
    cmd.args(args)
        .env("AWS_ACCESS_KEY_ID", &keys.access_key_id)
        .env("AWS_SECRET_ACCESS_KEY", &keys.secret_access_key)
        .env("AWS_DEFAULT_REGION", region_name.trim())
        .env("AWS_REGION", region_name.trim())
        .env("AWS_EC2_METADATA_DISABLED", "true")
        .env_remove("AWS_SHARED_CREDENTIALS_FILE")
        .env_remove("AWS_PROFILE")
        .env_remove("AWS_DEFAULT_PROFILE");
    if let Some(ref token) = keys.session_token {
        cmd.env("AWS_SESSION_TOKEN", token);
    } else {
        cmd.env_remove("AWS_SESSION_TOKEN");
    }
    let output = cmd
        .output()
        .map_err(|_| FaroError::Message("unable to run AWS CLI; install/configure aws".into()))?;
    drop(keys);
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let detail = sanitize_aws_stderr(&stderr);
        let msg = if detail
            .to_lowercase()
            .contains("unrecognizedclientexception")
            || detail.to_lowercase().contains("security token")
        {
            "AWS rejected the IAM keys in your credentials file (invalid, expired, or wrong account). Check aws_access_key_id / aws_secret_access_key (and aws_session_token if using temporary ASIA keys). Do not use fixtures/demo-iam-credentials for a live cluster.".into()
        } else if detail.is_empty() {
            "AWS CLI request failed; verify IAM credentials, region, cluster name, and eks:DescribeCluster / get-token permissions".into()
        } else {
            format!("AWS CLI failed: {detail}")
        };
        return Err(FaroError::Message(msg));
    }
    serde_json::from_slice(&output.stdout)
        .map_err(|_| FaroError::Message("AWS CLI returned invalid JSON".into()))
}

fn parse_describe_cluster_json(data: &serde_json::Value) -> FaroResult<(String, String)> {
    let endpoint = data
        .pointer("/cluster/endpoint")
        .and_then(|v| v.as_str())
        .ok_or_else(|| {
            FaroError::Message(
                "EKS cluster endpoint missing from bastion describe-cluster response".into(),
            )
        })?;
    let host = endpoint
        .trim_start_matches("https://")
        .trim_end_matches('/')
        .to_string();
    let ca = data
        .pointer("/cluster/certificateAuthority/data")
        .and_then(|v| v.as_str())
        .ok_or_else(|| {
            FaroError::Message(
                "EKS cluster CA missing from bastion describe-cluster response".into(),
            )
        })?;
    Ok((host, ca.to_string()))
}

/// Legacy local describe (laptop IAM file). Live connect uses [`describe_cluster_endpoint_via_bastion`].
#[allow(dead_code)]
pub fn describe_cluster_endpoint(
    region_name: &str,
    cluster_name: &str,
    iam_path: &str,
) -> FaroResult<(String, String)> {
    if region_name.trim().is_empty() || cluster_name.trim().is_empty() {
        return Err(FaroError::Message(
            "region_name and cluster_name are required".into(),
        ));
    }
    let data = aws_json(
        &[
            "eks",
            "describe-cluster",
            "--region",
            region_name.trim(),
            "--name",
            cluster_name.trim(),
            "--output",
            "json",
        ],
        iam_path,
        region_name,
    )?;
    parse_describe_cluster_json(&data)
}

/// Legacy local get-token. Live connect uses [`mint_eks_token_via_bastion`].
#[allow(dead_code)]
pub fn mint_eks_token(region_name: &str, cluster_name: &str, iam_path: &str) -> FaroResult<String> {
    let data = aws_json(
        &[
            "eks",
            "get-token",
            "--region",
            region_name.trim(),
            "--cluster-name",
            cluster_name.trim(),
            "--output",
            "json",
        ],
        iam_path,
        region_name,
    )?;
    data.pointer("/status/token")
        .and_then(|v| v.as_str())
        .map(str::to_owned)
        .ok_or_else(|| FaroError::Message("EKS token missing from AWS response".into()))
}

fn assert_safe_aws_ident(value: &str, label: &str) -> FaroResult<()> {
    let v = value.trim();
    if v.is_empty()
        || !v
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err(FaroError::Message(format!(
            "{label} contains invalid characters"
        )));
    }
    Ok(())
}

fn bastion_describe_remote_cmd(region_name: &str, cluster_name: &str) -> String {
    format!(
        "aws eks describe-cluster --region {} --name {} --output json",
        region_name.trim(),
        cluster_name.trim()
    )
}

/// Resolve endpoint + CA **on the bastion** (no laptop IAM file).
pub fn describe_cluster_endpoint_via_bastion(
    bastion_host: &str,
    ssh_port: i64,
    ssh_user: &str,
    pem_path: &str,
    region_name: &str,
    cluster_name: &str,
) -> FaroResult<(String, String)> {
    assert_safe_aws_ident(region_name, "region_name")?;
    assert_safe_aws_ident(cluster_name, "cluster_name")?;
    let remote = bastion_describe_remote_cmd(region_name, cluster_name);
    let stdout = crate::ssh::tunnel::ssh_exec(
        bastion_host,
        ssh_port,
        ssh_user,
        pem_path,
        &remote,
    )
    .map_err(|e| {
        let msg = e.to_string();
        let detail = sanitize_aws_stderr(&msg);
        if detail.is_empty() {
            FaroError::Message(
                "bastion cannot describe cluster — check SSH/PEM, AWS CLI on bastion, region, and cluster name"
                    .into(),
            )
        } else {
            FaroError::Message(format!("bastion cannot describe cluster: {detail}"))
        }
    })?;
    let data: serde_json::Value = serde_json::from_str(stdout.trim()).map_err(|_| {
        FaroError::Message(
            "bastion aws eks describe-cluster returned invalid JSON (is AWS CLI installed on the bastion?)"
                .into(),
        )
    })?;
    parse_describe_cluster_json(&data)
}

/// Mint EKS token **on the bastion** (instance role / bastion AWS identity).
pub fn mint_eks_token_via_bastion(
    bastion_host: &str,
    ssh_port: i64,
    ssh_user: &str,
    pem_path: &str,
    region_name: &str,
    cluster_name: &str,
) -> FaroResult<String> {
    assert_safe_aws_ident(region_name, "region_name")?;
    assert_safe_aws_ident(cluster_name, "cluster_name")?;
    let remote = format!(
        "aws eks get-token --region {} --cluster-name {} --output json",
        region_name.trim(),
        cluster_name.trim()
    );
    let stdout = crate::ssh::tunnel::ssh_exec(bastion_host, ssh_port, ssh_user, pem_path, &remote)?;
    let data: serde_json::Value = serde_json::from_str(stdout.trim()).map_err(|_| {
        FaroError::Message(
            "bastion aws eks get-token returned invalid JSON (is AWS CLI installed on the bastion?)"
                .into(),
        )
    })?;
    data.pointer("/status/token")
        .and_then(|v| v.as_str())
        .map(str::to_owned)
        .ok_or_else(|| {
            FaroError::Message("EKS token missing from bastion aws eks get-token response".into())
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn parses_iam_file_presence() {
        let mut f = NamedTempFile::new().unwrap();
        writeln!(
            f,
            "aws_access_key_id=AKIAEXAMPLE\naws_secret_access_key=secretvalue"
        )
        .unwrap();
        let p = validate_iam_credentials_file(f.path().to_str().unwrap()).unwrap();
        assert!(p.has_access_key_id && p.has_secret_access_key);
    }

    #[test]
    fn rejects_incomplete_iam_file() {
        let mut f = NamedTempFile::new().unwrap();
        writeln!(f, "aws_access_key_id=AKIAEXAMPLE").unwrap();
        assert!(validate_iam_credentials_file(f.path().to_str().unwrap()).is_err());
    }

    #[test]
    fn parses_ini_profile_style() {
        let mut f = NamedTempFile::new().unwrap();
        writeln!(
            f,
            "[default]\naws_access_key_id = AKIAEXAMPLE\naws_secret_access_key = secretvalue"
        )
        .unwrap();
        let p = validate_iam_credentials_file(f.path().to_str().unwrap()).unwrap();
        assert!(p.has_access_key_id && p.has_secret_access_key);
    }

    #[test]
    fn sanitize_aws_stderr_redacts_key_markers() {
        let raw = "UnrecognizedClientException AKIAEXAMPLEKEYID more text";
        let out = sanitize_aws_stderr(raw);
        assert!(out.contains("[redacted]"));
        assert!(!out.contains("AKIAEXAMPLE"));
    }

    #[test]
    fn bastion_describe_cmd_uses_name_and_region() {
        let cmd = bastion_describe_remote_cmd("us-east-1", "my-cluster");
        assert!(cmd.contains("--region us-east-1"));
        assert!(cmd.contains("--name my-cluster"));
        assert!(cmd.contains("describe-cluster"));
        assert!(!cmd.contains("--cluster-name"));
    }

    #[test]
    fn parse_describe_cluster_json_extracts_host_and_ca() {
        let data = serde_json::json!({
            "cluster": {
                "endpoint": "https://ABCD.gr7.us-east-1.eks.amazonaws.com",
                "certificateAuthority": { "data": "YmFzZTY0Y2E=" }
            }
        });
        let (host, ca) = parse_describe_cluster_json(&data).unwrap();
        assert_eq!(host, "ABCD.gr7.us-east-1.eks.amazonaws.com");
        assert_eq!(ca, "YmFzZTY0Y2E=");
    }

    #[test]
    fn parse_describe_cluster_json_rejects_missing_fields() {
        let data = serde_json::json!({ "cluster": {} });
        assert!(parse_describe_cluster_json(&data).is_err());
    }
}
