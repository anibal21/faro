# Research: 013-pods-combined-replicas

## 1. Menu presentation

**Decision**: Client-side group `FlatPodRow[]` by `(namespace, deploymentName)` excluding `__unassigned__` / empty → one `CombinedReplicaGroup` per owner with `memberPods` and `count`. Render Pods section as: combined rows (`{deployment} ({count})`) + orphan rows (`podName`). No nested expanders (clarify).

**Rationale**: Matches locked clarify; avoids dual open paths.

**Alternatives considered**: Expandable children (rejected); visual indent of all pods under headers without single open target (weaker).

## 2. Open behavior

**Decision**: Combined row click → `openPod(namespace, firstMemberPodName, deploymentName)` or dedicated `openCombinedLogs(namespace, deployment)` that calls `logsOpen(ns, deployment)` without pod filter and `deployLogsNavKey` (same as 012 fan-in). Prefer explicit `openCombinedLogs` for clarity.

**Rationale**: Reuse 012 fan-in; group row is the only open target for owned replicas.

**Alternatives considered**: Opening random member with pod filter — wrong (single pod).

## 3. Export

**Decision**: No new export algorithm; verify fan-in tab chunks always include all replica `podName`s and `gatherForExport` / `buildRawLogExport` write the full buffer. Add unit assert that export body contains each member pod name when chunks are multi-pod. Fix only if a regression routes group open to single-pod.

**Rationale**: Spec FR-005 + 012 exhaust already defined.

**Alternatives considered**: Server-side merge export — unnecessary.

## 4. Missing deploymentName on live pods

**Decision**: If live hydrate leaves `deploymentName` null for RS-owned pods, fix owner resolution in `catalog.rs` (already has RS→Deployment matching in logs). Confirm `list_all_pods` returns owner for demo (payments-api has 2 pods).

**Rationale**: Without owner, grouping collapses to orphans and SC-001 fails.

**Alternatives considered**: Group by name prefix only — brittle.
