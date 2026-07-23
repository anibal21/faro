# Contracts: Tauri commands (local IPC)

**Feature**: 001-eks-log-monitor  
**Audience**: Frontend ↔ Rust backend  
**Network**: Commands MUST only open connections to user-configured bastion/EKS. No third-party telemetry payloads.

All mutating Kubernetes operations are **forbidden** in v1.

## Environments

### `env_list` → `ConnectionInstance[]`

### `env_upsert` (create/update)

Input: fields from data-model (paths/names only).  
Reject if `pem_path` or `iam_credentials_path` empty; never accept PEM body or IAM secret values in the payload.  
Required: bastion SSH fields, `region_name`, `cluster_name`.

### `env_delete` (id)

### `env_load` (ids: UUID[])

Adds instances to **loaded** set (sidebar). Does not imply connect.

### `env_set_active` (id)

Sets active instance; invalidates prior live sessions.

### `env_connect` / `env_disconnect`

Establish or tear down SSH tunnel + kube client for active instance.  
On connect: read IAM credentials from `iam_credentials_path` (in memory only) → EKS token; use `region_name` + `cluster_name` (DescribeCluster as needed).  
Errors: actionable, no secret material in messages.

---

## Catalog (read-only)

### `k8s_list_deployments` (namespace?)

Returns DeploymentArtifact[].

### `k8s_list_configmaps` (namespace?)

Returns ConfigMapArtifact[].

### `k8s_get_configmap` (namespace, name)

Read-only keys/values (safe truncation for large/binary).

---

## Logs

### `logs_open` (namespace, deployment)

Starts aggregated follow for all replicas → emits events `logs_chunk`.

### `logs_close` (window_id)

### `logs_set_view` (window_id, `structured` | `raw`)

UI mode only; stream continues.

Events:

- `logs_chunk` — raw write payloads + pod identity + timestamps when available  
- `logs_status` — following / idle / error / no pods

Frontend builds Structured write-groups from write boundaries; Raw renders bytes/text unmodified.

---

## Analysis

### `analyze_write_group` (payload: text of write-group)

Runs local Spring Boot rules. Returns `AnalysisFinding[]` (may be empty).  
MUST NOT send payload off-machine.

---

## Preferences

### `prefs_get` / `prefs_set`

Includes `theme: light | dark`.
