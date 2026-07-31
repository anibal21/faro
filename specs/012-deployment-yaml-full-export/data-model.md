# Data Model: 012-deployment-yaml-full-export

## Entities

### DeploymentYamlDocument

| Field | Notes |
|-------|--------|
| namespace | string |
| name | string |
| yamlText | UTF-8 YAML of Deployment resource (read-only) |
| fetchedAt | optional display timestamp |

**Validation**: Non-empty namespace/name; yamlText may be empty only on error paths (then show error, no fake YAML).

**Lifecycle**: Created on open from Deployments catalog; discarded on tab close; never written to SQLite as full dump.

### FanInLogTab (extends existing deployment log tab)

| Field | Notes |
|-------|--------|
| kind | `"deployment"` (log) — not YAML |
| namespace | string |
| deployment | owner Deployment name (fan-in key) |
| podName | omitted / unused for fan-in owner tabs |
| navKey | stable per `namespace/deployment` for reuse |
| chunks | LogsChunk[] with podName per line |
| summary | WorkloadSummary from owner Deployment template |
| status | real follow/error only — no `"iniciando"` |
| loadOlder* / historyDepthByPod / exhaustedPods | existing 010/011 fields; used by export exhaust |

### OrphanPodLogTab

Same as log tab but follow scoped to one pod; `deployment` may equal pod name for IPC compatibility; `navKey` per pod.

### ExhaustExportJob (ephemeral UI/session)

| Field | Notes |
|-------|--------|
| tabId | target log tab |
| phase | `gathering` \| `saving` \| `done` \| `cancelled` \| `failed` |
| message | progress / error (no secrets) |

**Lifecycle**: Starts on Export click; ends on write, cancel, or failure; no durable store.

## Relationships

- Catalog **Deployment** row → opens **DeploymentYamlDocument** tab (1:1 open).
- Catalog **Pod** row with `deploymentName` → opens / focuses **FanInLogTab** for that owner.
- Catalog **Pod** without owner → **OrphanPodLogTab**.
- **FanInLogTab.summary** ← Deployment template resources (same as WorkloadSummary entity from 011).

## State transitions (log tab status chrome)

```text
(no status) --logs_status--> siguiendo | error | inactivo | …
```

Forbidden: showing `iniciando` / `starting` as default chrome.
