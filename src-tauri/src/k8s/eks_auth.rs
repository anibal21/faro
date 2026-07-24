//! Read IAM credentials **file path** at connect time — never persist secret values.

use crate::error::{FaroError, FaroResult};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct IamFilePresence {
    pub has_access_key_id: bool,
    pub has_secret_access_key: bool,
}

/// Parse a simple credentials file (INI-like or KEY=VALUE lines).
/// Returns only presence flags — never returns secret strings to callers for logging.
pub fn validate_iam_credentials_file(path: &str) -> FaroResult<IamFilePresence> {
    let p = Path::new(path);
    if !p.is_file() {
        return Err(FaroError::Message(
            "IAM credentials file not found at the configured path".into(),
        ));
    }
    let content = fs::read_to_string(p).map_err(|_| {
        FaroError::Message("unable to read IAM credentials file (check permissions)".into())
    })?;
    let lower = content.to_lowercase();
    let has_access_key_id = lower.contains("aws_access_key_id");
    let has_secret_access_key = lower.contains("aws_secret_access_key");
    if !has_access_key_id || !has_secret_access_key {
        return Err(FaroError::Message(
            "IAM credentials file must include aws_access_key_id and aws_secret_access_key"
                .into(),
        ));
    }
    Ok(IamFilePresence {
        has_access_key_id,
        has_secret_access_key,
    })
}

/// Mint a short-lived EKS token placeholder for demo/local flows.
/// Real aws-sdk `get_token` replaces this when AWS network is available.
pub fn mint_eks_token_stub(region_name: &str, cluster_name: &str) -> FaroResult<String> {
    if region_name.trim().is_empty() || cluster_name.trim().is_empty() {
        return Err(FaroError::Message(
            "region_name and cluster_name are required".into(),
        ));
    }
    // Opaque stub — not a real AWS token; sufficient for session bookkeeping offline.
    Ok(format!(
        "faro-demo-token:{region}:{cluster}",
        region = region_name.trim(),
        cluster = cluster_name.trim()
    ))
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
}
