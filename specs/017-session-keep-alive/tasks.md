# Tasks: Session Keep-Alive

**Input**: Design documents from `/specs/017-session-keep-alive/`  
**Branch / feature**: `017-session-keep-alive`  
**Decisions baked in**: Per-env toggle default OFF; 60s remote kube heartbeat (no localhost primary); status connected|degraded|disconnected; 3 consecutive fails → disconnected + Reconectar via `env_connect`; demo skipped.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution + FR-011 — cargo state machine + Vitest toggle/status/reconnect; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (runtime health + API) → US1 (toggle + pulse) → US2 (status UI) → US3 (reconnect) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/017-session-keep-alive/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/runtime.rs`, `src-tauri/src/commands/connect.rs`, `src-tauri/src/ssh/tunnel.rs`, and `src/components/catalog/EnvTreeNav.tsx` against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Session health fields, preference storage, extended connection states IPC — required by all stories

**⚠️ CRITICAL**: Complete before US1–US3

- [X] T003 Extend `SessionEntry` / runtime health fields (`keep_alive`, status, `last_pulse_at`, `consecutive_failures`) in `src-tauri/src/runtime.rs` per [data-model.md](./data-model.md)
- [X] T004 [P] Add keep-alive preference get/set helpers (key `keepalive.<instanceId>`) in `src-tauri/src/db/workspace.rs` or prefs module
- [X] T005 Implement pure health state transitions (ok pulse / fail / threshold→disconnected) in `src-tauri/src/session/keepalive.rs` (or `src-tauri/src/session/health.rs`) and export module from `src-tauri/src/lib.rs`
- [X] T006 Extend `env_connection_states` payload (`status`, `keepAlive`, `lastPulseAt`, `mode`) in `src-tauri/src/commands/connect.rs` per [contracts/keep-alive-api.md](./contracts/keep-alive-api.md)
- [X] T007 [P] Update `src/lib/ipc.ts` types + `envConnectionStates` / add `envSetKeepAlive` stubs matching the contract

**Checkpoint**: States IPC compiles; unit-testable state machine exists

---

## Phase 3: User Story 1 — Toggle Mantener conexión viva + pulse (P1) 🎯 MVP

**Goal**: Operator enables keep-alive on a live connected env; remote heartbeat every 60s; OFF schedules nothing.

**Independent Test**: Connect live → toggle ON → lastPulseAt updates within ~90s; OFF → no heartbeat task.

### Tests

- [X] T008 [P] [US1] Cargo: keep-alive OFF does not start loop; ON starts interval in `src-tauri/src/session/keepalive.rs` tests (mock/time or start/stop flags)
- [X] T009 [P] [US1] Cargo: successful pulse clears failures and sets `last_pulse_at` in keepalive/health tests

### Implementation

- [X] T010 [US1] Implement `env_set_keep_alive` command (persist pref, start/stop task, reject demo) in `src-tauri/src/commands/connect.rs` and register in `src-tauri/src/lib.rs`
- [X] T011 [US1] Implement remote heartbeat primary path (read-only kube check via session client; optional token refresh near expiry) in `src-tauri/src/session/keepalive.rs` per [research.md](./research.md)
- [X] T012 [P] [US1] Add SSH `ServerAliveInterval` / `ServerAliveCountMax` for live tunnels in `src-tauri/src/ssh/tunnel.rs` (complement only)
- [X] T013 [US1] Wire keep-alive toggle UI (default OFF, live only) in `src/components/catalog/EnvTreeNav.tsx` calling `envSetKeepAlive` from `src/lib/ipc.ts`

**Checkpoint**: SC-001 / SC-002 / SC-006

---

## Phase 4: User Story 2 — Estado honesto de sesión (P1)

**Goal**: Show Conectado / Degradado / Desconectado + Último pulso; no toast spam on success.

**Independent Test**: 1–2 fails → Degradado; 3 fails → Desconectado; copy in Spanish.

### Tests

- [X] T014 [P] [US2] Cargo: failure counter 1–2 → degraded, ≥3 → disconnected in `src-tauri/src/session/keepalive.rs` (or health) tests per [contracts/connection-health.md](./contracts/connection-health.md)
- [X] T015 [P] [US2] Vitest: EnvTree (or harness) renders status labels + last pulse text in `tests/unit/session_keep_alive.spec.tsx`

### Implementation

- [X] T016 [US2] Apply fail/ok transitions inside heartbeat loop and emit `session-health` (or equivalent) from `src-tauri/src/session/keepalive.rs` / `connect.rs`
- [X] T017 [US2] Display status chip + “Último pulso…” in `src/components/catalog/EnvTreeNav.tsx` per [contracts/ui-keep-alive.md](./contracts/ui-keep-alive.md)
- [X] T018 [P] [US2] Poll/listen connection states while keep-alive ON or non-connected status visible (hook in `src/hooks/useConnectionHealth.ts` or existing workspace hook)

**Checkpoint**: SC-003 (status side) / SC-005

---

## Phase 5: User Story 3 — Reconectar (P2)

**Goal**: After disconnected (3 fails), offer Reconectar → `env_connect(instanceId)` without form; resume pulses if pref ON.

**Independent Test**: Force disconnected → Reconectar visible → connect restores; keep-alive ON resumes loop.

### Tests

- [X] T019 [P] [US3] Vitest: Reconectar button shown when status disconnected and invokes connect callback in `tests/unit/session_keep_alive.spec.tsx`

### Implementation

- [X] T020 [US3] On threshold disconnect: cleanup tunnel/client honestly and keep UI affordance for Reconectar in `src-tauri/src/session/keepalive.rs` / `connect.rs`
- [X] T021 [US3] Wire **Reconectar** to existing `envConnect(instanceId)` in `src/components/catalog/EnvTreeNav.tsx` (or MainShell) and restart keep-alive loop from persisted pref after success in `src-tauri/src/commands/connect.rs`

**Checkpoint**: SC-003 / SC-004

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T022 [P] Sync HU25 in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [X] T023 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [X] T024 Manual pass of [quickstart.md](./quickstart.md) (toggle, pulse, demo disabled, reconnect path)
- [X] T025 Security spot-check: heartbeat/logs omit PEM/tokens (SC-006 / constitution)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (runtime + IPC)
- **US1** after Foundational (toggle + pulse)
- **US2** after US1 heartbeat loop (or after T005/T006 for labels with mocked states)
- **US3** after US2 disconnected status
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Toggle + remote pulse |
| US2 | Status UI + fail streak |
| US3 | Reconectar on disconnected |

### Parallel Opportunities

- T001 ∥ T002  
- T004 ∥ T005  
- T008 ∥ T009  
- T012 ∥ T013 after T010  
- T014 ∥ T015  
- T022 ∥ T023  

---

## Parallel Example: US1

```text
Task: "env_set_keep_alive + keepalive kube pulse loop"
Task: "EnvTreeNav toggle Mantener conexión viva"
Task: "SSH ServerAliveInterval on live tunnel"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Foundational health + IPC  
2. Toggle + 60s kube heartbeat  
3. **STOP and VALIDATE** pulse updates  
4. US2 status → US3 Reconectar  

### Suggested MVP scope

**Foundational + US1 + US2** (toggle, pulse, honest status). US3 Reconectar completes the loop.

---

## Notes

- [P] = different files, no incomplete dependency  
- Never use localhost ping as primary heartbeat  
- Commit when user asks  
