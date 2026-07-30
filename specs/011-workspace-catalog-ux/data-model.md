# Data Model: Workspace catalog & UI polish

No durable log dumps. Session catalog cache may store additional resource rows (paths/ids/metadata only).

## Ephemeral / session entities

### WorkloadSummary (extended semantics)

| Field | Meaning for this feature |
|-------|--------------------------|
| `replicaCount` / `readyReplicas` | From Deployment status (or pod phase counts for pod tab) |
| `ramConsumed` / `cpuConsumed` | **Misnamed historically** — display **provisioned** `request / limit` for **one pod** (sum containers). Prefer keeping wire names for compat or add `ramProvisioned`/`cpuProvisioned` aliases in IPC; UI shows provisioned text. |
| `uptime` | Human duration from pod/Deployment start when known |
| null / absent | Render as `N/D` per field |

**Rules**: Never × replicas; never live usage samples.

### CatalogSection

| Attribute | Rules |
|-----------|--------|
| Order | Deployments → Pods → Services → ConfigMaps |
| Children | Indented past section title |
| Empty | Empty state per section; independent errors |

### Catalog items

| Kind | Open behavior |
|------|----------------|
| Deployment | Existing fan-in log workspace |
| Pod | Log tab scoped to that pod |
| Service | Read-only Service detail tab |
| ConfigMap | Existing ConfigMap tab |

### ServiceDetail

| Attribute | Notes |
|-----------|--------|
| namespace, name, type | Required when listed |
| clusterIP, ports, selector | Best-effort; N/D or omit if missing |
| Read-only | No mutate |

### ExportJob (ephemeral)

| Attribute | Rules |
|-----------|--------|
| Source | Log Raw buffer **or** ConfigMap readable entries |
| Target | Operator-chosen local path via save dialog |
| Cancel | No file written |
| Secrets | Never include PEM/IAM/tokens |

## State transitions

```text
summary: open tab → fetch summary → show values|N/D per field
export: idle → save dialog → (cancel→idle) | (path→write→idle|error)
catalog: connect → hydrate Deployments/Pods/Services/ConfigMaps → expand/open
follow status: starting → siguiendo [(N pods)] → idle | error (Spanish)
```

## Relationships

- Deployment → many Pods (catalog); summary uses Deployment template = one pod worth
- Service detail independent of log follow
- Export reads tab memory only
