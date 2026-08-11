# Contracts: IPC deltas — accordion layout

**Feature**: 002-accordion-nav-layout  
**Base**: [../../001-eks-log-monitor/contracts/ipc-commands-events.md](../../001-eks-log-monitor/contracts/ipc-commands-events.md)

## Commands (add / change)

| Command | In | Out | Notes |
|---------|----|-----|-------|
| `logs_open` | `namespace`, `deployment` | `{ windowId }` | **Change**: follow **all replica pods** of the Deployment; chunks include `podName` |
| `logs_close` | `windowId` | — | Unchanged; stops fan-in for that tab only |
| `workload_summary` | `namespace`, `deployment` | `WorkloadSummary` | **New**; see data-model; null fields → UI N/D |
| `k8s_list_deployments` | optional filter | deployments+pods | Unchanged; UI no longer exposes filter control |
| `k8s_list_configmaps` / `k8s_get_configmap` | … | … | Unchanged |

## Events (unchanged names)

| Event | Payload notes |
|-------|----------------|
| `logs_chunk` | Must identify `podName` so Structured/Raw can show multi-replica combined stream |
| `logs_status` | Per `windowId`; background tabs stay `following` until close |

## Forbidden

- Commands that mutate cluster state
- Persisting log bodies or secret material
- Telemetry of summary/metrics off-machine

## Frontend mapping

| UI action | IPC |
|-----------|-----|
| Click Pods item | `logs_open` + `workload_summary` (parallel) |
| Click ConfigMap | `k8s_get_configmap` (or use cached detail) |
| Close tab | `logs_close` if log tab |
| Re-click open item | no IPC — focus existing tab |
