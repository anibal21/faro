# Tasks: Multi-Pack Rules Engine

**Input**: Design documents from `/specs/015-rules-multi-pack/`  
**Branch / feature**: `015-rules-multi-pack`  
**Decisions baked in**: Packs `springboot` + `nodejs` embedded; `match_contains` + optional `match_all_contains`; auto-hint scoring; analyze returns `{ findings, packId, packDisplayName }`; truncate 64 KiB; no LLM.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution + FR-011 — cargo + Vitest per Must-Have story; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (engine/pack load) → US1 (Spring pack) → US2 (Node pack + explicit pack) → US3 (auto-hint) → US4 (UI override) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/015-rules-multi-pack/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/rules/engine.rs`, `src-tauri/src/commands/analyze.rs`, `rules/springboot/default.json`, and `src/components/analysis/FindingPanel.tsx` against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Multi-pack loader + shared analyze types used by all stories

**⚠️ CRITICAL**: US1–US4 depend on pack registry and `AnalysisResult` shape

- [X] T003 Extend rule JSON schema (`id`, `displayName`, `match_all_contains`) and pack registry/load in `src-tauri/src/rules/engine.rs` per [contracts/rule-packs.md](./contracts/rule-packs.md) and [data-model.md](./data-model.md)
- [X] T004 [P] Add truncate-to-64KiB + severity sort helpers in `src-tauri/src/rules/engine.rs`
- [X] T005 Change `analyze_write_group` to return `{ findings, packId, packDisplayName }` and honor known `rule_pack` in `src-tauri/src/commands/analyze.rs` per [contracts/analyze-api.md](./contracts/analyze-api.md)
- [X] T006 [P] Update `src/lib/ipc.ts` `analyzeWriteGroup` / `AnalysisFinding` types for `AnalyzeResult`

**Checkpoint**: Engine can load ≥1 pack and IPC shape compiles

---

## Phase 3: User Story 1 — Richer Spring Boot pack (P1) 🎯 MVP

**Goal**: Demo/JVM NPE and common Spring errors yield useful findings; benign INFO has no critical false hits.

**Independent Test**: Demo NPE write-group → click → ≥1 finding; INFO-only → 0 critical.

### Tests

- [X] T007 [P] [US1] Cargo: NPE / SQL / generic ERROR gating fixtures in `src-tauri/src/rules/engine.rs` tests (or `tests` module)
- [X] T008 [P] [US1] Cargo: benign INFO yields no critical findings in `src-tauri/src/rules/engine.rs` tests

### Implementation

- [X] T009 [US1] Enrich `rules/springboot/default.json` (NPE, SQL, timeout, OOM, auth, gated generic ERROR) per [contracts/rule-packs.md](./contracts/rule-packs.md)
- [X] T010 [US1] Wire default pack id `springboot` when analyzing with that pack in `src-tauri/src/rules/engine.rs` / `analyze.rs`
- [X] T011 [P] [US1] Update empty-state copy in `src/components/analysis/FindingPanel.tsx` to not hardcode only “Spring Boot” once multi-pack lands (use pack display name when available)

**Checkpoint**: SC-001 / SC-004

---

## Phase 4: User Story 2 — Node pack + explicit pack selection (P1)

**Goal**: Second pack `nodejs` exists; explicit `rulePack` applies only that pack’s rules.

**Independent Test**: Node fixture + `rulePack=nodejs` → ≥1 finding; same text with Spring pack alone would miss Node-specific rule.

### Tests

- [X] T012 [P] [US2] Cargo: Node fixture matches `nodejs` pack and not covered by Spring-only needles in `src-tauri/src/rules/engine.rs` tests
- [X] T013 [P] [US2] Cargo: explicit `rule_pack` selects pack; unknown id falls back to `springboot` in `src-tauri/src/commands/analyze.rs` or engine tests

### Implementation

- [X] T014 [US2] Create `rules/nodejs/default.json` and embed/register in `src-tauri/src/rules/engine.rs` / `mod.rs`
- [X] T015 [US2] Ensure `analyze_with_pack(text, pack_id)` applies only that pack in `src-tauri/src/rules/engine.rs`

**Checkpoint**: SC-002

---

## Phase 5: User Story 3 — Auto-hint (P2)

**Goal**: Unset `rulePack` resolves via local markers to `springboot` or `nodejs`.

**Independent Test**: JVM text → springboot; Node text → nodejs; ambiguous → springboot default.

### Tests

- [X] T016 [P] [US3] Cargo: auto-hint routing table (JVM / Node / ambiguous) in `src-tauri/src/rules/hint.rs` or `engine.rs` tests per [contracts/auto-hint.md](./contracts/auto-hint.md)

### Implementation

- [X] T017 [US3] Implement `auto_hint(text, source_hint)` scoring in `src-tauri/src/rules/hint.rs` (or engine module)
- [X] T018 [US3] Call auto-hint from `analyze_write_group` when `rule_pack` absent in `src-tauri/src/commands/analyze.rs`
- [X] T019 [P] [US3] Export `mod hint` from `src-tauri/src/rules/mod.rs` if split

**Checkpoint**: SC-003

---

## Phase 6: User Story 4 — Show / override pack in UI (P3)

**Goal**: Findings panel shows pack used; operator can change pack and re-analyze.

**Independent Test**: After analyze, pack label visible; select Node → re-analyze → Node findings.

### Tests

- [X] T020 [P] [US4] Vitest: FindingPanel shows pack display name and select invokes callback in `tests/unit/finding_panel_pack.spec.tsx`

### Implementation

- [X] T021 [US4] Extend `FindingPanel` with pack label + pack `<select>` and empty-state using `packDisplayName` in `src/components/analysis/FindingPanel.tsx`
- [X] T022 [US4] Wire `LogWindow` analyze to pass optional `rulePack` override and store last `AnalyzeResult` in `src/views/LogWindow.tsx`
- [X] T023 [P] [US4] List available packs for UI (hardcoded ids or small IPC) — prefer constants aligned with engine in `src/lib/ipc.ts` / FindingPanel

**Checkpoint**: US4 acceptance

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T024 [P] Sync HU23 in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [X] T025 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [X] T026 Manual pass of [quickstart.md](./quickstart.md) (demo NPE + Node fixture + override)
- [X] T027 Security spot-check: findings/history omit PEM/IAM/tokens (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (schema + IPC result)
- **US1** after Foundational (MVP Spring)
- **US2** after Foundational (can parallel US1 after T003–T006)
- **US3** after US2 (needs both packs registered)
- **US4** after US3 (uses packId in UI; can start after T005 for types)
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Enriched springboot pack |
| US2 | Node pack + explicit selection |
| US3 | Auto-hint over both packs |
| US4 | UI depends on AnalyzeResult.packId |

### Parallel Opportunities

- T001 ∥ T002  
- T004 ∥ T006 after T003/T005 shape known  
- T007 ∥ T008  
- T012 ∥ T013  
- T016 ∥ T019  
- T024 ∥ T025  

---

## Parallel Example: US1

```text
Task: "enrich springboot/default.json + cargo NPE/INFO tests"
Task: "FindingPanel empty copy uses packDisplayName"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Foundational IPC/engine  
2. Enriched Spring pack + tests  
3. **STOP and VALIDATE** demo NPE  
4. Then US2 Node → US3 hint → US4 UI  

### Suggested MVP scope

**US1 + US2** (two packs + explicit pack); then US3 auto-hint; US4 polish UX.

---

## Notes

- [P] = different files, no incomplete dependency  
- No generative AI  
- Commit when user asks  
