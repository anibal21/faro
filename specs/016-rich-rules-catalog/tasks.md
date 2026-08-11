# Tasks: Rich Descriptive Rules Catalog

**Input**: Design documents from `/specs/016-rich-rules-catalog/`  
**Branch / feature**: `016-rich-rules-catalog`  
**Decisions baked in**: Rich rule schema + legacy fallback; `signalSnippet` literal extract; packs `springboot` / `liquibase` / `nodejs` / `react` / `python`; 5-way auto-hint; no LLM; incremental (schema+UI → Spring+Liquibase → Node+React+Python+hint).

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution + FR-016 — cargo + Vitest; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (rich schema + signal + IPC) → US1 (UI + snippet) → US2 (Spring + Liquibase) → US3 (Node/React/Python + hint) → US4 (override polish) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [X] T001 Confirm agent context points at `specs/016-rich-rules-catalog/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src-tauri/src/rules/engine.rs`, `hint.rs`, `commands/analyze.rs`, `rules/springboot/default.json`, `FindingPanel.tsx`, `AnalysisDrawer.tsx` against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rich finding model, signal extraction, AnalyzeResult extension — required by all stories

**⚠️ CRITICAL**: Complete before US1–US4

- [X] T003 Extend `RuleDef` / load path with `title`, `summary`, `why`, `what_to_look_for`, `tags`, and `recommendation` as string|list → `Vec<String>` plus legacy `explanation` fallback in `src-tauri/src/rules/engine.rs` per [contracts/rule-schema.md](./contracts/rule-schema.md)
- [X] T004 Extend `AnalysisFinding` wire shape (title, summary, why, whatToLookFor, recommendation[], tags) and map from rules in `src-tauri/src/rules/engine.rs`
- [X] T005 [P] Add `signalSnippet` to `AnalyzeResult` and wire through `analyze_with_pack` / `analyze_write_group` in `src-tauri/src/rules/engine.rs` and `src-tauri/src/commands/analyze.rs` per [contracts/analyze-result.md](./contracts/analyze-result.md)
- [X] T006 Implement `extract_signal_snippet` in `src-tauri/src/rules/signal.rs` and export from `src-tauri/src/rules/mod.rs` per [contracts/signal-snippet.md](./contracts/signal-snippet.md)
- [X] T007 [P] Update `src/lib/ipc.ts` types (`AnalysisFinding`, `AnalyzeResult.signalSnippet`) and keep `analyzeWriteGroup` returning the new shape
- [X] T008 Map rich finding `summary` + joined `recommendation` into light history insert in `src-tauri/src/commands/analyze.rs` / `src-tauri/src/db/analysis_history.rs` (no log body / no snippet persistence)

**Checkpoint**: Engine compiles; NPE fixture still matches with rich fields populated (even if pack copy not fully expanded yet)

---

## Phase 3: User Story 1 — Hallazgos descriptivos + señal del log (P1) 🎯 MVP

**Goal**: Panel shows title/summary/why/whatToLookFor/recommendations and “Señal en el log”.

**Independent Test**: Demo NPE click → rich finding + signal block; no network for analyze.

### Tests

- [X] T009 [P] [US1] Cargo: signal extract picks exception line + ≤2 frames in `src-tauri/src/rules/signal.rs` tests
- [X] T010 [P] [US1] Cargo: rich finding fields populated for Spring NPE via `analyze_with_pack` in `src-tauri/src/rules/engine.rs` tests
- [X] T011 [P] [US1] Vitest: panel/drawer shows title, summary, and “Señal en el log” in `tests/unit/finding_panel_rich.spec.tsx`

### Implementation

- [X] T012 [US1] Ensure at least core Spring rules used by demo expose rich Spanish fields (title/summary/why/whatToLookFor/recommendation list) in `rules/springboot/default.json`
- [X] T013 [US1] Render rich finding sections + signal block in `src/components/logs/AnalysisDrawer.tsx`
- [X] T014 [P] [US1] Mirror rich + signal UI in `src/components/analysis/FindingPanel.tsx`
- [X] T015 [US1] Pass `signalSnippet` from `AnalyzeResult` through `src/views/LogWindow.tsx` and `src/components/logs/LogWorkspace.tsx` into the drawer

**Checkpoint**: SC-001 / SC-005 (signal visible)

---

## Phase 4: User Story 2 — Catálogo Spring Boot + Liquibase (P1)

**Goal**: Enlarged Spring catalog + new Liquibase pack; INFO benign → no critical.

**Independent Test**: Spring NPE + Liquibase lock fixtures ≥1 useful finding each; INFO-only no critical.

### Tests

- [X] T016 [P] [US2] Cargo: Spring fixture yields specific (non-generic-only) finding in `src-tauri/src/rules/engine.rs` tests
- [X] T017 [P] [US2] Cargo: Liquibase lock/migration fixture matches `liquibase` pack in engine tests
- [X] T018 [P] [US2] Cargo: benign INFO has no critical findings in engine tests

### Implementation

- [X] T019 [US2] Expand `rules/springboot/default.json` to ~25–40 specific rich rules per [contracts/packs-catalog.md](./contracts/packs-catalog.md) (BeanCreation, Hikari/SQL, Security, timeouts, OOM/NPE, validation; generic ERROR info-only)
- [X] T020 [US2] Create `rules/liquibase/default.json` (8–12 rules: lock, checksum, migration failed, DATABASECHANGELOG*)
- [X] T021 [US2] Register `liquibase` pack in `src-tauri/src/rules/engine.rs` (`include_str!` + `pack_json` / `list_packs`)
- [X] T022 [P] [US2] Add `liquibase` to `RULE_PACKS` in `src/lib/ipc.ts`

**Checkpoint**: SC-002 (Liquibase) / SC-003

---

## Phase 5: User Story 3 — Node, React, Python + auto-hint (P2)

**Goal**: Three more packs at target volumes; five-way auto-hint.

**Independent Test**: One fixture each → ≥1 finding; hint routes correctly; unknown pack → springboot.

### Tests

- [X] T023 [P] [US3] Cargo: Node / React / Python fixtures match their packs in `src-tauri/src/rules/engine.rs` tests
- [X] T024 [P] [US3] Cargo: auto-hint routing table (5 packs + default + liquibase over generic JVM when markers win) in `src-tauri/src/rules/hint.rs` tests per [contracts/auto-hint.md](./contracts/auto-hint.md)

### Implementation

- [X] T025 [US3] Expand `rules/nodejs/default.json` to ~15–20 rich rules
- [X] T026 [P] [US3] Create `rules/react/default.json` (8–12 rich rules)
- [X] T027 [P] [US3] Create `rules/python/default.json` (15–20 rich rules)
- [X] T028 [US3] Register `react` + `python` (and ensure `nodejs`) in `src-tauri/src/rules/engine.rs`
- [X] T029 [US3] Implement five-pack scoring in `src-tauri/src/rules/hint.rs` per [research.md](./research.md) / [contracts/auto-hint.md](./contracts/auto-hint.md)
- [X] T030 [P] [US3] Extend `RULE_PACKS` with react + python in `src/lib/ipc.ts`

**Checkpoint**: SC-002 / SC-004

---

## Phase 6: User Story 4 — Override de pack con contenido rico (P3)

**Goal**: Pack selector re-analyzes; empty state names pack; rich layout preserved.

**Independent Test**: Switch pack A→B → findings/label update; empty cites pack name.

### Tests

- [X] T031 [P] [US4] Vitest: pack select invokes re-analyze callback and empty state uses `packDisplayName` in `tests/unit/finding_panel_rich.spec.tsx` (or `finding_panel_pack.spec.tsx`)

### Implementation

- [X] T032 [US4] Verify/fix pack override path in `src/views/LogWindow.tsx` + drawer select with all five packs and rich empty copy in `src/components/logs/AnalysisDrawer.tsx`

**Checkpoint**: US4 acceptance

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T033 [P] Sync HU24 in `5-historias-de-usuario.md` and ticket in `6-tickets-de-trabajo.md`
- [X] T034 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [X] T035 Manual pass of [quickstart.md](./quickstart.md) (Spring, Liquibase, Node, React, Python, INFO, override)
- [X] T036 Security spot-check: history omits PEM/tokens; snippet not persisted (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (schema + signal + IPC)
- **US1** after Foundational (MVP UI)
- **US2** after Foundational (can start after T003–T008; UI of US1 preferred first)
- **US3** after US2 packs registration pattern (needs engine pack registry + preferably US1 UI)
- **US4** after US1 (override + five packs from US2/US3)
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Rich UI + signal (needs foundational) |
| US2 | Catalog content Spring + Liquibase |
| US3 | Node/React/Python + hint (needs multi-pack registry) |
| US4 | Override polish on rich UI |

### Parallel Opportunities

- T001 ∥ T002  
- T005 ∥ T007 after T004 shape known  
- T009 ∥ T010 ∥ T011  
- T016 ∥ T017 ∥ T018  
- T026 ∥ T027  
- T023 ∥ T024  
- T033 ∥ T034  

---

## Parallel Example: US1

```text
Task: "signal.rs extract tests + engine rich NPE test"
Task: "AnalysisDrawer rich sections + FindingPanel mirror"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Foundational schema + signal + IPC  
2. US1 panel + demo Spring rich fields  
3. **STOP and VALIDATE** quickstart §1  
4. US2 catalogs → US3 packs/hint → US4 polish  

### Suggested MVP scope

**Foundational + US1** (descriptive findings + signal). Then US2 before claiming multi-tech catalog complete.

---

## Notes

- [P] = different files, no incomplete dependency  
- Rule volume ranges are orientative — prefer quality Spanish copy over hitting exact max  
- No generative AI  
- Commit when user asks  

