# Contract: Pod fan-in logs

## Catalog → open

| Catalog section | Open result |
|-----------------|-------------|
| Deployments | YAML only ([deployment-yaml.md](./deployment-yaml.md)) — **no** logs |
| Pods (has `deploymentName`) | Fan-in follow for **all** replicas of that Deployment (`logs_open` without single-pod filter) |
| Pods (orphan) | Single-pod `logs_open` with pod filter |

## Tab identity

- Fan-in: reuse one tab per `(namespace, deployment)` so opening pod A then pod B of same Deployment focuses the same log window.
- Orphan: one tab per `(namespace, podName)`.

## Summary strip

- Fan-in tabs: `workload_summary(namespace, deployment)` — provisioned RAM/CPU from template; replicas from Deployment status/spec.
- Orphans: best-effort summary or N/D if no Deployment.

## Status

- Do not seed `"iniciando"`. See [status-chrome.md](./status-chrome.md).

## Regression

- Prior behavior of opening Deployment for fan-in logs moves to Pods path only.
