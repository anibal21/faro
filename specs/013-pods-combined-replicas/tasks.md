# Tasks: Pods Combined Replicas

**Input**: Design documents from `/specs/013-pods-combined-replicas/`  
**Branch / feature**: `013-pods-combined-replicas`  
**Decisions baked in**: Pods menu = one grouped row per Deployment (`name (count)`); no nested per-replica peers; open = fan-in active combined logs; orphans single-pod; export = all replicas in fan-in scope (012 exhaust).

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (`podGroups` helper) → US1 (menu) → US2 (open fan-in) → US3 (export assert) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [x] T001 Confirm agent context points at `specs/013-pods-combined-replicas/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Inventory `EnvTreeNav` Pods section, `FlatPodRow.deploymentName`, and `useWorkspaceTabs.openPod` fan-in path against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure grouping helper used by US1–US3

**⚠️ CRITICAL**: Menu and tests depend on this helper

- [x] T003 Create `groupPodsByDeployment(pods)` returning combined groups + orphans in `src/lib/podGroups.ts` per [data-model.md](./data-model.md) and [contracts/pods-menu-groups.md](./contracts/pods-menu-groups.md)
- [x] T004 [P] Unit-test grouping (multi-replica → one group; orphans separate; `__unassigned__` treated as orphan) in `tests/unit/pod_groups.spec.ts`

**Checkpoint**: Helper green in Vitest

---

## Phase 3: User Story 1 — Pods menu combined groups (P1) 🎯 MVP

**Goal**: Pods section shows one row per Deployment with replica count; no peer rows per owned replica.

**Independent Test**: Demo connect → Pods shows `payments-api (2)` (not two pod-name peers).

### Tests

- [x] T005 [P] [US1] Vitest/render or source assert: EnvTreeNav Pods section uses grouped rows in `tests/unit/pods_menu_combined.spec.tsx`

### Implementation

- [x] T006 [US1] Render combined + orphan rows in `src/components/catalog/EnvTreeNav.tsx` using `groupPodsByDeployment` (label `{deployment} ({count})`)
- [x] T007 [P] [US1] Verify demo/live `deploymentName` on pods via `src-tauri/src/db/session_cache.rs` / `src-tauri/src/k8s/catalog.rs`; fix owner mapping if groups collapse to orphans

**Checkpoint**: SC-001 demoable

---

## Phase 4: User Story 2 — Open grouped row → combined active logs (P1)

**Goal**: Clicking a combined Pods row opens/focuses fan-in logs for all replicas; tab labeled by Deployment.

**Independent Test**: Click `payments-api (2)` → lines from both replica pod names; second click focuses same tab.

### Tests

- [x] T008 [P] [US2] Assert combined open calls fan-in without pod filter / uses `deployLogsNavKey` in `tests/unit/combined_logs_open.spec.ts` (source or mock)

### Implementation

- [x] T009 [US2] Wire combined-row click to `openCombinedLogs` or fan-in `openPod(ns, samplePod, deployment)` in `src/hooks/useWorkspaceTabs.ts` per [contracts/combined-logs-open.md](./contracts/combined-logs-open.md)
- [x] T010 [US2] Connect EnvTreeNav combined click → workspace open in `src/views/MainShell.tsx` / `src/components/catalog/EnvTreeNav.tsx`
- [x] T011 [P] [US2] Set fan-in tab label to Deployment name (not single replica) in `src/views/LogWindow.tsx`

**Checkpoint**: SC-002 / SC-005

---

## Phase 5: User Story 3 — Export all combined replicas (P1)

**Goal**: Export from combined fan-in tab includes all replica pod names in Raw file.

**Independent Test**: Export combined tab → file contains both replica identifiers.

### Tests

- [x] T012 [P] [US3] Assert `buildRawLogExport` includes multiple pod names for multi-pod chunks in `tests/unit/combined_export_scope.spec.ts` per [contracts/combined-export.md](./contracts/combined-export.md)

### Implementation

- [x] T013 [US3] Confirm `gatherForExport` / Export path in `src/views/LogWindow.tsx` and `src/hooks/useWorkspaceTabs.ts` uses full fan-in chunks (no single-pod filter); fix if group open still scoped to one pod
- [x] T014 [P] [US3] Smoke: cancel export still writes nothing (reuse existing `fileExport` cancel coverage in `tests/unit/fileExport.test.ts` or note in combined_export_scope)

**Checkpoint**: SC-003 / SC-004

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 [P] Sync HU21 notes in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [x] T016 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [x] T017 Manual pass of [quickstart.md](./quickstart.md) (demo + live when available)
- [x] T018 Security spot-check: export/errors still omit PEM/IAM secrets

**Note T017**: Automated coverage + demo path via existing demo env; live cluster optional when credentials available.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (`podGroups`)
- **US1** after Foundational (MVP)
- **US2** after US1 (menu must exist to click)
- **US3** after US2 (needs combined fan-in tab)
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Menu grouping MVP |
| US2 | Depends on US1 rows + 012 fan-in |
| US3 | Depends on US2 open path |

### Parallel Opportunities

- T001 ∥ T002  
- T004 after T003; T005 ∥ T007 after helper  
- T008 ∥ T011  
- T012 ∥ T014  
- T015 ∥ T016  

---

## Parallel Example: US1

```text
Task: "pod_groups.spec.ts + EnvTreeNav grouped rows"
Task: "verify deploymentName on demo/live catalog pods"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + `podGroups` + EnvTreeNav combined rows  
2. **STOP and VALIDATE** SC-001 on demo  
3. Then US2 open → US3 export assert  

### Suggested MVP scope

**US1 only** (grouped Pods menu); then US2 open; then US3 export verification.

---

## Notes

- [P] = different files, no incomplete dependency  
- Reuse 012 fan-in + exhaust export; do not reintroduce Deployment log-open  
- Commit when user asks  
