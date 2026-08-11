# Tasks: Accordion navigation layout

**Input**: Design documents from `/specs/002-accordion-nav-layout/`  
**Branch / feature**: `002-accordion-nav-layout`  
**Decisions baked in**: Left accordion Pods/ConfigMaps; no buscador; no “Abrir logs”; click opens tabs; multi-replica combined logs; background follow; summary strip (replicas/RAM/CPU/uptime or N/D); builds on Faro 001.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit and/or integration per Must-Have story; ≥1 E2E for primary accordion → click → combined logs + summary.

**Organization**: Phases by user story (US1–US4). Paths assume Tauri app at repo root (`src/`, `src-tauri/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete deps)
- **[Story]**: US1…US4 for story phases only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align feature branch docs and permissions for new IPC

- [x] T001 Confirm feature context points at `specs/002-accordion-nav-layout/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Add `workload_summary` permission in `src-tauri/permissions/faro.toml` and `src-tauri/capabilities/default.json`
- [x] T003 [P] Extend frontend IPC types/helpers for `workloadSummary` in `src/lib/ipc.ts`

**Checkpoint**: Permissions + IPC stubs ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared tab identity + layout shell hooks before story UI

**⚠️ CRITICAL**: No user story chrome until this phase is done

- [x] T004 Define tab navKey helpers (`deployment:ns/name`, `configmap:ns/name`) in `src/hooks/useWorkspaceTabs.ts`
- [x] T005 Register `workload_summary` command stub in `src-tauri/src/commands/mod.rs` + `src-tauri/src/lib.rs` (returns N/D-friendly empty until US2)
- [x] T006 [P] Add CSS grid shell tokens for accordion | main in `src/styles/workspace.css` (no right rail)

**Checkpoint**: Foundation ready — story phases may begin

---

## Phase 3: User Story 1 — Navigate with left accordion (P1) 🎯 MVP

**Goal**: Connected workspace shows left accordion Pods/ConfigMaps (expand/collapse), no buscador, wide main area; remove three-column rails.

**Independent Test**: Connect demo → accordion lists workloads/ConfigMaps; no CatalogFilter; main area dominates width.

### Tests

- [x] T007 [P] [US1] Vitest: AccordionNav expand/collapse + no filter control in `tests/unit/accordion_nav.spec.tsx`
- [x] T008 [P] [US1] Integration outline: connected layout without buscador in `tests/integration/accordion_layout.spec.ts`

### Implementation

- [x] T009 [US1] Create `src/components/catalog/AccordionNav.tsx` (sections Pods / ConfigMaps, clickable rows, empty/connect hint)
- [x] T010 [P] [US1] Wire AccordionNav to catalog list APIs in `src/hooks/useCatalog.ts` (filter UI removed; keep list IPC)
- [x] T011 [US1] Refactor `src/views/MainShell.tsx` to accordion | main grid; remove `DeploymentsRail` / right `ConfigMapsPanel` / `CatalogFilter` from chrome
- [x] T012 [P] [US1] Delete or deprecate unused `src/components/catalog/CatalogFilter.tsx` usage; ensure no “Abrir logs” CTA remains in `src/components/catalog/`
- [x] T013 [US1] Preserve Ambiente/Ver/ConnectionStatus top chrome per FR-009 in `src/views/MainShell.tsx`

**Checkpoint**: US1 demoable — accordion navigation only

---

## Phase 4: User Story 2 — Open replica logs by click (P1)

**Goal**: Click workload → tab with combined multi-replica logs; background follow; summary strip; dedupe tabs; no Abrir logs.

**Independent Test**: Click payments-api → one tab, multiple podNames in stream, summary fields or N/D; open second workload → two tabs; re-click focuses; background tab still gets chunks.

### Tests

- [x] T014 [P] [US2] Unit: tab dedupe by navKey in `tests/unit/workspace_tabs.spec.ts`
- [x] T015 [P] [US2] Cargo test: workload_summary fallbacks / N/D in `src-tauri/src/k8s/metrics.rs` (or `commands/workload.rs`)
- [x] T016 [P] [US2] Integration: logs_open multi-replica fan-in notes in `tests/integration/logs_fanin.spec.ts`

### Implementation

- [x] T017 [US2] Implement multi-replica follow fan-in in `src-tauri/src/k8s/logs.rs` (tag `pod_name` on each chunk)
- [x] T018 [US2] Update `logs_open` in `src-tauri/src/commands/logs.rs` to follow all replica pods for deployment
- [x] T019 [P] [US2] Implement `workload_summary` in `src-tauri/src/commands/workload.rs` + `src-tauri/src/k8s/metrics.rs` (demo/seed + N/D)
- [x] T020 [US2] Create `src/components/logs/WorkloadSummaryStrip.tsx` (replicas, RAM, CPU, uptime / N/D)
- [x] T021 [US2] Extend `src/hooks/useLogWindows.ts` / `useWorkspaceTabs.ts`: open-or-focus by navKey; do not cancel follow on blur; cancel only on tab close
- [x] T022 [US2] Update `src/views/LogWindow.tsx` to show summary strip under tabs + combined Structured/Raw bodies
- [x] T023 [US2] AccordionNav click on Deployment → open log tab (no button) in `src/components/catalog/AccordionNav.tsx` + `MainShell.tsx`

**Checkpoint**: US2 independently demoable

---

## Phase 5: User Story 3 — Open ConfigMap by click (P1)

**Goal**: Click ConfigMap → RO tab in same strip; dedupe; no separate open button.

**Independent Test**: Click payments-config → tab with keys; re-click focuses; coexist with log tabs.

### Tests

- [x] T024 [P] [US3] Vitest: ConfigMap tab open/focus dedupe in `tests/unit/configmap_tabs.spec.ts`

### Implementation

- [x] T025 [US3] Add ConfigMap tab kind to `src/hooks/useWorkspaceTabs.ts` (open via `k8s_get_configmap`)
- [x] T026 [US3] Render ConfigMap RO body inside shared tab strip in `src/views/LogWindow.tsx` (or `src/components/catalog/ConfigMapTab.tsx`)
- [x] T027 [US3] AccordionNav ConfigMap click → open/focus tab in `src/components/catalog/AccordionNav.tsx`
- [x] T028 [P] [US3] Remove leftover right-rail ConfigMaps UI paths from `src/views/MainShell.tsx` / `src/hooks/useConfigMaps.ts` as needed

**Checkpoint**: US3 independently testable

---

## Phase 6: User Story 4 — Accordion collapse / empty states (P2)

**Goal**: Independent expand/collapse; disconnected/empty explicit hints; disconnect clears tabs.

**Independent Test**: Collapse both sections; disconnect → empty hint + tabs closed; expand again after reconnect.

### Tests

- [x] T029 [P] [US4] Vitest: empty/disconnected accordion copy in `tests/unit/accordion_empty.spec.tsx`

### Implementation

- [x] T030 [US4] Persist section expanded state in AccordionNav; empty + connect-first messages in `src/components/catalog/AccordionNav.tsx`
- [x] T031 [US4] On disconnect / `liveGeneration` bump: close all tabs + `logs_close` in `src/hooks/useWorkspaceTabs.ts` / `useConnection.ts`
- [x] T032 [P] [US4] Align empty chrome with wireframe `wireframes/02-accordion-empty.svg` notes in `src/views/MainShell.tsx`

**Checkpoint**: US4 complete

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: E2E, docs, cleanup

- [x] T033 Implement primary E2E outline connect → accordion click → summary + fan-in in `tests/e2e/accordion_primary_flow.spec.ts`
- [x] T034 [P] Run [quickstart.md](./quickstart.md) scenarios; note results in `TESTING.md` (002 section)
- [x] T035 [P] Sync AI4Devs `5-historias-de-usuario.md` / `6-tickets-de-trabajo.md` with HU accordion layout + task IDs
- [x] T036 Confirm no buscador / Abrir logs / right rail via grep in `src/`; update `contracts/ui-ia.md` sign-off if wireframes reviewed
- [ ] T037 [P] Wireframe review follow-up (`/speckit-wireframe-review`) if not signed off in `spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 → US2 → US3 → US4** → **Polish**
- Foundational **blocks** all stories
- Recommended: US1 (layout) before US2 (click/logs); US3 can parallel US2 after AccordionNav exists; US4 after US1

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP layout |
| US2 | US1 | Needs accordion click targets |
| US3 | US1 | Same nav; tabs shared with US2 |
| US4 | US1 | Empty/collapse polish |

### Parallel Opportunities

- T002 ∥ T003 (permissions vs ipc.ts)
- T007 ∥ T008 (US1 tests)
- T014 ∥ T015 ∥ T016 (US2 tests)
- T019 ∥ T020 (summary backend vs strip UI)
- US3 tests/impl after AccordionNav exists can parallel late US2 polish

### Parallel Example: User Story 2

```bash
# After T017–T018 exist:
Task: "WorkloadSummaryStrip in src/components/logs/WorkloadSummaryStrip.tsx"
Task: "Cargo tests for metrics N/D in src-tauri/src/k8s/metrics.rs"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 + 2  
2. **US1** accordion layout → validate  
3. **US2** click + fan-in + summary (primary value)  
4. **US3** ConfigMap tabs  
5. **US4** empty/collapse + Polish E2E  

### Incremental Delivery

Each US checkpoint above is a demo stop.

### Notes

- No HTTP API — Tauri IPC only  
- No full log dumps in SQLite  
- Metrics N/D when unavailable  
- Commit after each task or logical group  
- Next command: `/speckit-implement`
