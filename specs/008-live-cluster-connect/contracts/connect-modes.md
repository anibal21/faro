# Contract: Connect modes (008)

## Builtin demo

| Rule | Value |
|------|--------|
| id | `faro-demo` |
| display name | `demo` |
| list position | Always first |
| edit / delete | **Forbidden** (IPC error) |
| start state | **Disconnected** after every app launch |
| actions (this feature) | Connect, Disconnect only |
| on connect | Demo catalog + demo logs/metrics path |

## Live environments

| Rule | Value |
|------|--------|
| id | Any non-`faro-demo` saved instance |
| namespace | Required non-empty at upsert |
| on connect | Real tunnel + EKS auth + live hydrate/logs |
| on failure | Error string without secrets; **no** demo catalog seed |
| refresh | Live re-list in configured namespace only |

## IPC (stable names, extended behavior)

| Command | Demo | Live |
|---------|------|------|
| `env_list` | Includes `faro-demo` first | Includes operator envs |
| `env_upsert` | Reject if id is builtin | Require namespace |
| `env_delete` | Reject builtin | Allowed |
| `env_connect` | Demo hydrate | Live pipeline |
| `env_disconnect` | Clear demo session only | Tear tunnel/client + purge that id |
| `catalog_refresh` | Re-seed demo | Re-list live |
| `k8s_list_*` / `k8s_get_configmap` / `logs_*` | Demo data | Live client for that `instance_id` |

## UI

- Tree: **demo** first; context menu for demo = Connect/Disconnect only.
- Modal Nuevo/Editar: namespace required (live).
- Status: connected demo vs live visually distinct (label/badge).
