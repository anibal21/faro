# Tasks: Deployment YAML, Pod Logs & Full Export

**Input**: Design documents from `/specs/012-deployment-yaml-full-export/`  
**Branch / feature**: `012-deployment-yaml-full-export`  
**Decisions baked in**: Deployments = YAML only (no logs); Pods with owner = fan-in all replicas (reuse tab per Deployment); orphans = single-pod; Export = exhaust older history then write Raw; no `iniciando` chrome; RAM/CPU from Deployment template (011 metrics).

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (IPC + tab kinds) → US1 (Deployment YAML) → US2 (Pod fan-in) → US3 (summary wiring) → US4 (export exhaust) → US5 (status chrome) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [x] T001 Confirm agent context points at `specs/012-deployment-yaml-full-export/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Inventory `useWorkspaceTabs.openDeployment` / `openPod`, `LogWindow` tab kinds, `logs_open` pod filter, and `fileExport` against [plan.md](./plan.md) paths

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared FE types / permissions scaffolding used by US1–US4

**⚠️ CRITICAL**: Register new commands before wiring UI stories that invoke them

- [x] T003 Add `deployment-yaml` workspace tab kind and nav-key helpers in `src/hooks/useWorkspaceTabs.ts` / `src/hooks/tabKeys.ts` (as needed) without changing open behavior yet
- [x] T004 [P] Extend `src/lib/ipc.ts` with `k8sGetDeploymentYaml` stub types matching [contracts/deployment-yaml.md](./contracts/deployment-yaml.md)
- [x] T005 Register `k8s_get_deployment_yaml` in `src-tauri/src/lib.rs`, `src-tauri/permissions/faro.toml`, and `src-tauri/capabilities/default.json`

**Checkpoint**: IPC + permissions ready; UI can call YAML get once backend exists

---

## Phase 3: User Story 1 — Deployment YAML only (P1) 🎯 MVP

**Goal**: Opening a catalog Deployment shows read-only YAML; never starts log follow.

**Independent Test**: Connect demo → Deployments → open payments-api → YAML visible; no Raw/Structured log chrome.

### Tests

- [x] T006 [P] [US1] Vitest: Deployment open path routes to YAML tab (not `logsOpen`) in `tests/unit/deployment_yaml_open.spec.ts` (source assert and/or mocked hook)
- [x] T007 [P] [US1] Cargo smoke: demo Deployment YAML non-empty for known name in `src-tauri/src/k8s/catalog.rs` (or new helper module tests)

### Implementation

- [x] T008 [US1] Implement live + demo `get_deployment_yaml` in `src-tauri/src/k8s/catalog.rs` and command in `src-tauri/src/commands/catalog.rs` per [contracts/deployment-yaml.md](./contracts/deployment-yaml.md)
- [x] T009 [US1] Create `src/components/catalog/DeploymentYamlTab.tsx` read-only YAML viewer
- [x] T010 [US1] Change `openDeployment` in `src/hooks/useWorkspaceTabs.ts` to fetch YAML and open `deployment-yaml` tab (no `logs_open`)
- [x] T011 [US1] Render `deployment-yaml` branch in `src/views/LogWindow.tsx` (and wire `MainShell` if needed)

**Checkpoint**: SC-001 demoable

---

## Phase 4: User Story 2 — Pods fan-in logs (P1)

**Goal**: Opening a Pod with Deployment owner fans in all replicas (prior log behavior); orphans stay single-pod; reuse one tab per owner Deployment.

**Independent Test**: Pods → open any replica of multi-pod Deployment → lines from all replicas; second replica focuses same tab.

### Tests

- [x] T012 [P] [US2] Vitest: `openPod` with owner calls `logsOpen(ns, deployment)` without pod filter / uses stable deploy-logs navKey in `tests/unit/pod_fanin_open.spec.ts`
- [x] T013 [P] [US2] Vitest or source assert: orphan pod still passes pod filter in same test file or `tests/unit/pod_orphan_open.spec.ts`

### Implementation

- [x] T014 [US2] Rewrite `openPod` in `src/hooks/useWorkspaceTabs.ts` per [contracts/pod-fanin-logs.md](./contracts/pod-fanin-logs.md) (fan-in vs orphan; tab reuse)
- [x] T015 [US2] Ensure `EnvTreeNav` / `MainShell` still pass `deploymentName` into `onOpenPod` from `src/components/catalog/EnvTreeNav.tsx`
- [x] T016 [P] [US2] Confirm backend `logs_open` without `pod_name` still fans in all Deployment pods in `src-tauri/src/k8s/logs.rs` / `src-tauri/src/commands/logs.rs` (fix if broken)

**Checkpoint**: SC-002 demoable

---

## Phase 5: User Story 3 — Summary from Deployment config (P1)

**Goal**: Fan-in log tabs show Replicas + RAM/CPU from Deployment template (provisioned); N/D when missing.

**Independent Test**: Fan-in tab for Deployment with template resources → strip shows `request / limit` style values.

### Tests

- [x] T017 [P] [US3] Vitest: fan-in open requests `workloadSummary(ns, ownerDeployment)` in `tests/unit/pod_fanin_summary.spec.ts` (mock assert)

### Implementation

- [x] T018 [US3] Wire `workloadSummary` on fan-in `openPod` path in `src/hooks/useWorkspaceTabs.ts` using owner Deployment name
- [x] T019 [P] [US3] Confirm `WorkloadSummaryStrip` still displays provisioned fields in `src/components/logs/WorkloadSummaryStrip.tsx` (no live-usage regression)

**Checkpoint**: SC-003

---

## Phase 6: User Story 4 — Export exhaust full history (P1)

**Goal**: Export pages older history until exhausted for tab pods, then writes Raw file; cancel/abort writes nothing; progress visible.

**Independent Test**: Export with deeper-than-buffer history → file exceeds pre-click buffer; cancel → no file.

### Tests

- [x] T020 [P] [US4] Unit-test exhaust gather orchestration (mock load-older until exhausted) in `tests/unit/export_exhaust.spec.ts`
- [x] T021 [P] [US4] Assert export builder still chronological Raw-only in `tests/unit/export_raw.spec.ts` or extend `tests/unit/fileExport.test.ts`

### Implementation

- [x] T022 [US4] Implement exhaust-gather helper (reuse `logsLoadOlder` depths) in `src/lib/fileExport.ts` and/or `src/hooks/useWorkspaceTabs.ts` per [contracts/export-exhaust.md](./contracts/export-exhaust.md)
- [x] T023 [US4] Wire LogWindow Export to gather → `saveTextFile` with progress + abort in `src/views/LogWindow.tsx`
- [x] T024 [US4] Ensure cancel/abort paths never call write / never leave partial export file in `src/views/LogWindow.tsx` / `src/lib/fileExport.ts`

**Checkpoint**: SC-004 / SC-006

---

## Phase 7: User Story 5 — Remove “iniciando” (P2)

**Goal**: No non-actionable `iniciando` / starting status in log chrome.

**Independent Test**: Open Pod log → toolbar never shows `iniciando`.

### Tests

- [x] T025 [P] [US5] Assert no `"iniciando"` seed / display in `tests/unit/follow_status_es.spec.ts` or `tests/unit/status_chrome.spec.ts`

### Implementation

- [x] T026 [US5] Remove `status: "iniciando"` initialization from `src/hooks/useWorkspaceTabs.ts`
- [x] T027 [P] [US5] Hide empty/non-actionable starting statuses in `src/views/LogWindow.tsx` per [contracts/status-chrome.md](./contracts/status-chrome.md)

**Checkpoint**: SC-005

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T028 [P] Sync HU20 notes in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [x] T029 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [x] T030 Manual pass of [quickstart.md](./quickstart.md) (demo + live when available)
- [x] T031 Security spot-check: YAML/export/errors contain no PEM/IAM secrets; no SQLite full log dumps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (IPC/permissions)
- **US1** after Foundational (MVP)
- **US2** after Foundational; can parallel US1 after T005 if different files coordinated
- **US3** after US2 (summary on fan-in open)
- **US4** after US2 (needs log tabs); uses existing `fileExport` from 011
- **US5** anytime after Setup; best after US2 touches `useWorkspaceTabs`
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | MVP — Deployment YAML |
| US2 | Pod fan-in; independent of YAML viewer |
| US3 | Depends on US2 open path |
| US4 | Depends on log tabs (US2) |
| US5 | Chrome polish on log tabs |

### Parallel Opportunities

- T001 ∥ T002  
- T006 ∥ T007; T012 ∥ T013  
- T020 ∥ T021  
- US1 backend (T008) ∥ FE shell prep once types exist  
- T028 ∥ T029  

---

## Parallel Example: US1

```text
Task: "deployment_yaml_open.spec.ts + catalog.rs YAML tests"
Task: "k8s_get_deployment_yaml command + DeploymentYamlTab + openDeployment"
```

---

## Parallel Example: US2 + US5

```text
Task: "pod_fanin_open.spec.ts"
Task: "rewrite openPod fan-in + remove iniciando seed"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + Foundational + US1 Deployment YAML  
2. **STOP and VALIDATE** SC-001 on demo  
3. Then US2 fan-in → US3 summary → US4 export exhaust → US5 status  

### Incremental Delivery

1. US1 YAML  
2. US2 Pod fan-in  
3. US3 summary confirm  
4. US4 full export  
5. US5 remove iniciando  
6. Polish docs/tests  

### Suggested MVP scope

**US1 only** (Deployment YAML) for first shippable increment; then Pod logs (US2) before export (US4).

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not persist export bodies or YAML dumps to SQLite  
- Read-only kube only  
- Commit when user asks  
