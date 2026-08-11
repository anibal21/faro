# Contract: Workload summary

## Display fields

| Label | Source | Format |
|-------|--------|--------|
| Replicas | Deployment status ready/desired (or equivalent) | e.g. `2/3` or product-equivalent |
| RAM | One-pod template sum of container memory request/limit | `request / limit` or `N/D` sides |
| CPU | One-pod template sum of container CPU request/limit | `request / limit` or `N/D` sides |
| Uptime | Best-effort from start/ready time | human duration or `N/D` |

## Normative rules

- RAM/CPU are **provisioned**, not live usage.  
- Values are for **one pod** (pod template), **not** multiplied by replica count.  
- Multi-container: **sum** requests and **sum** limits across containers of that template.  
- Missing field → `N/D` for that field only.  

## Demo

Demo may supply synthetic provisioned-looking values; must not leave all-N/D when fixtures define resources.

## Command

`workload_summary` (existing) MUST return populated fields for live Deployments when the API exposes status + pod template resources.
