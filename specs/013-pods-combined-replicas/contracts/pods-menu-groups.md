# Contract: Pods menu groups

## Input

`pods: FlatPodRow[]` from catalog IPC.

## Output (render model)

1. **Combined rows** — one per `(namespace, deploymentName)` where owner is set and not `__unassigned__`.
   - Label: `{deploymentName} ({replicaCount})` (Spanish UI OK: same pattern).
   - Click: open combined logs for that Deployment (see [combined-logs-open.md](./combined-logs-open.md)).
2. **Orphan rows** — pods without owner.
   - Label: `podName`.
   - Click: single-pod follow.

## Forbidden

- Peer top-level buttons for each owned replica of a Deployment.
- Nested expand required to open combined logs.

## Empty

- No pods → “Sin pods”.
- Only orphans → only orphan rows.
