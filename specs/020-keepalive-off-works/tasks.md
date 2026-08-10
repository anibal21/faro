# Tasks: Keep-Alive Off Must Work

**Input**: Design documents from `/specs/020-keepalive-off-works/`  
**Branch / feature**: `020-keepalive-off-works`  
**Decisions baked in**: Flatten IPC (`instanceId` + `enabled`); reliable context-menu click; apply command result `keepAlive: false` to UI; FR-007 mock proof. Follow-up to 019.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/disable-keepalive-e2e.md](./contracts/disable-keepalive-e2e.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED — Vitest mocked disable → `keepAlive: false`; cargo keepalive regression.

**Organization**: Setup → Foundational (flat IPC) → US1 (disable E2E) → US2 (error feedback) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/020-keepalive-off-works/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/commands/connect.rs`, `src/lib/ipc.ts`, `src/hooks/useConnectionHealth.ts`, and `src/components/catalog/EnvTreeNav.tsx` against [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Flatten `env_set_keep_alive` IPC so `enabled: false` cannot be mis-deserialized

**⚠️ CRITICAL**: Complete before US1–US2

- [X] T003 Change `env_set_keep_alive` in `src-tauri/src/commands/connect.rs` to flat args `instance_id: String`, `enabled: bool` (remove nested `SetKeepAliveInput` / `payload`) per [contracts/disable-keepalive-e2e.md](./contracts/disable-keepalive-e2e.md)
- [X] T004 Update `envSetKeepAlive` in `src/lib/ipc.ts` to `invoke("env_set_keep_alive", { instanceId, enabled })` matching flat Rust params
- [X] T005 [P] Verify disable path still calls `stop_loop` + persists `"false"` in `src-tauri/src/commands/connect.rs` after signature change

**Checkpoint**: Flat IPC compiles; disable still hits stop/pref

---

## Phase 3: User Story 1 — Desactivar keep-alive punta a punta (P1) 🎯 MVP

**Goal**: Click **No mantener…** leaves Keep-alive OFF stably; enable still works; reconnect respects OFF.

**Independent Test**: ON → No mantener → OFF ≤1s; menu Mantener…; stays OFF ≥60s; reconnect OFF.

### Tests

- [X] T006 [P] [US1] Vitest FR-007: mock IPC; after disable action health/`byId` has `keepAlive: false` in `tests/unit/keepalive_disable.spec.tsx`
- [X] T007 [P] [US1] Vitest: EnvTree **No mantener** invokes callback with `false` in `tests/unit/session_keep_alive.spec.tsx` or `keepalive_disable.spec.tsx`

### Implementation

- [X] T008 [US1] Harden keep-alive menu activation in `src/components/catalog/EnvTreeNav.tsx` so WebView2 reliably fires disable (`onSelect` and/or `onClick` / pointer pattern from [research.md](./research.md))
- [X] T009 [US1] In `src/hooks/useConnectionHealth.ts`, after successful `envSetKeepAlive`, patch `byId` from command result `{ keepAlive }` immediately (then refresh) so OFF does not depend only on poll/events
- [X] T010 [P] [US1] Confirm reconnect with pref false does not start loop in `src-tauri/src/commands/connect.rs` (regression)

**Checkpoint**: SC-001 / SC-002 / SC-003 / SC-004 / SC-005

---

## Phase 4: User Story 2 — Fallo visible si apagado falla (P2)

**Goal**: Invoke/stop errors show to the user; UI does not fake OFF.

**Independent Test**: Simulated reject from `envSetKeepAlive` → alert/error and `keepAlive` restored/refreshed to real state.

### Tests

- [X] T011 [P] [US2] Vitest: when `envSetKeepAlive` rejects, hook refreshes and does not leave a lying OFF without server false in `tests/unit/keepalive_disable.spec.tsx`

### Implementation

- [X] T012 [US2] Ensure MainShell/`setKeepAlive` surfaces errors and reverts via refresh on failure in `src/views/MainShell.tsx` and/or `src/hooks/useConnectionHealth.ts`

**Checkpoint**: US2 acceptance

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T013 [P] Note 020 under HU25 in `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md`
- [X] T014 [P] Run `npx vitest run tests/unit/keepalive_disable.spec.tsx tests/unit/session_keep_alive.spec.tsx` and `cargo test --manifest-path src-tauri/Cargo.toml keepalive`
- [X] T015 Manual pass of [quickstart.md](./quickstart.md) (3× disable cycles)
- [X] T016 Spot-check: demo still has no keep-alive control; enable after disable works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (flat IPC)
- **US1** after Foundational
- **US2** after US1 hook changes (same files) or carefully parallel on error path only
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Needs flat IPC + menu + result patch |
| US2 | Builds on setKeepAlive error path |

### Parallel Opportunities

- T001 ∥ T002  
- T006 ∥ T007 after T004  
- T008 ∥ T010 after T009 optional  
- T013 ∥ T014  

---

## Parallel Example: US1

```text
Task: "Vitest keepalive_disable keepAlive false"
Task: "EnvTreeNav reliable No mantener click"
Task: "useConnectionHealth patch from command result"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Flatten IPC  
2. Menu click + result patch + FR-007 test  
3. **STOP and VALIDATE** with quickstart  
4. US2 error surfacing  

### Suggested MVP scope

**Foundational + US1**; include **US2** in same implement pass.

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not reintroduce nested `payload` without a failing test that justifies it  
- Commit when user asks  
