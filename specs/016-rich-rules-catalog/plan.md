# Implementation Plan: Rich Descriptive Rules Catalog

**Branch**: `016-rich-rules-catalog` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-rich-rules-catalog/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; findings-panel enrichment is incremental UI — wireframes optional.

## Summary

Extend the **015 multi-pack local rules engine** so findings are **descriptive** (title / summary / why / whatToLookFor / recommendation steps), extract a literal **signal snippet** from the write-group, ship **five packs** (springboot enlarged, liquibase, nodejs enlarged, react, python) with Spanish ops copy, and widen **auto-hint** scoring across those packs. No LLM, no network for analyze. Incremental slices: (1) schema+UI+snippet → (2) springboot+liquibase → (3) nodejs+react+python+hint.

## Technical Context

**Language/Version**: Rust (Tauri commands / rules engine) · TypeScript/React (FindingPanel / AnalysisDrawer)

**Primary Dependencies**: Existing `analyze_write_group`, `rules/engine.rs`, `rules/hint.rs`, embedded JSON via `include_str!`, Vitest + cargo test

**Storage**: Light `analysis_finding_history` unchanged in spirit (metadata summaries only — map rich fields to explanation/recommendation summaries; never store full log body or secrets)

**Testing**: Cargo fixtures per pack + hint routing + INFO gating; Vitest panel (title/summary/snippet/override); quickstart manual per technology

**Target Platform**: Desktop Faro (Win/macOS/Linux)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Analyze typical write-group &lt; ~100ms; truncate input at 64 KiB (unchanged)

**Constraints**: Constitution IV/VI (local rules only, no generative AI, no exfiltration); read-only cluster; Spanish copy; no mutate-from-Faro recommendations

**Scale/Scope**: 5 packs; ~25–40 / 8–12 / 15–20 / 8–12 / 15–20 rules (orientative); matcher remains contains OR + optional AND (no full regex engine required)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/016-rich-rules-catalog/spec.md` + this plan
- [x] Secrets: findings/history omit PEM/IAM/tokens; signal snippet is truncated log excerpt only (no credential scraping)
- [x] No exfiltration (VI): analysis fully local
- [x] Network: no AI/vendor calls for analyze
- [x] Read-only K8s: unchanged
- [x] Local rules analyzer (IV): enriched catalogs, still non-generative
- [x] Tests planned for Must-Have stories (US1–US3; US4 covered with panel override)
- [x] Desktop demonstrable
- [x] AI4Devs docs sync (HU24) after tasks

**Post-design re-check (Phase 1):** PASS — no constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/016-rich-rules-catalog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analyze-result.md
│   ├── rule-schema.md
│   ├── packs-catalog.md
│   ├── signal-snippet.md
│   └── auto-hint.md
├── checklists/
│   └── requirements.md
└── tasks.md                  # via /speckit-tasks
```

### Source Code (repository root)

```text
rules/
├── springboot/default.json   # enriched 25–40 rich rules
├── liquibase/default.json    # NEW
├── nodejs/default.json       # enriched 15–20
├── react/default.json        # NEW
└── python/default.json       # NEW

src-tauri/src/rules/
├── engine.rs                 # rich RuleDef + AnalyzeResult.signal_snippet; register packs
├── hint.rs                   # 5-way scoring
├── signal.rs                 # NEW — extract signal snippet
└── mod.rs

src-tauri/src/commands/analyze.rs
src-tauri/src/db/analysis_history.rs   # map summary → explanation_summary

src/lib/ipc.ts                # rich AnalysisFinding + signalSnippet; RULE_PACKS ×5
src/components/analysis/FindingPanel.tsx
src/components/logs/AnalysisDrawer.tsx
src/views/LogWindow.tsx
src/components/logs/LogWorkspace.tsx

tests/unit/finding_panel_rich.spec.tsx
src-tauri … engine/hint/signal tests
```

**Structure Decision**: Keep packs as compile-time `include_str!` assets; add `signal.rs` for extraction; extend serde models with optional rich fields + legacy fallback (`explanation` → `summary`).

## Complexity Tracking

> No constitution violations requiring justification.
