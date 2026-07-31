# Contract: Live connect without local IAM

## Live connect (non-demo)

MUST NOT:

- Call `validate_iam_credentials_file`  
- Read laptop IAM/credentials file contents  
- Call local `describe_cluster_endpoint(..., iam_path)`  

MUST:

1. Bastion describe → `(api_host, ca)`  
2. Open SSH tunnel to `api_host` with PEM  
3. Bastion `get-token` (existing)  
4. Build client + hydrate catalog  

On failure after tunnel start: close tunnel; return sanitized error.

## Demo connect

Unchanged: no bastion describe, no IAM, sample catalog.

## Legacy rows

If `iam_credentials_path` is non-empty in SQLite, connect behavior identical to empty — path unused.
