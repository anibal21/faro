# Data Model: 013-pods-combined-replicas

## Entities

### CombinedReplicaGroup (UI / derived)

| Field | Notes |
|-------|--------|
| namespace | string |
| deploymentName | owner Deployment name |
| replicaCount | number of member pods |
| memberPodNames | string[] |
| samplePodName | string — any member for optional IPC |

**Validation**: `deploymentName` non-empty and not `__unassigned__`; `replicaCount === memberPodNames.length` ≥ 1 (or allow 0 only if product shows empty groups — prefer omit empty).

**Lifecycle**: Derived on each catalog render/refresh from `FlatPodRow[]`; not persisted.

### OrphanPodEntry (UI)

| Field | Notes |
|-------|--------|
| namespace | string |
| podName | string |

Pods with null/empty/`__unassigned__` owner.

### FanInLogTab / Export

Unchanged from 012: tab scoped by `(namespace, deployment)`; export Raw of all chunks in tab after exhaust gather.

## Relationships

```text
FlatPodRow[] --groupBy owner--> CombinedReplicaGroup[] + OrphanPodEntry[]
CombinedReplicaGroup --open--> FanInLogTab (deploy-logs navKey)
FanInLogTab --export--> Combined export artifact (all member podNames in file)
```
