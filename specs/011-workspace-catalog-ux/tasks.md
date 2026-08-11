# Tasks: Workspace catalog & UI polish

**Input**: Design documents from `/specs/011-workspace-catalog-ux/`  
**Branch / feature**: `011-workspace-catalog-ux`  
**Decisions baked in**: RAM/CPU = one-pod `request / limit` (sum containers, not × replicas, not live usage); catalog order Deployments → Pods → Services → ConfigMaps; log export = Raw only; Spanish follow status; dialog `save` for export; thin themed scrollbars; stick label adjacent to checkbox.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; live checks via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (dialog save + shared helpers) → US1 (summary) → US2 (stick) → US3 (scrollbars) → US4 (indent) → US6 (export) → US7 (catalog 4 sections) → US5 (Spanish status) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [x] T001 Confirm agent context points at `specs/011-workspace-catalog-ux/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Inventory current `EnvTreeNav`, `WorkloadSummaryStrip`, `metrics.rs`, dialog capabilities against plan paths

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dialog save capability and shared export helper used by US6

**⚠️ CRITICAL**: Blocks export stories; other UI stories can start after T001–T002 but export needs this phase

- [x] T003 Add dialog save permission (e.g. `dialog:allow-save`) to `src-tauri/capabilities/default.json`
- [x] T004 Create `saveTextFile(defaultPath, contents)` in `src/lib/fileExport.ts` using `@tauri-apps/plugin-dialog` `save()` + write; cancel → no write; throw on failure
- [x] T005 [P] Unit-test cancel vs write mapping in `tests/unit/fileExport.test.ts` with injected mocks

**Checkpoint**: Save dialog helper mockable in Vitest

---

## Phase 3: User Story 1 — Workload summary metrics (P1) 🎯 MVP

**Goal**: Summary strip shows Replicas + one-pod provisioned RAM/CPU as `request / limit` + Uptime when known; N/D only when missing.

**Independent Test**: Open Deployment with known template resources → strip populated; not × replicas; not live usage.

### Tests

- [x] T006 [P] [US1] Cargo unit tests for request/limit sum across containers and `request / limit` formatting in `src-tauri/src/k8s/metrics.rs` (or helper module)
- [x] T007 [P] [US1] Vitest formatting/display of summary fields in `tests/unit/workload_summary_format.spec.ts`

### Implementation

- [x] T008 [US1] Implement live `workload_summary` from Deployment status + pod template resources in `src-tauri/src/k8s/metrics.rs` / `src-tauri/src/commands/workload.rs` per [contracts/workload-summary.md](./contracts/workload-summary.md)
- [x] T009 [US1] Ensure demo summaries use provisioned-looking `request / limit` strings in `src-tauri/src/k8s/metrics.rs`
- [x] T010 [US1] Align `WorkloadSummaryStrip` labels/units for `request / limit` display in `src/components/logs/WorkloadSummaryStrip.tsx`
- [x] T011 [P] [US1] Confirm FE types in `src/lib/ipc.ts` match summary payload (null → N/D)

**Checkpoint**: SC-001 demoable

---

## Phase 4: User Story 2 — Stick-to-bottom layout (P1)

**Goal**: Checkbox and “Pegar al final” stay adjacent as one group.

**Independent Test**: Open log tab → visual adjacency; narrow window still grouped.

### Tests

- [x] T012 [P] [US2] Assert stick control markup/CSS grouping in `tests/unit/stick_layout.spec.tsx` (source or render)

### Implementation

- [x] T013 [US2] Fix stick control structure/classes in `src/views/LogWindow.tsx` so input + label are one group
- [x] T014 [US2] Add `.log-window__stick` (inline-flex, gap, nowrap) in `src/styles/workspace.css`

**Checkpoint**: SC-002

---

## Phase 5: User Story 3 — Custom scrollbars (P1)

**Goal**: Thin theme-aligned scrollbars on workspace scroll surfaces (light + dark).

**Independent Test**: Overflow logs/ConfigMap/tree → thin themed bars.

### Tests

- [x] T015 [P] [US3] Assert scrollbar CSS rules exist for workspace selectors in `tests/unit/scrollbar_theme.spec.ts`

### Implementation

- [x] T016 [US3] Add thin themed scrollbar styles (WebKit + `scrollbar-color`/`scrollbar-width`) in `src/styles/workspace.css` and/or `src/index.css` covering log panes, ConfigMap keys, catalog tree, drawers
- [x] T017 [P] [US3] Verify light/dark contrast via CSS variables already used by theme in `src/styles/workspace.css`

**Checkpoint**: SC-003

---

## Phase 6: User Story 4 — Catalog indentation (P1)

**Goal**: Section children indented past section titles.

**Independent Test**: Expand section → children clearly to the right of glosa.

### Tests

- [x] T018 [P] [US4] Assert indent class/structure for section children in `tests/unit/catalog_section_order.spec.tsx` (shared with US7) or `tests/unit/catalog_indent.spec.tsx`

### Implementation

- [x] T019 [US4] Increase child indent vs section title in `src/components/catalog/EnvTreeNav.tsx` and related CSS in `src/styles/workspace.css`

**Checkpoint**: SC-004 (finalize with US7 sections)

---

## Phase 7: User Story 6 — Export Raw log & ConfigMap (P1)

**Goal**: Export buttons write local text files (Raw buffer / ConfigMap text); cancel writes nothing; no secrets.

**Independent Test**: Export log → Raw file; Export ConfigMap → keys/values; cancel → no file.

### Tests

- [x] T020 [P] [US6] Unit: Raw export builder uses chronological buffer only in `tests/unit/export_raw.spec.ts`
- [x] T021 [P] [US6] Unit: ConfigMap text serialization + empty disables Export in `tests/unit/export_raw.spec.ts`

### Implementation

- [x] T022 [US6] Wire Export on Deployment/pod log toolbar in `src/views/LogWindow.tsx` calling `saveTextFile` with Raw chunk text
- [x] T023 [US6] Wire Export on ConfigMap tab in `src/components/catalog/ConfigMapTab.tsx` (or LogWindow ConfigMap branch)
- [x] T024 [US6] Disable Export when buffer/detail empty with short copy in the same UI files
- [x] T025 [P] [US6] Ensure export payloads never include PEM/IAM/token material in `src/lib/fileExport.ts` / builders

**Checkpoint**: SC-006

---

## Phase 8: User Story 7 — Catalog Deployments / Pods / Services / ConfigMaps (P1)

**Goal**: Four sections in order; open behaviors per contract; Service detail tab; pod-scoped logs.

**Independent Test**: Connect → four sections → open one of each type successfully.

### Tests

- [x] T026 [P] [US7] Assert section order Deployments → Pods → Services → ConfigMaps in `tests/unit/catalog_section_order.spec.tsx`
- [x] T027 [P] [US7] Smoke: Service detail renders read-only fields in `tests/unit/service_detail.spec.tsx`

### Implementation

- [x] T028 [US7] Hydrate Services (+ ensure flat Pods available) in `src-tauri/src/k8s/catalog.rs` / session cache / `src-tauri/src/commands/catalog.rs`
- [x] T029 [US7] Expose list IPC for pods and services in `src/lib/ipc.ts` and FE hooks (`src/hooks/useCatalog.ts` or new hooks)
- [x] T030 [US7] Restructure `src/components/catalog/EnvTreeNav.tsx` to four sections in required order with open handlers
- [x] T031 [US7] Keep Deployment open → fan-in logs in `src/hooks/useWorkspaceTabs.ts` / MainShell wiring
- [x] T032 [US7] Add pod-scoped `logs_open` (optional pod name) in `src-tauri/src/commands/logs.rs` + `src-tauri/src/k8s/logs.rs`; wire FE open-pod
- [x] T033 [US7] Add `ServiceDetailTab` in `src/components/catalog/ServiceDetailTab.tsx` and route from `src/views/LogWindow.tsx`
- [x] T034 [P] [US7] Per-section empty/error states without breaking siblings in `src/components/catalog/EnvTreeNav.tsx`

**Checkpoint**: SC-007

---

## Phase 9: User Story 5 — Follow status in Spanish (P2)

**Goal**: No English “following” in status; Spanish variants for follow/idle/errors as applicable.

**Independent Test**: Open following tab → status shows e.g. “siguiendo”, not “following”.

### Tests

- [x] T035 [P] [US5] Unit/assert Spanish status strings in `tests/unit/follow_status_es.spec.ts` and/or cargo test in `src-tauri/src/k8s/logs.rs`

### Implementation

- [x] T036 [US5] Change emitted follow status strings to Spanish in `src-tauri/src/k8s/logs.rs`
- [x] T037 [P] [US5] Optional FE fallback map for any legacy English status in `src/views/LogWindow.tsx` or small helper

**Checkpoint**: SC-005

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T038 [P] Sync HU19 notes in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [x] T039 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [x] T040 Manual pass of [quickstart.md](./quickstart.md) (demo + live when available)
- [x] T041 Security spot-check: export files and SQLite contain no PEM/IAM secrets / no auto log dumps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (export)  
- **US1** after Setup (independent of Foundational)  
- **US2–US4** after Setup; parallel with US1  
- **US6** after Foundational  
- **US7** after Setup; can parallel US1; pod logs touch `logs.rs` (coordinate with US5)  
- **US5** after/with US7 log changes ideally last on `logs.rs`  
- **Polish** last  

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | MVP metrics |
| US2–US4 | Pure UI; parallel |
| US6 | Needs T003–T005 |
| US7 | Largest; catalog + pod logs + services |
| US5 | Status strings; after US7 log work preferred |

### Parallel Opportunities

- T001 ∥ T002  
- T006 ∥ T007; T012 ∥ T015 ∥ T018  
- US2 ∥ US3 ∥ US4 after Setup  
- T020 ∥ T021  
- T026 ∥ T027  
- T038 ∥ T039  

---

## Parallel Example: UI polish (US2–US4)

```text
Task: "stick_layout.spec.tsx + LogWindow/CSS stick fix"
Task: "scrollbar_theme.spec.ts + workspace.css scrollbars"
Task: "catalog indent in EnvTreeNav + CSS"
```

---

## Parallel Example: User Story 7

```text
Task: "catalog_section_order.spec.tsx"
Task: "service_detail.spec.tsx"
# Then sequential:
Task: "hydrate Services/Pods in catalog.rs"
Task: "EnvTreeNav four sections"
Task: "pod-scoped logs_open + ServiceDetailTab"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + US1 summary metrics  
2. **STOP and VALIDATE** strip on demo/live  
3. Then US2–US4 polish → US6 export → US7 catalog → US5 Spanish  

### Incremental Delivery

1. US1 metrics  
2. US2+US3+US4 chrome  
3. US6 export  
4. US7 full catalog  
5. US5 Spanish status  
6. Polish docs/tests  

### Suggested MVP scope

**US1 only** (summary strip) for first shippable increment; then UI polish (US2–US4) before catalog expansion.

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not persist export bodies or full logs to SQLite  
- Read-only kube only  
- Commit when user asks  
