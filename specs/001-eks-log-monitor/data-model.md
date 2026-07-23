# Data Model: 001-eks-log-monitor

**Date**: 2026-07-22  
**Spec**: [spec.md](./spec.md)

## Entities

### ConnectionInstance (Ambiente)

Named environment access profile.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID / text PK | Stable id |
| name | string | Display name (unique preferred) |
| bastion_host | string | Required — SSH host |
| ssh_port | int | Required — default 22 |
| ssh_user | string | Required |
| pem_path | string | Local filesystem path to `.pem` — never file contents |
| iam_credentials_path | string | Local path to IAM credentials file (`aws_access_key_id` / `aws_secret_access_key`); read at connect time — never persist key values |
| region_name | string | AWS region (e.g. `us-east-1`) |
| cluster_name | string | EKS cluster name |
| namespace_default | string? | Optional default filter |
| created_at / updated_at | datetime | Local |

**Validation**: Required `name`, `bastion_host`, `ssh_port`, `ssh_user`, `pem_path`, `iam_credentials_path`, `region_name`, `cluster_name`. Reject empty paths. Do not read PEM or IAM secret values into DB — only paths and identifiers.

**Connect flow**: SSH tunnel (PEM) + read IAM file → temporary EKS token (+ `DescribeCluster` for endpoint/CA as needed) → kube via localhost.

**Relationships**: Many instances exist; at most one is **active** for a session.

**Form (nuevo ambiente)**: PEM + datos SSH + ruta IAM + `region_name` + `cluster_name` (+ nombre, namespace opcional) — see wireframe `02-new-environment-modal.svg`.

---

### UiPreferences

| Field | Type | Notes |
|-------|------|-------|
| theme | enum `light` \| `dark` | Ver → Modo claro / oscuro |
| last_active_instance_id | UUID? | Restored on launch if still present |

---

### SessionState (runtime, not necessarily persisted)

| Field | Type | Notes |
|-------|------|-------|
| active_instance_id | UUID? | Drives tunnel + kube |
| connection_status | enum | disconnected / connecting / connected / error |
| loaded_instance_ids | UUID[] | Environments present in sidebar (multi-load) |
| component_type | enum | `pods` \| `configmaps` |
| namespace_filter | string? | |

---

### DeploymentArtifact

| Field | Type | Notes |
|-------|------|-------|
| name | string | Workload/Deployment name |
| namespace | string | |
| replica_count | int | Informational |
| ready | bool | |

**Relationships**: Owns zero or one open **LogWindow** per artifact (user may open one window per artifact).

---

### ConfigMapArtifact

| Field | Type | Notes |
|-------|------|-------|
| name | string | |
| namespace | string | |
| keys | string[] | Read-only view |

---

### LogWindow

| Field | Type | Notes |
|-------|------|-------|
| artifact_key | string | namespace/name |
| view_mode | enum | `structured` (default) \| `raw` |
| follow | bool | Live follow on |
| search_query | string? | Buffer search |
| buffer | ring of entries | In-memory only; not persisted full dump |

---

### LogWriteGroup (Structured view unit)

| Field | Type | Notes |
|-------|------|-------|
| id | runtime id | |
| pod_name | string | Replica attribution |
| timestamp | datetime? | If present in stream |
| severity | enum/string | From lightweight detection |
| detail | string | Full write payload |
| is_likely_error | bool | Clickable when true |
| raw_bytes_ref | offset | Maps to same stream for Raw |

**Rule**: One **write** to the log stream → one group (stacktrace typically one write).

---

### AnalysisFinding

| Field | Type | Notes |
|-------|------|-------|
| severity | string | |
| explanation | string | Plain language |
| recommendation | string | |
| rule_id | string | Local Spring Boot pack |
| source_write_group_id | runtime id | |

**Persistence**: Optional light history metadata only; not full log bodies (constitution IV).

---

## State transitions

### Connection

```text
disconnected → connecting → connected
                 ↓
               error → disconnected (retry / switch instance)
```

Switching **active** instance: `connected` → invalidate/close LogWindows → `connecting` (new) or `disconnected`.

### Log view mode

```text
open window → structured (default)
structured ↔ raw   (same follow session)
```

### Analysis

```text
structured + likely_error click → running_rules → finding | empty
```

No buffer-wide analyze transition in MVP.
