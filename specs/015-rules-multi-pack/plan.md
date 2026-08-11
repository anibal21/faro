# Implementation Plan: Multi-Pack Rules Engine

**Branch**: `015-rules-multi-pack` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-rules-multi-pack/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; findings panel + pack selector are small UI — wireframes optional.

## Summary

Replace the single hard-coded Spring Boot substring matcher with **local multi-pack rules** (`springboot` improved + `nodejs`), **auto-hint** from write-group text (+ optional `sourceHint`), and an analyze response that includes **`packId` used**. Keep click-to-analyze on Structured write-groups; no LLM. Honor explicit `rulePack` when the UI sends it; show pack name and allow override in the findings panel (US4).

## Technical Context

**Language/Version**: Rust rules engine · TypeScript/React findings UI · JSON rule packs under `rules/`

**Primary Dependencies**: Existing `analyze_write_group`, `rules/engine.rs`, `FindingPanel`, `LogWindow.handleAnalyze`, `include_str!` or filesystem load of packs

**Storage**: Optional light `analysis_history` (already); no new durable tables required for packs (shipped as assets)

**Testing**: Cargo unit tests (pack load, match, auto-hint routing, severity gating); Vitest FindingPanel pack label/select; fixtures for JVM NPE + Node error text

**Target Platform**: Desktop Faro

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Analyze &lt; ~100ms for typical write-group; truncate text &gt; ~64 KiB before match if needed

**Constraints**: Constitution IV (local rules, no generative AI); VI (no exfiltration); Spanish copy OK; read-only cluster

**Scale/Scope**: 2 packs MVP; matcher remains contains/simple patterns (not full regex engine unless cheap `regex` crate already acceptable — prefer contains + optional simple patterns in JSON)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/015-rules-multi-pack/spec.md` + this plan
- [x] Secrets: findings/history omit PEM/IAM/tokens
- [x] No exfiltration (VI): analysis fully local
- [x] Network: no AI/vendor calls for analyze
- [x] Read-only K8s: unchanged
- [x] Local rules analyzer (IV): strengthened multi-pack, still non-generative
- [x] Tests planned for Must-Have stories
- [x] Desktop demonstrable
- [x] AI4Devs docs sync (HU23) after tasks

**Post-design re-check (Phase 1):** PASS — no constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/015-rules-multi-pack/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analyze-api.md
│   ├── rule-packs.md
│   └── auto-hint.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
rules/
├── springboot/default.json     # enriched JVM/Spring pack
└── nodejs/default.json         # NEW second pack

src-tauri/src/rules/
├── engine.rs                   # load packs, analyze_with_pack, auto_hint
├── hint.rs                     # NEW or module in engine — stack hint
└── mod.rs

src-tauri/src/commands/analyze.rs   # honor rule_pack; return packId + findings

src/
├── lib/ipc.ts                  # AnalyzeResult { findings, packId, packDisplayName? }
├── views/LogWindow.tsx         # pass rulePack override; show pack in panel
└── components/analysis/FindingPanel.tsx  # pack label + select override
```

**Structure Decision**: Keep packs as repo JSON assets embedded at compile time (`include_str!`) for reliability offline; auto-hint pure Rust; UI only selects pack id.

## Complexity Tracking

> No constitution violations requiring justification.
