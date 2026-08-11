# Tasks: Chile Security Help

**Input**: Design documents from `/specs/022-chile-security-help/`  
**Branch / feature**: `022-chile-security-help`  
**Decisions baked in**: Extend `AppMenubar` with Ayuda → Seguridad; Radix Dialog; copy in `src/content/chileSecurity.ts`; no IPC/egress; FR-015 first-run deferred.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/help-seguridad-ui.md](./contracts/help-seguridad-ui.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED — Vitest asserts Ley 21.663 + Ley 21.719 (or 19.628) and absence of forbidden certification claims (FR-012 / US2).

**Organization**: Setup → Foundational (content module) → US1 (menú + diálogo) → US2 (lenguaje honesto) → US3 (baseline docs / no regresión) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1 / US2 / US3
- Include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and paths

- [X] T001 Confirm agent context points at `specs/022-chile-security-help/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src/components/chrome/AppMenubar.tsx`, `src/components/ui/dialog.tsx`, and `src/views/MainShell.tsx` against [plan.md](./plan.md) / [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Single source of truth for Chilean norms + Faro alignment copy (FR-011)

**⚠️ CRITICAL**: No US1–US3 UI until content module exists

- [X] T003 Create `src/content/chileSecurity.ts` exporting `SECURITY_DIALOG_TITLE`, `SECURITY_INTRO`, `CHILE_NORMS` (ids `ley-21663`, `anci-csirt`, `ley-19628`, `ley-21719`), `FARO_ALIGNMENT`, `SECURITY_CLOSE_LABEL` per [data-model.md](./data-model.md) and [contracts/help-seguridad-ui.md](./contracts/help-seguridad-ui.md)
- [X] T004 [P] Add `FORBIDDEN_SECURITY_CLAIMS` (or equivalent) string list in `src/content/chileSecurity.ts` for phrases banned by FR-010 / US2
- [X] T005 [P] Ensure intro/disclaimer in `src/content/chileSecurity.ts` states Faro facilitates compliance and formal SGSI/OIV duties remain with the organization

**Checkpoint**: Content module compile-ready; norms + alignment complete; no UI yet required

---

## Phase 3: User Story 1 — Consultar seguridad y marco normativo (P1) 🎯 MVP

**Goal**: Ayuda → Seguridad opens in-app dialog with intro, four norms, Cómo Faro se alinea, Entendido; works without live session.

**Independent Test**: MainShell → Ayuda → Seguridad → dialog shows norms + alignment → Entendido closes; works disconnected.

### Tests

- [X] T006 [P] [US1] Vitest FR-012: render security content/dialog open and assert mentions of `21.663` and (`21.719` or `19.628`) in `tests/unit/chile_security_help.spec.tsx`
- [X] T007 [P] [US1] Vitest: assert all four norm ids/names from `CHILE_NORMS` appear when dialog is open in `tests/unit/chile_security_help.spec.tsx`

### Implementation

- [X] T008 [US1] Implement `SecurityDialog` (open/onOpenChange, title, intro, norm list, alignment section, Entendido) in `src/components/help/SecurityDialog.tsx` using `src/components/ui/dialog.tsx` and `src/content/chileSecurity.ts`
- [X] T009 [P] [US1] Add scrollable/dense styles if needed in `src/components/help/SecurityDialog.css` matching existing modal density
- [X] T010 [US1] Extend `AppMenubar` with menu **Ayuda** and first item **Seguridad** calling `onOpenSecurity` (or equivalent) in `src/components/chrome/AppMenubar.tsx`
- [X] T011 [US1] Wire `securityDialogOpen` state + `SecurityDialog` in `src/views/MainShell.tsx` (no dependency on connection/live)

**Checkpoint**: SC-001 / SC-002 / SC-004 / FR-001–FR-009 path for Must UI

---

## Phase 4: User Story 2 — Lenguaje honesto, sin certificaciones inventadas (P1)

**Goal**: Copy never claims ANCI certification or automatic OIV/21.663 compliance; disclaimer remains visible.

**Independent Test**: Review/test dialog text — forbidden phrases absent; org-responsibility language present.

### Tests

- [X] T012 [P] [US2] Vitest: rendered Seguridad body contains none of `FORBIDDEN_SECURITY_CLAIMS` in `tests/unit/chile_security_help.spec.tsx`
- [X] T013 [P] [US2] Vitest: intro/disclaimer asserts organizational responsibility language (e.g. SGSI / organización / responsabilidad) in `tests/unit/chile_security_help.spec.tsx`

### Implementation

- [X] T014 [US2] Review and harden Spanish copy in `src/content/chileSecurity.ts` so descriptions never imply Faro is ANCI-certified or auto-compliant as OIV (FR-010)
- [X] T015 [P] [US2] Confirm `SecurityDialog` renders intro + disclaimer without rewriting claims in `src/components/help/SecurityDialog.tsx`

**Checkpoint**: SC-003 / US2 acceptance

---

## Phase 5: User Story 3 — Baseline Chile documentado sin romper el producto (P2)

**Goal**: Document baseline (facilita cumplimiento; no sustituye SGSI); no new network; no regression to main flow/keep-alive.

**Independent Test**: Docs note present; opening Seguridad adds no fetch/invoke; Ambientes/Temas/keep-alive still work.

### Tests

- [X] T016 [P] [US3] Vitest or static assert: `SecurityDialog` / open path does not call `invoke` or `fetch` (spy or code review assertion) in `tests/unit/chile_security_help.spec.tsx`

### Implementation

- [X] T017 [US3] Add short baseline note to AI4Devs docs (e.g. HU/ticket bullet in `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md`) stating Help → Seguridad + Chile alignment without SGSI substitution (FR-013)
- [X] T018 [P] [US3] Smoke-check menubar Ambientes/Temas still work after Ayuda addition in `src/components/chrome/AppMenubar.tsx` (no behavior regression)
- [X] T019 [P] [US3] Confirm no keep-alive/IPC files changed for this feature (or revert accidental edits) under `src/hooks/useConnectionHealth.ts` / `src-tauri/src/keepalive.rs`

**Checkpoint**: FR-013 / FR-014 / SC-006; US3 done

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and optional deferrals

- [X] T020 Run [quickstart.md](./quickstart.md) manual V1–V3 against `npm run tauri dev`
- [X] T021 [P] Run `npx vitest run tests/unit/chile_security_help.spec.tsx` and fix failures
- [X] T022 [P] Mark FR-015 first-run notice as deferred in `specs/022-chile-security-help/spec.md` Assumptions or plan note (no implementation unless time permits)
- [X] T023 Sync optional one-line mention in `prompts.md` or product index only if the repo convention requires it after Help features

**Checkpoint**: Feature demo-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **blocks** US1–US3
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After content + dialog exist (can overlap late US1 once `chileSecurity.ts` + dialog render)
- **US3 (Phase 5)**: After US1 menubar wired; docs can start in parallel with US2
- **Polish (Phase 6)**: After US1–US3 Must complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 content module only
- **US2 (P1)**: Depends on content module + rendered dialog (US1 T008+)
- **US3 (P2)**: Depends on US1 chrome integration; docs [P] with US2 tests

### Parallel Opportunities

- T001 ∥ T002 (setup)
- T003 then T004 ∥ T005 (foundational copy)
- T006 ∥ T007 (US1 tests)
- T009 ∥ T010 after T008 skeleton (CSS vs menubar props) — prefer T008 before T011
- T012 ∥ T013 (US2 tests)
- T017 ∥ T018 ∥ T019 (US3)
- T021 ∥ T022 (polish)

---

## Parallel Example: User Story 1

```text
# After T003–T005:
Task: T006 Vitest norms 21.663 + 21.719/19.628 in tests/unit/chile_security_help.spec.tsx
Task: T007 Vitest all four CHILE_NORMS when dialog open in tests/unit/chile_security_help.spec.tsx

# Then implementation:
Task: T008 SecurityDialog in src/components/help/SecurityDialog.tsx
Task: T009 SecurityDialog.css
Task: T010 AppMenubar Ayuda → Seguridad
Task: T011 MainShell wire dialog state
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 `chileSecurity.ts`  
3. Phase 3 dialog + Ayuda menu + tests  
4. **STOP**: Validate quickstart V1  

### Incremental Delivery

1. MVP = Ayuda → Seguridad usable  
2. US2 = harden copy + forbidden-claim tests  
3. US3 = docs + no-regression checks  
4. Polish = quickstart + vitest green  

### Suggested MVP scope

**T001–T011** (Setup + Foundational + US1). US2/US3 before calling the feature complete for evaluators.

---

## Notes

- No new Tauri commands or capabilities for this feature
- Do not add official external links in v1 unless trivial and payload-free (research R3 default: none)
- FR-015 first-run notice explicitly deferred (T022)
- Avoid editing keep-alive / connect paths
