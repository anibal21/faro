# IPC Contract: Multi-session + tree (003)

All commands remain Tauri IPC (no HTTP). CamelCase in JSON payloads as today.

## Connection (breaking vs single-session)

### `env_connect`

**Input**: `{ instanceId: string }`  
**Behavior**: Start/ensure session for `instanceId`. **MUST NOT** disconnect other sessions.  
**Output**: `{ status, clusterName, catalogEpoch, instanceId }` (extend as needed)  
**Events** (optional): `env_connection_changed` `{ instanceId, status }` with `connecting|connected|error|disconnected`

### `env_disconnect`

**Input**: `{ instanceId: string }` (required — no longer “disconnect the only one”)  
**Behavior**: Tear down **only** that session; cancel its log windows; clear its catalog session data.  
**Output**: `null` / ok

### `env_connection_states` (new, recommended)

**Input**: `{}`  
**Output**: `Array<{ instanceId: string, status: "disconnected"|"connecting"|"connected"|"error" }>`

## Catalog / logs (scoped)

### `k8s_list_deployments` / `k8s_list_configmaps` / `k8s_get_configmap` / `catalog_refresh` / `workload_summary` / `logs_open`

**Input**: MUST include `instanceId: string` in addition to existing fields.  
**Behavior**: Operate against that session only; error if that instance is not connected.

### `logs_close` / `logs_set_view`

Unchanged keys (`windowId`); window remains bound to an `instanceId` server-side.

## Environments list

### `env_list`

Unchanged — returns **all** saved instances for tree roots.

### Workspace load APIs

`env_load` / loaded-ids MAY remain for compatibility but **MUST NOT** gate tree visibility. Prefer selected id via lightweight `env_set_selected` or reuse `env_set_active` semantics for **selection only** (not exclusive connect).

## Permissions

Add allow entries for any new command (`env_connection_states`) in `permissions/faro.toml` + `capabilities/default.json`.

## Errors

- Connect failure: status `error`/`disconnected` for that id only; message surfaced in UI.
- Catalog/logs without connected session for that id: clear error string.
