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
On **successful** connect: mint `catalog_epoch`, **hydrate session-cache** tables once (namespaces, Deployments, ConfigMap list stubs) — see [data-model.md](../data-model.md).  
On disconnect: tear down tunnel/kube and **DELETE session-cache rows** for that `connection_instance_id`.  
App process exit / shutdown hook: **TRUNCATE/DELETE ALL session-cache tables** (best-effort — may not run on crash/kill).  
**App startup** (splash, before main window): **MUST** call `session_purge_ephemeral` — delete leftover `«session»` / log-ephemeral rows only; **keep** all durable environments and prefs.  
Errors: actionable, no secret material in messages.

---

## Catalog (read-only)

Catalog UI SHOULD read from SQLite **session cache** after hydrate. Live K8s list is used for hydrate / refresh only (not on every sidebar paint).

### `k8s_list_deployments` (namespace?)

Returns DeploymentArtifact[] — prefer cache for current `catalog_epoch`; may trigger hydrate if empty while connected.

### `k8s_list_configmaps` (namespace?)

Returns ConfigMapArtifact[] — same cache policy.

### `k8s_get_configmap` (namespace, name)

Read-only keys/values (safe truncation for large/binary). On first open in this epoch, fetch once and write `cached_configmap_entry` (`data_loaded=1`).

### `catalog_refresh`

Re-fetch catalog for the active connected instance: new `catalog_epoch`, replace session-cache rows for that instance. Does not drop durable `connection_instance` rows.

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

## Preferences & startup

### `prefs_get` / `prefs_set`

Includes `theme: light | dark`.

### `session_purge_ephemeral`

Called during **splash** (before main window).  
**MUST DELETE** all `«session»` / ephemeral tables left from a prior run (dirty exit): `connection_session`, `cached_*` catalog leftovers, and any future log-staging tables.  
**MUST NOT DELETE** durable rows: `connection_instance` (ambientes), `ui_preferences`, `analysis_finding_history`, `schema_meta`.  
Returns when purge completes so UI can dismiss splash and open the main window.

### App launch sequence

1. Show minimal splash (`01-splash-preparing.svg` intent).  
2. `session_purge_ephemeral`.  
3. Open main window → empty workspace or restore `last_active_instance_id` prefs (environments still present).
