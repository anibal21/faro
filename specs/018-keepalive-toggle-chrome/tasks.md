# Tasks: Keep-Alive Toggle Chrome & Desktop Overscroll

**Input**: Design documents from `/specs/018-keepalive-toggle-chrome/`  
**Branch / feature**: `018-keepalive-toggle-chrome`  
**Decisions baked in**: Missing keepalive pref ⇒ ON; menu label = next action; fix no-op click via refresh/optimistic UI; root `overscroll-behavior: none` (panel scroll kept). Builds on 017.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — cargo preference default + Vitest label/toggle; overscroll CSS asserted or quickstart manual.

**Organization**: Setup → Foundational (pref default) → US1 (toggle UX) → US2 (overscroll) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/018-keepalive-toggle-chrome/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/db/workspace.rs`, `src-tauri/src/commands/connect.rs`, `src/components/catalog/EnvTreeNav.tsx`, `src/hooks/useConnectionHealth.ts`, and `src/index.css` against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Preference default ON when key missing — required before connect/UI stories

**⚠️ CRITICAL**: Complete before US1–US2

- [X] T003 Change keepalive preference read so **missing key ⇒ true** in `src-tauri/src/db/workspace.rs` per [data-model.md](./data-model.md) (keep explicit `"false"` as OFF)
- [X] T004 Update live `env_connect` `want_keepalive` path in `src-tauri/src/commands/connect.rs` to use the new default and start keep-alive loop for live when effective ON; optionally persist `"true"` on first connect when missing
- [X] T005 [P] Cargo tests: missing pref → true; explicit false → false in `src-tauri/src/db/workspace.rs` (or adjacent test module)

**Checkpoint**: Connect without prior pref starts keep-alive for live

---

## Phase 3: User Story 1 — Toggle keep-alive con etiqueta de acción clara (P1) 🎯 MVP

**Goal**: Action-oriented Spanish labels; click always toggles + visible UI update; demo still excluded.

**Independent Test**: Connect live → menu **No mantener conexión viva** → click → **Mantener conexión viva** and pulses stop; click again → reverse.

### Tests

- [X] T006 [P] [US1] Vitest: connected + `keepAlive: true` shows **No mantener conexión viva** in `tests/unit/session_keep_alive.spec.tsx`
- [X] T007 [P] [US1] Vitest: click toggles callback/`keepAlive` and flipped label appears in `tests/unit/session_keep_alive.spec.tsx`

### Implementation

- [X] T008 [US1] Update menu labels to action-oriented copy in `src/components/catalog/EnvTreeNav.tsx` per [contracts/keep-alive-toggle-ui.md](./contracts/keep-alive-toggle-ui.md)
- [X] T009 [US1] Ensure toggle invokes `envSetKeepAlive` with `!keepAlive`, optimistic/`refresh` update, and error surfacing in `src/hooks/useConnectionHealth.ts` and/or `src/views/MainShell.tsx` / `EnvTreeNav.tsx` so click is never a no-op
- [X] T010 [P] [US1] After connect with keep-alive ON, ensure health poll/event reflects `keepAlive: true` promptly via `src/hooks/useConnectionHealth.ts` / `MainShell.tsx`

**Checkpoint**: SC-001 / SC-002 / SC-005

---

## Phase 4: User Story 2 — Sensación de app de escritorio (sin tirón/pull) (P1)

**Goal**: No root overscroll/pull-to-refresh bounce; inner panels still scroll.

**Independent Test**: Pull past top of shell → no elastic whole-app move; long logs still scroll inside pane.

### Tests

- [X] T011 [P] [US2] Vitest or CSS unit assert: root/shell styles include `overscroll-behavior` none (e.g. read computed class / stylesheet contract) in `tests/unit/desktop_overscroll.spec.ts` (or extend an existing chrome style test)

### Implementation

- [X] T012 [US2] Apply `overscroll-behavior: none` (+ root `overflow: hidden` / height as needed) on `html`, `body`, `#root` in `src/index.css` (and `src/styles/theme.css` if required) per [contracts/desktop-overscroll.md](./contracts/desktop-overscroll.md)
- [X] T013 [P] [US2] Confirm `.main-shell` / panel scroll regions keep usable `overflow: auto` in `src/views/MainShell.css` / `src/styles/workspace.css` without reintroducing root bounce

**Checkpoint**: SC-004

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T014 [P] Note 018 polish under HU25 (or short ticket note) in `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md`
- [X] T015 [P] Run `npx vitest run tests/unit/session_keep_alive.spec.tsx` (+ overscroll test) and `cargo test --manifest-path src-tauri/Cargo.toml` for pref/keepalive
- [X] T016 Manual pass of [quickstart.md](./quickstart.md) (default ON label, toggle flip, overscroll)
- [X] T017 Security/behavior spot-check: demo still cannot enable keep-alive; no PEM/token logging (unchanged from 017)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (pref default)
- **US1** after Foundational (labels + toggle)
- **US2** after Setup (can parallel US1 once Foundational done — different files)
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Pref default + menu action labels + reliable toggle |
| US2 | Independent CSS chrome; no dependency on US1 runtime |

### Parallel Opportunities

- T001 ∥ T002  
- T005 after T003  
- T006 ∥ T007  
- T012 ∥ T013 after T011 optional  
- US1 ∥ US2 after Phase 2  
- T014 ∥ T015  

---

## Parallel Example: US1

```text
Task: "Vitest action labels + toggle flip"
Task: "EnvTreeNav No mantener / Mantener copy"
Task: "useConnectionHealth optimistic refresh"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Foundational missing-pref ⇒ ON  
2. Labels + working toggle  
3. **STOP and VALIDATE** menu flip  
4. US2 overscroll  

### Suggested MVP scope

**Foundational + US1**; US2 is small and should ship in the same implement pass.

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not change 017 pulse interval or failure threshold  
- Commit when user asks  
