# Tasks: Live logs workspace UX

**Input**: Design documents from `/specs/010-live-logs-workspace/`  
**Branch / feature**: `010-live-logs-workspace`  
**Decisions baked in**: ~500 lines/pod initial + load-older; progressive `tail_lines` snapshots; stick-to-bottom default on + auto-off on scroll up; viewport preserve on prepend; ConfigMap full height without analysis chrome; fan-in arrival-order; bastion token path documented/verified.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/logs-session.md](./contracts/logs-session.md), [contracts/log-workspace-ui.md](./contracts/log-workspace-ui.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; live follow/load-older also validated via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (session state + scroll helpers) → US1 (follow + load-older) → US2 (Structured) → US3 (stick-to-bottom) → US4 (ConfigMap layout) → US5 (bastion auth verify) → Polish. Paths at repo root (`src/`, `src-tauri/`, `tests/`).

**Note**: Live follow, fan-in, Structured write-groups, and bastion token minting may already exist in tree — US1/US2/US5 tasks include **verify/align** plus any gap-fill; US1 load-older, US3, and US4 are expected greenfield relative to current gaps.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and map existing log pipeline files

- [x] T001 Confirm agent context points at `specs/010-live-logs-workspace/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Inventory existing live follow / Structured / ConfigMap entrypoints against plan paths (`src-tauri/src/k8s/logs.rs`, `src-tauri/src/commands/logs.rs`, `src/hooks/useWorkspaceTabs.ts`, `src/components/logs/*`, `src/components/catalog/ConfigMapTab.tsx`)

**Checkpoint**: Context and file map ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared ephemeral tab fields and scroll helpers used by US1/US3

**âš ï¸ CRITICAL**: Blocks stick-to-bottom and load-older UI wiring

- [x] T003 Extend Deployment log tab session state in `src/hooks/useWorkspaceTabs.ts` with `stickToBottom` (default `true`), `historyDepthByPod`, `exhaustedPods` / `loadOlderStatus` per [data-model.md](./data-model.md)
- [x] T004 [P] Add shared scroll helpers (bottom detection, scrollHeight-delta preserve, scroll-to-end) in `src/lib/logScroll.ts` (or `src/hooks/useLogScroll.ts`) for Raw/Structured containers
- [x] T005 [P] Unit-test scroll helpers (preserve delta, near-bottom detection) in `tests/unit/log_scroll.spec.ts`

**Checkpoint**: Tab session fields + mockable scroll helpers available

---

## Phase 3: User Story 1 — Live Deployment logs follow + load older (P1) ðŸŽ¯ MVP

**Goal**: Continuous follow with ~500-line initial tail per pod, fan-in, stop on close; explicit load-older ~500/pod with prepend + exhaustion feedback.

**Independent Test**: Live connect → open Deployment → see ~500/pod → new lines arrive without reopen → Load older prepends ~500/pod and preserves mid-scroll → close tab stops follow. See [quickstart.md](./quickstart.md).

### Tests

- [x] T006 [P] [US1] Unit/integration: mock `logs_load_older` prepends older batches and sets exhaustion in `tests/unit/load_older.spec.ts` (or `tests/integration/logs_load_older.spec.ts`)
- [x] T007 [P] [US1] Unit: viewport preserve on prepend using scroll helpers in `tests/unit/load_older_viewport.spec.tsx`
- [x] T008 [P] [US1] Align/extend fan-in / follow smoke coverage in `tests/integration/logs_fanin.spec.ts` and/or `tests/integration/logs_stream.spec.ts` for open/close + chunk events (no silent demo on live empty)

### Implementation

- [x] T009 [US1] Verify/align live follow `tail_lines â‰ˆ 500`, `follow=true`, fan-in, and cancel-on-close in `src-tauri/src/k8s/logs.rs` + `src-tauri/src/commands/logs.rs` per [contracts/logs-session.md](./contracts/logs-session.md)
- [x] T010 [US1] Implement progressive history fetch helper (depth += 500, prefix diff per pod, exhaustion) in `src-tauri/src/k8s/logs.rs`
- [x] T011 [US1] Expose `logs_load_older` Tauri command (and register) in `src-tauri/src/commands/logs.rs` / `src-tauri/src/lib.rs` returning older batches + exhausted pods without killing follow
- [x] T012 [US1] Wire FE invoke of `logs_load_older`, prepend chunks with pod attribution, update `historyDepthByPod` / exhaustion in `src/hooks/useWorkspaceTabs.ts`
- [x] T013 [US1] Add **Load older** control + loading/exhausted copy on Deployment log toolbar in `src/components/logs/LogWorkspace.tsx` per [contracts/log-workspace-ui.md](./contracts/log-workspace-ui.md)
- [x] T014 [US1] Apply scrollHeight-delta preserve when older chunks prepend in `src/components/logs/RawLogView.tsx` and `src/components/logs/StructuredLogView.tsx` (via T004 helpers)
- [x] T015 [P] [US1] Ensure live empty-pod / error status does not inject demo sample logs in `src/hooks/useWorkspaceTabs.ts` / live open path

**Checkpoint**: Follow + load-older demoable; MVP for continuous logs

---

## Phase 4: User Story 2 — Structured write-groups (P1)

**Goal**: Structured presents Spring-style errors + stacks as clickable write-groups; Raw shares the same follow session.

**Independent Test**: Fixture/live stacktrace → one Structured group; separate INFO groups; click runs local analysis; toggle Raw keeps follow.

### Tests

- [x] T016 [P] [US2] Confirm/extend Spring stack grouping coverage in `tests/unit/structured_log_groups.spec.ts`
- [x] T017 [P] [US2] Confirm error mark + analyze eligibility in `tests/unit/write_groups.spec.ts`

### Implementation

- [x] T018 [US2] Verify/align `chunksToWriteGroups` / continuation heuristics in `src/components/logs/StructuredLogView.tsx` with FR-004
- [x] T019 [US2] Verify click-to-analyze still uses local rules drawer path in `src/components/logs/LogWorkspace.tsx` / `src/hooks/useAnalysisDrawer.ts` (no external AI)
- [x] T020 [P] [US2] Verify Raw/Structured toggle does not restart follow session in `src/hooks/useWorkspaceTabs.ts` / `src/components/logs/LogWorkspace.tsx`

**Checkpoint**: Structured UX matches US2 / SC-002

---

## Phase 5: User Story 3 — Stick-to-bottom switch (P1)

**Goal**: Per-tab switch defaults on; sticks on new follow lines; auto-off on scroll up; toggle on jumps to newest; shared across Raw/Structured.

**Independent Test**: Follow active → stick on keeps end; scroll up turns switch off and preserves position; re-enable jumps to end.

### Tests

- [x] T021 [P] [US3] Unit/UI: default on, auto-off on scroll up, toggle-on scrolls to end in `tests/unit/stick_to_bottom.spec.tsx`
- [x] T022 [P] [US3] Unit: with stick off, new chunks do not force scroll in `tests/unit/stick_to_bottom.spec.tsx`

### Implementation

- [x] T023 [US3] Add stick-to-bottom switch to Deployment log toolbar in `src/components/logs/LogWorkspace.tsx` bound to tab `stickToBottom`
- [x] T024 [US3] On new follow chunks, auto-scroll only when `stickToBottom` in `src/components/logs/RawLogView.tsx` and `src/components/logs/StructuredLogView.tsx`
- [x] T025 [US3] Detect scroll-up away from bottom → set `stickToBottom=false` in tab state via `src/hooks/useWorkspaceTabs.ts` + scroll helpers
- [x] T026 [US3] On switch ON, scroll to newest and set `stickToBottom=true` in `src/components/logs/LogWorkspace.tsx`
- [x] T027 [P] [US3] Ensure new Deployment tabs initialize `stickToBottom=true` in `src/hooks/useWorkspaceTabs.ts` (also demo tabs)

**Checkpoint**: Stick-to-bottom matches US3 / SC-003 / SC-004

---

## Phase 6: User Story 4 — ConfigMap full height (P1)

**Goal**: ConfigMap tabs fill main pane height with no empty lower analysis panel; Deployment analysis layout preserved when switching back.

**Independent Test**: Open ConfigMap → full height, no empty analysis chrome; switch to Deployment → analysis available; switch back → still full height.

### Tests

- [x] T028 [P] [US4] Unit/layout: ConfigMap path does not render AnalysisDrawer / empty lower panel markers in `tests/unit/configmap_layout.spec.tsx`
- [x] T029 [P] [US4] Assert `LogWindow` routes ConfigMap to `ConfigMapTab` (not `LogWorkspace`) in `tests/integration/log_workspace_layout.spec.ts` or `tests/unit/configmap_layout.spec.tsx`

### Implementation

- [x] T030 [US4] Enforce full-height flex/`min-height: 0` / overflow for ConfigMap content in `src/components/catalog/ConfigMapTab.tsx` and `src/styles/workspace.css`
- [x] T031 [US4] Confirm `src/views/LogWindow.tsx` keeps ConfigMaps outside `LogWorkspace` so analysis drawer chrome cannot appear
- [x] T032 [P] [US4] Spot-check Deployment `LogWorkspace` + `AnalysisDrawer` still available after ConfigMap layout CSS changes in `src/components/logs/LogWorkspace.tsx`

**Checkpoint**: ConfigMap layout matches US4 / SC-005

---

## Phase 7: User Story 5 — Bastion identity for Kubernetes token (P2)

**Goal**: Live session kube bearer token comes from bastion identity path; laptop IAM only for discovery metadata; failures actionable without secrets.

**Independent Test**: Bastion kubectl already works → Faro connect/catalog/logs succeed without new laptop aws-auth mapping; token mint failure shows safe error.

### Tests

- [x] T033 [P] [US5] Unit/integration smoke: connect/auth error paths redact secrets (assert messages do not contain token/key material) in existing auth/connect tests or `tests/unit/eks_auth_errors.spec.ts`

### Implementation

- [x] T034 [US5] Verify/align bastion-minted token path used by live kube client for catalog/logs in `src-tauri/src/k8s/eks_auth.rs` (and connect wiring) per FR-011
- [x] T035 [US5] Ensure `logs_open` / `logs_load_older` reuse the same live session credentials (no laptop-only token requirement) in `src-tauri/src/commands/logs.rs` / `src-tauri/src/k8s/logs.rs`
- [x] T036 [P] [US5] Confirm actionable, secret-free error surfaces on token mint failure in connect/UI error mapping (`src-tauri/src/commands/connect.rs` and/or FE error display)

**Checkpoint**: US5 documented behavior verified for live path

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs sync, quickstart pass, security spot-check

- [x] T037 [P] Sync AI4Devs notes for live logs UX (stick-to-bottom, load-older, ConfigMap height) in `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md` as appropriate
- [x] T038 [P] Run automated suite: `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [x] T039 Manual pass of [quickstart.md](./quickstart.md) stick-to-bottom + ConfigMap sections (demo); live follow/load-older when cluster available
- [x] T040 Security spot-check SC-007: no full log dumps or PEM/IAM secrets in SQLite from this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **blocks** US1 load-older UI, US3
- **US1 (Phase 3)**: After Foundational
- **US2 (Phase 4)**: After Foundational; can parallel with US4/US5
- **US3 (Phase 5)**: After Foundational; best after US1 chunk plumbing
- **US4 (Phase 6)**: Independent of US1–US3 after Foundational
- **US5 (Phase 7)**: Independent verify; parallel with US2/US4
- **Polish (Phase 8)**: After desired stories complete

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP: follow verify + load-older |
| US2 | Phase 2 | Mostly verify existing Structured |
| US3 | Phase 2, shares scroll with US1 | Stick switch |
| US4 | Phase 2 light | ConfigMap CSS/layout |
| US5 | Live connect exists | Verify auth path |

### Parallel Opportunities

- T001 âˆ¥ T002
- T004 âˆ¥ T005
- US1 tests T006–T008 in parallel
- US2 tests T016–T017; US2 parallel with US4/US5
- US3 tests T021–T022
- US4 tests T028–T029; US4 impl âˆ¥ US5
- Polish T037 âˆ¥ T038

---

## Parallel Example: User Story 3

```text
Task: "Unit/UI stick_to_bottom.spec.tsx — default on + auto-off"
Task: "Unit stick off does not force scroll"
# Then sequential impl:
Task: "Toolbar switch in LogWorkspace.tsx"
Task: "Auto-scroll on chunks when stick on in Raw/Structured"
Task: "Scroll-up → stickToBottom=false"
```

---

## Parallel Example: User Story 4

```text
Task: "configmap_layout.spec.tsx — no AnalysisDrawer"
Task: "LogWindow routes ConfigMap to ConfigMapTab"
Task: "Full-height CSS in ConfigMapTab.tsx + workspace.css"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + 2
2. Phase 3 (US1 follow align + load-older)
3. **STOP and VALIDATE** via quickstart follow + load-older
4. Then US3 (stick-to-bottom) for usable live investigation

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo follow + history paging
3. US3 → usable investigation scroll
4. US2 verify → Structured confidence
5. US4 → ConfigMap layout polish
6. US5 verify → auth agreement locked
7. Polish → docs + suite + SC-007

### Suggested MVP scope

**US1 only** (follow + load-older) for first shippable increment; **US3 immediately after** for usable live debugging (also P1).

---

## Notes

- [P] = different files, no incomplete-task dependency
- Do not persist log bodies to SQLite
- Load-older must not cancel active follow
- Fan-in ordering stays arrival-order (deferred timestamp merge)
- Commit after each task or logical group when user asks
