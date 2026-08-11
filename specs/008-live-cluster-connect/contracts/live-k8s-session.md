# Contract: Live Kubernetes session (008)

## Connect pipeline (live only)

1. Validate PEM path, bastion host/user/port, IAM file presence, region, cluster, **namespace**.
2. Open SSH local forward to EKS API host:443 (unique `local_port`).
3. `DescribeCluster` → endpoint + CA; mint EKS bearer token from IAM file (memory only).
4. Build kube client → `https://127.0.0.1:{local_port}` + CA + token.
5. `hydrate_live` for **namespace only** → session SQLite.
6. Mark runtime session `mode=live`.

## Failures

| Stage | User-visible (no secrets) |
|-------|---------------------------|
| PEM missing | Path not found |
| SSH/bastion | Cannot reach bastion / auth failed |
| IAM file | Missing keys / unreadable |
| DescribeCluster / token | Cluster/auth error (no key material) |
| Kube list | Permission/namespace error |
| Timeout | Connect timed out |

**Never** call `hydrate_demo_catalog` on these paths.

## Reads (live)

| Operation | API shape |
|-----------|-----------|
| List Deployments | namespace-scoped |
| List Pods (by deployment) | namespace-scoped |
| List ConfigMaps | namespace-scoped |
| Get ConfigMap data | get by name |
| Logs follow | pod log stream(s), fan-in labeled by replica |
| Disconnect | drop forward + client; purge session rows for instance |

## Multi-session

Commands that touch cluster MUST resolve `instance_id` → that session’s client/tunnel. Cross-instance data access is a bug.
