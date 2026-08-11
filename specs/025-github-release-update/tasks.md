# Tasks: GitHub Release Update Check

**Input**: Design documents from `/specs/025-github-release-update/`  
**Branch / feature**: `025-github-release-update`  
**Decisions baked in**: `tauri-plugin-updater` + `latest.json` on `anibal21/faro`; Windows NSIS install on accept; macOS/Linux info-only; reoffer every launch; Ayuda → Buscar actualizaciones…

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: REQUIRED (constitution) — Vitest for UI/menu/offer; cargo/unit for version helpers if any; manual quickstart Windows.

**Organization**: Setup → Foundational (updater plugin + feed) → US1–US4 → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm context and tooling

- [X] T001 Confirm agent context points at `specs/025-github-release-update/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory existing version helpers in `src/lib/appVersion.ts` and menubar Help in `src/components/chrome/AppMenubar.tsx`

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Updater plugin, config, ACL, CI feed shape — required before any US

**⚠️ CRITICAL**: No user story UI until check IPC works against a feed (real or mock)

- [X] T003 Add `tauri-plugin-updater` Rust + JS deps in `src-tauri/Cargo.toml` and `package.json`
- [X] T004 Configure `plugins.updater` endpoints + pubkey placeholders and `bundle.createUpdaterArtifacts` in `src-tauri/tauri.conf.json` per [contracts/github-release-feed.md](./contracts/github-release-feed.md)
- [X] T005 Register updater plugin + ACL permissions in `src-tauri/src/lib.rs` and `src-tauri/capabilities/default.json`
- [X] T006 [P] Document CI release steps for NSIS + `.sig` + `latest.json` upload in `.github/workflows/` (or `docs/` note referenced from `TESTING.md`)
- [X] T007 Implement `update_check` command wrapping updater check in `src-tauri/src/commands/update.rs` (+ wire in `lib.rs`) per [contracts/updater-ipc.md](./contracts/updater-ipc.md)
- [X] T008 [P] Expose FE types/helpers `updateCheck` / status mapping in `src/lib/ipc.ts` (or `src/lib/appUpdate.ts`)

**Checkpoint**: FE can call `update_check` and get upToDate / available / unavailable

---

## Phase 3: User Story 1 — Detectar versión nueva al abrir (P1) 🎯 MVP

**Goal**: Post-splash main workspace triggers non-blocking check; offer dialog if newer.

**Independent Test**: Lower installed version than feed → dialog after main; same version → no dialog; offline → no blocking error.

### Tests

- [X] T009 [P] [US1] Vitest: UpdateAvailableDialog shows current/available + Accept/Reject in `tests/unit/update_offer_ui.spec.tsx`
- [X] T010 [P] [US1] Vitest: startup hook invokes check once when ready in `tests/unit/use_app_update_check.spec.tsx`

### Implementation

- [X] T011 [US1] Create `UpdateAvailableDialog` in `src/components/update/UpdateAvailableDialog.tsx` per [contracts/update-check-ui.md](./contracts/update-check-ui.md)
- [X] T012 [US1] Implement `useAppUpdateCheck` (startup once after ready) in `src/hooks/useAppUpdateCheck.ts`
- [X] T013 [US1] Wire hook into `src/App.tsx` / `src/views/MainShell.tsx` after workspace ready (not during splash)
- [X] T014 [P] [US1] Style dialog consistently with existing dialogs in `src/components/update/` + CSS if needed

**Checkpoint**: US1 quickstart V1

---

## Phase 4: User Story 2 — Aceptar e instalar (Windows) (P1)

**Goal**: Accept downloads + launches NSIS for offered version only; failures leave prior install usable.

**Independent Test**: Accept on Windows mock/real feed → download progress → installer starts; cancel/fail → app still usable.

### Tests

- [X] T015 [P] [US2] Vitest: Accept calls `update_install` / install path once in `tests/unit/update_install_accept.spec.tsx`
- [X] T016 [P] [US2] Vitest: non-Windows `canInstall=false` disables install CTA in `tests/unit/update_offer_ui.spec.tsx`

### Implementation

- [X] T017 [US2] Implement `update_install` in `src-tauri/src/commands/update.rs` (Windows only; error mapping)
- [X] T018 [US2] FE: Accept → progress UI → invoke install; show FR-009 restart/installer messaging in `UpdateAvailableDialog` / hook
- [X] T019 [P] [US2] Ensure CREATE_NO_WINDOW / process spawn does not break NSIS UI (installer may show UAC) — document in command comments in `update.rs`

**Checkpoint**: US2 quickstart V2

---

## Phase 5: User Story 3 — Rechazar / reofrecer (P2)

**Goal**: Reject dismisses for session only; next cold start reoffers if still newer.

**Independent Test**: Reject → no loop in-session; relaunch → offer again.

### Tests

- [X] T020 [P] [US3] Vitest: reject sets session-dismissed; second startup check in same mock process does not re-open until flag cleared in `tests/unit/use_app_update_check.spec.tsx`

### Implementation

- [X] T021 [US3] Session-only dismiss flag in `src/hooks/useAppUpdateCheck.ts` (no persistent skip-list)
- [X] T022 [P] [US3] Reject/close handlers wire to dismiss without calling install in `UpdateAvailableDialog.tsx`

**Checkpoint**: US3 quickstart V1 step 4–5

---

## Phase 6: User Story 4 — Menú Buscar actualizaciones (P2)

**Goal**: Ayuda → Buscar actualizaciones… runs same check; up-to-date / error messaging for manual path.

**Independent Test**: Menu on outdated → offer; on latest → “al día”; offline → clear error.

### Tests

- [X] T023 [P] [US4] Vitest: menubar exposes Buscar actualizaciones and invokes callback in `tests/unit/app_menubar_check_updates.spec.tsx`

### Implementation

- [X] T024 [US4] Add menu item under Ayuda in `src/components/chrome/AppMenubar.tsx`
- [X] T025 [US4] Connect menu to `useAppUpdateCheck` manual trigger + up-to-date / error toasts in `MainShell.tsx` / `App.tsx`

**Checkpoint**: US4 quickstart V3

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T026 [P] Add TESTING.md section for 025 updater / latest.json / Windows accept path
- [X] T027 Run [quickstart.md](./quickstart.md) V1–V4 (manual Windows where possible)
- [X] T028 [P] Verify non-Windows path: informational only (`canInstall=false`) in dialog copy
- [X] T029 Mark all tasks complete after validation

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (T003–T008) → US1
- US2 depends on US1 dialog + foundational install command
- US3 depends on US1 offer/dismiss
- US4 depends on US1 check hook
- Polish last

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Foundational |
| US2 | US1 + T007/T017 |
| US3 | US1 |
| US4 | US1 |

### Parallel Opportunities

- T009 ∥ T010; T015 ∥ T016; T023 ∥ docs T026
- After foundational: US3/US4 UI can parallel with US2 backend if files split carefully

---

## Parallel Example: User Story 1

```text
Task: T009 Vitest update_offer_ui.spec.tsx
Task: T011 UpdateAvailableDialog.tsx
Task: T012 useAppUpdateCheck.ts
```

---

## Implementation Strategy

### MVP First

1. **Foundational** updater check IPC  
2. **US1** startup offer dialog  
3. **US2** Windows install  
4. **US3** + **US4** polish UX  

### Suggested MVP

**T001–T014** (check + dialog on startup) then T017–T018 (install).

### Notes

- Do not send user-domain data in updater requests (constitution VI)
- Private signing key only in CI secrets; pubkey in app config
- Reoffer-every-launch: no SQLite skip table in v1
