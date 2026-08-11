# Contract: Bastion cluster discovery

## Purpose

Resolve EKS API hostname and CA for the tunnel **without** laptop cloud credentials.

## Behavior

```text
describe_cluster_endpoint_via_bastion(
  bastion_host, ssh_port, ssh_user, pem_path,
  region_name, cluster_name
) -> (api_host, ca_b64)
```

Remote command (bastion):

```text
aws eks describe-cluster --region <region> --name <cluster> --output json
```

Parse:

- `cluster.endpoint` → strip `https://` → `api_host`  
- `cluster.certificateAuthority.data` → `ca_b64`

## Errors

- SSH/PEM failure → actionable, no PEM body.  
- Missing AWS CLI / bad JSON / missing fields → actionable (“bastion cannot describe cluster…”).  
- AWS stderr sanitized (no access key / token leakage).

## Non-goals

- Does not open the kube tunnel.  
- Does not mint the Kubernetes bearer token (separate bastion get-token contract already exists).
