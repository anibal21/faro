# Research: 012-deployment-yaml-full-export

## 1. Deployment open → YAML only

**Decision**: New workspace tab kind `deployment-yaml` opened from **Deployments** catalog. Backend `k8s_get_deployment_yaml(namespace, name)` returns a UTF-8 YAML string (live: kube get Deployment + serialize; demo: fixture YAML). UI is read-only monospaced viewer (reuse ConfigMap/Service chrome patterns). **Do not** call `logs_open` from `openDeployment`.

**Rationale**: Spec locks Deployments to configuration-only; previous fan-in on Deployment conflicts with FR-001.

**Alternatives considered**:
- YAML + Logs tabs on Deployment — rejected in clarify (user said Deployments = YAML only).
- Client-side reconstruct YAML from list row fields — incomplete; need full resource get.

## 2. Pods open → fan-in all owner replicas

**Decision**: `openPod(ns, pod, deploymentName)` when `deploymentName` is present: call `logsOpen(ns, deployment)` **without** `podName` filter (full Deployment fan-in, same as former `openDeployment` logs). Tab `navKey` SHOULD be `deploy-logs:${ns}/${deployment}` (or reuse existing deployment-log key) so opening another replica of the same Deployment focuses the same tab. Orphan pods (`deploymentName` null/empty/`__unassigned__`): `logsOpen(ns, podName, podName)` single-pod follow; `navKey` `pod:${ns}/${pod}`.

**Rationale**: Clarify: Pods menu restores “logs as before”; before = multi-replica follow with per-pod labels.

**Alternatives considered**:
- Single-pod only from Pods — rejected (user wants all replicas).
- Fan-in on Deployment with YAML elsewhere — rejected (Deployments YAML-only).

## 3. Summary RAM/CPU from Deployment config

**Decision**: Keep existing `workload_summary` provisioned `request / limit` from Deployment pod template (011). Fan-in tabs call `workloadSummary(ns, ownerDeployment)`. No metrics-server.

**Rationale**: Spec US3; already implemented; verify wiring when open path moves to Pods.

**Alternatives considered**: Live usage — out of scope.

## 4. Export exhaust then write

**Decision**: On Export for a log tab: run an **exhaust gather** loop (reuse `logs_load_older` / same depth semantics as US load-older) until all pods in scope report exhausted or no older lines; merge into chronological Raw text; then `saveTextFile`. Show progress (“Reuniendo historial…”); Abort cancels gather and writes nothing. Do not persist gather to SQLite. Cap behavior: no hard product MB cap in v1; rely on abort + kube retention limits (document in quickstart).

**Rationale**: Clarify Option A — full available cluster history, not on-screen buffer only.

**Alternatives considered**:
- Export session buffer only — rejected by user.
- Background dump to SQLite then copy — violates constitution IV/full-dump rule.

## 5. Remove “iniciando”

**Decision**: Stop setting initial tab `status: "iniciando"`; do not display idle/starting placeholders in LogWindow toolbar. Keep actionable errors and useful Spanish follow states (`siguiendo`, failure messages). Optional: omit status span until first real `logs_status` event.

**Rationale**: Spec US5 — non-actionable chrome.

**Alternatives considered**: Localize “iniciando” only — still useless noise.

## 6. YAML serialization library

**Decision**: Prefer serialize kube/JSON object to YAML in Rust (`serde_yaml` or equivalent already available / add if needed). Strip managed fields that confuse operators only if product already normalizes elsewhere; default = faithful read-only document of the Deployment object (may include status). Spec allows normalized YAML; include `spec` + identifying metadata at minimum.

**Rationale**: One get → one string; FE stays dumb viewer.

**Alternatives considered**: FE JSON.stringify only — worse UX than YAML request.
