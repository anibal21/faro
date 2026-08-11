# Tasks: Fix Keep-Alive Off & Drop Pulse Line

**Input**: Design documents from `/specs/019-fix-keepalive-off/`  
**Branch / feature**: `019-fix-keepalive-off`  
**Decisions baked in**: Authoritative stop + emit `keepAlive: false`; OFF pref sticks on reconnect; remove Último pulso; show Keep-alive ON|OFF. Builds on 017/018.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — cargo stop/OFF; Vitest OFF sticks + no pulse text.

**Organization**: Setup → Foundational (Rust stop/emit) → US1 (OFF sticks end-to-end) → US2 (remove pulse UI) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/019-fix-keepalive-off/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/keepalive.rs`, `src-tauri/src/commands/connect.rs`, `src/hooks/useConnectionHealth.ts`, `src/components/catalog/EnvTreeNav.tsx`, and `src/lib/ipc.ts` against [plan.md](./plan.md) / [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make disable authoritative in Rust — required before UI can stay OFF

**⚠️ CRITICAL**: Complete before US1–US2

- [X] T003 Harden `stop_loop` in `src-tauri/src/keepalive.rs`: reliable runtime access, cancel flag, set `health.keep_alive = false` (no silent no-op)
- [X] T004 Emit `session-health` with `keepAlive: false` on disable from `src-tauri/src/keepalive.rs` and/or `env_set_keep_alive(false)` in `src-tauri/src/commands/connect.rs` per [contracts/keep-alive-off.md](./contracts/keep-alive-off.md)
- [X] T005 [P] After pulse work in `src-tauri/src/keepalive.rs`, re-check cancel/`keep_alive` before emitting an ON health event (never set `keep_alive = true` outside `start_loop`)
- [X] T006 [P] Cargo tests: disable/stop leaves `keep_alive` false (and related invariants) in `src-tauri/src/keepalive.rs` tests

**Checkpoint**: Runtime OFF is trustworthy after `env_set_keep_alive(false)`

---

## Phase 3: User Story 1 — Apagar keep-alive de verdad (P1) 🎯 MVP

**Goal**: Menu OFF sticks in UI + pref; reconnect does not resurrect ON; ON still works.

**Independent Test**: ON → No mantener… → Keep-alive OFF + Mantener…; wait one pulse cycle → still OFF; reconnect → still OFF.

### Tests

- [X] T007 [P] [US1] Vitest: with `keepAlive: false`, menu shows **Mantener conexión viva** and chrome shows OFF (not stuck ON) in `tests/unit/session_keep_alive.spec.tsx`
- [X] T008 [P] [US1] Vitest: selecting No mantener invokes callback with `enabled: false` in `tests/unit/session_keep_alive.spec.tsx`

### Implementation

- [X] T009 [US1] Verify/fix `envSetKeepAlive` IPC so `enabled: false` is sent correctly in `src/lib/ipc.ts`
- [X] T010 [US1] Harden `setKeepAlive` / `session-health` merge in `src/hooks/useConnectionHealth.ts` so OFF is not overwritten by stale ON without matching runtime true
- [X] T011 [US1] Fix EnvTree toggle default (avoid `?? true` masking OFF) and show explicit Keep-alive ON|OFF in `src/components/catalog/EnvTreeNav.tsx`
- [X] T012 [P] [US1] Confirm live reconnect with pref `"false"` does not start loop in `src-tauri/src/commands/connect.rs` (regression guard / test if practical)

**Checkpoint**: SC-001 / SC-002 / SC-004

---

## Phase 4: User Story 2 — Quitar “Último pulso” (P1)

**Goal**: No último-pulso text in env chrome; keep-alive state text remains.

**Independent Test**: Connected ON or OFF → no “Último pulso” / “hace Ns” in tree.

### Tests

- [X] T013 [P] [US2] Vitest: status chrome must not contain `/Último pulso/i` when health has `lastPulseAt` in `tests/unit/session_keep_alive.spec.tsx`

### Implementation

- [X] T014 [US2] Remove `pulseLabel` rendering (and unused helpers) from `src/components/catalog/EnvTreeNav.tsx` per [contracts/ui-no-pulse.md](./contracts/ui-no-pulse.md)
- [X] T015 [P] [US2] Drop unused `pulseLabel` export/helpers from `src/hooks/useConnectionHealth.ts` if nothing else needs them

**Checkpoint**: SC-003

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T016 [P] Note 019 fix under HU25 in `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md`
- [X] T017 [P] Run `cargo test --manifest-path src-tauri/Cargo.toml` (keepalive) and `npx vitest run tests/unit/session_keep_alive.spec.tsx`
- [X] T018 Manual pass of [quickstart.md](./quickstart.md) (OFF sticks, no pulse line, ON still works)
- [X] T019 Spot-check: demo still cannot toggle keep-alive; no PEM/token logging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (Rust stop/emit)
- **US1** after Foundational
- **US2** can start after Setup (UI-only) but prefer after US1 label/chrome work to avoid EnvTreeNav conflicts — sequential on same file
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Needs Foundational stop/emit |
| US2 | Same `EnvTreeNav.tsx` as US1 — do after T011 or combine carefully |

### Parallel Opportunities

- T001 ∥ T002  
- T005 ∥ T006 after T003  
- T007 ∥ T008  
- T009 ∥ T012  
- T013 before/with T014  
- T016 ∥ T017  

---

## Parallel Example: US1

```text
Task: "Vitest OFF menu + callback false"
Task: "IPC enabled:false + useConnectionHealth merge"
Task: "EnvTree Keep-alive ON|OFF + toggle default"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Foundational Rust stop + emit OFF  
2. UI/IPC sync so OFF sticks  
3. **STOP and VALIDATE**  
4. US2 remove pulse text  

### Suggested MVP scope

**Foundational + US1**; ship **US2** in the same implement pass (tiny).

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not change pulse interval / failure threshold  
- Commit when user asks  
