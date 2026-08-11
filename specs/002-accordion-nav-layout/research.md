# Research: 002-accordion-nav-layout

**Date**: 2026-07-27  
**Spec**: [spec.md](./spec.md)

## R1 — Accordion + click-to-open (no buscador / no Abrir logs)

**Decision**: Left accordion with sections Pods / ConfigMaps; items are buttons/links; remove `CatalogFilter` and any “Abrir logs” CTA.

**Rationale**: Matches clarified UX; maximizes main work area (≥70% width target).

**Alternatives considered**: Keep filter in header — rejected by clarify; separate Open button — rejected by spec.

---

## R2 — Tab model (dedupe, all active)

**Decision**: Unified main tab strip for workload logs and ConfigMap viewers. Key = `kind:namespace/name` (e.g. `deployment:default/payments-api`). Re-click focuses existing tab; no duplicates. Closing a tab stops that follow only.

**Rationale**: User: “cada menú abre una pestaña, todas activas, no se repiten.”

**Alternatives considered**: Replace single pane — rejected; confirm dialog on switch — rejected.

---

## R3 — Multi-replica combined logs + background follow

**Decision**: `logs_open` for a Deployment fans in log lines from all Running (or Ready) replica pods into one `window_id`, tagging each `logs_chunk` with `pod_name`. Inactive tabs keep their cancel flags **false** until tab close (background follow).

**Rationale**: Spec FR-004/015/017; demo hydrate already has multi-pod deployments.

**Alternatives considered**: Per-pod tabs only — superseded in clarify; pause follow when unfocused — rejected (opción A).

---

## R4 — Workload summary strip (replicas, RAM, CPU, uptime)

**Decision**: New read-only command `workload_summary(namespace, deployment)` returns:

| Field | Preferred source | Fallback |
|-------|------------------|----------|
| `replicaCount` / ready | Deployment status | cached_deployment |
| `ramConsumed` | metrics.k8s.io pod usage sum | requests/limits sum → else `null` → UI **N/D** |
| `cpuConsumed` | metrics.k8s.io pod usage sum | requests/limits sum → else `null` → UI **N/D** |
| `uptime` | oldest pod `startTime` age | Deployment `creationTimestamp` → else N/D |

Demo/offline: seed plausible summary from hydrate without inventing “live” precision; still labeled honestly (demo values OK in fixtures).

**Rationale**: Spec FR-016 / SC-010; constitution read-only; metrics-server often absent → N/D required.

**Alternatives considered**: Require metrics-server — rejected (blocks demos); hide strip when missing — rejected (spec wants strip always visible with N/D).

---

## R5 — Layout chrome

**Decision**: Grid `minmax(220px, 280px) 1fr` — accordion | main. Remove right ConfigMaps column. Top bar Ambiente / Ver / ConnectionStatus unchanged.

**Rationale**: FR-007 space maximization.

**Alternatives considered**: Three columns — rejected.

---

## Resolved unknowns

All Technical Context items for this feature are resolved against existing Faro stack (Tauri/React/SQLite). No remaining NEEDS CLARIFICATION blockers for `/speckit-tasks`.
