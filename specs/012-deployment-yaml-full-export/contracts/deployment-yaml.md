# Contract: Deployment YAML

## Command: `k8s_get_deployment_yaml`

**Args**: `{ namespace: string, name: string }`  
**Returns**: `{ namespace: string, name: string, yamlText: string }` (camelCase on wire)

### Behavior

| Mode | Behavior |
|------|----------|
| Live | Read-only get Deployment; serialize to YAML string; no secrets beyond what the resource contains (no PEM/IAM injection) |
| Demo | Return fixture YAML for known demo Deployments |
| Missing | Error message without secret material |

### UI

- Tab kind distinct from log tabs (e.g. `deployment-yaml`).
- Read-only viewer; optional Export of YAML text file is nice-to-have, not required by 012 Must (log export is Must).
- Opening from **Deployments** section MUST NOT call `logs_open`.

### Permissions

Register command in Faro capabilities/permissions like other `k8s_get_*` commands.
