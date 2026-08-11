# Contract: Catalog navigation UI

## Section order (normative)

1. Deployments  
2. Pods  
3. Services  
4. ConfigMaps  

## Indentation

Child item labels MUST start further right than the section title (consistent padding across sections).

## Open behaviors

| Section item | Opens |
|--------------|--------|
| Deployment | Deployment log workspace (fan-in follow) |
| Pod | Log tab scoped to that pod |
| Service | Read-only Service detail tab |
| ConfigMap | ConfigMap tab (existing) |

## Empty / error

- Empty section: clear empty copy  
- List failure: actionable error in that section only; other sections keep working  
- Live: no silent demo injection  

## IPC (conceptual)

- List Deployments (existing)  
- List Pods (flat for namespace / connected scope) — new or derived from cache  
- List Services — new  
- Get Service detail — new  
- ConfigMaps — existing  

All read-only.
