//! Documented unit coverage for IAM/EKS token (US4 / T034).
//! Executable tests live in `src-tauri/src/k8s/eks_auth.rs` (`cargo test`).

pub const COVERAGE: &[&str] = &[
    "validate_iam_credentials_file presence flags",
    "mint_eks_token_stub without leaking secrets",
];
