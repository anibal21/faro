# Implementation Plan: Pods Combined Replicas

**Branch**: `013-pods-combined-replicas` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-pods-combined-replicas/spec.md` (clarify session 2026-07-30)

**Note**: Optional pre-hook `/speckit-wireframe-review` available; not required to plan.

## Summary

Change the **Pods** catalog from a flat list of individual pods to **one grouped row per Deployment** (label includes replica count). Opening a group opens/focuses the existing **fan-in** log tab (active combined logs of all replicas). Orphans stay single-pod rows. **Export** from that tab already exhaust-gathers and must include **all replicas** in scope (assert/fix if any single-pod path leaks into group open). Builds on 012 fan-in + exhaust export; primary new work is **EnvTreeNav grouping** + open wiring.

## Technical Context

**Language/Version**: TypeScript/React · existing Tauri IPC (`logs_open` without pod filter, `gatherForExport`)

**Primary Dependencies**: `EnvTreeNav`, `useCatalog` / `FlatPodRow`, `useWorkspaceTabs.openPod` (fan-in path), `LogWindow` export exhaust from 012

**Storage**: No new SQLite tables; session cache pods already carry `deploymentName`

**Testing**: Vitest — group pods by owner helper; EnvTreeNav renders one row per Deployment for multi-pod fixtures; open calls fan-in (no pod filter); export body contains ≥2 pod names when mocked chunks from two replicas. Manual quickstart on demo.

**Target Platform**: Desktop Faro (Windows-first)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Grouping is O(n) client-side on catalog list; open reuses 012 fan-in latency targets

**Constraints**: Read-only; no nested per-replica menu children; Deployments remain YAML-only; constitution VI on export

**Scale/Scope**: Pods section UX + verify open/export; small FE helper module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/013-pods-combined-replicas/spec.md` + this plan
- [x] Secrets: no change to credential handling; export remains local
- [x] No exfiltration (VI): local file only
- [x] Network: user bastion/EKS only
- [x] Read-only K8s: reuse existing list/logs
- [x] No full log dumps to SQLite
- [x] Tests planned for Must-Have stories
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU21)

**Post-design re-check (Phase 1):** PASS — UI/IPC only; no new secret surfaces.

## Project Structure

### Documentation (this feature)

```text
specs/013-pods-combined-replicas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── pods-menu-groups.md
│   ├── combined-logs-open.md
│   └── combined-export.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/podGroups.ts              # NEW — group FlatPodRow[] → CombinedReplicaGroup[]
├── components/catalog/EnvTreeNav.tsx  # render grouped Pods rows
├── hooks/useWorkspaceTabs.ts     # openCombinedWorkload / ensure openPod fan-in from group
├── views/LogWindow.tsx           # tab label for combined fan-in; export already multi-pod
└── views/MainShell.tsx           # wire onOpenPodGroup if signature changes

tests/unit/
├── pod_groups.spec.ts
├── pods_menu_combined.spec.tsx
└── combined_export_scope.spec.ts
```

**Structure Decision**: Pure FE grouping over existing catalog rows; no new Rust commands required unless `deploymentName` missing in live data (then fix catalog hydrate — research).

## Complexity Tracking

> No constitution violations.
