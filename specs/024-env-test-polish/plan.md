# Implementation Plan: Env Test Polish

**Branch**: `024-env-test-polish` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-env-test-polish/spec.md`

**Note**: Optional wireframe pre-hook skipped — small UI/data polish; contracts cover behavior.

## Summary

Four delivery polish items: (1) single cross-theme palette of 10 bright metallic env colors; (2) loading/connecting with test fixtures hydrates demo catalog data **into that environment** so multi-env test works; (3) fix “Pegar al final” checkbox+label as a right-aligned compact group; (4) show RAM/CPU/Uptime in workload strip only when values exist.

## Technical Context

**Language/Version**: TypeScript/React · Rust (connect/catalog/metrics) · CSS variables

**Primary Dependencies**: `envColors.ts`, `index.css` theme tokens, `connect.rs` / `hydrate_demo_catalog`, `WorkloadSummaryStrip`, `LogWindow` toolbar

**Storage**: Possibly a boolean/flag on connection or connect-mode detection via fixture paths; no new secrets

**Testing**: Vitest for colors (light===dark), checkbox layout class, summary strip conditional; cargo if connect-mode/fixture hydrate changes

**Target Platform**: Desktop Faro

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: N/A (UI/data path)

**Constraints**: Keep 10 color slots; keep multi-session identity from 023; constitution unchanged

**Scale/Scope**: Narrow polish across 4 independent stories

## Constitution Check

- [x] Spec-driven: `specs/024-env-test-polish/spec.md` + this plan
- [x] Secrets / no exfiltration / read-only: unchanged
- [x] Tests planned for Must stories
- [x] Desktop demonstrable
- [x] Docs note optional after tasks

**Post-design re-check:** PASS.

## Project Structure

### Documentation

```text
specs/024-env-test-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── env-colors-fixed.md
│   ├── fixture-env-hydrate.md
│   ├── stick-to-bottom-layout.md
│   └── workload-metrics-visibility.md
└── tasks.md
```

### Source Code

```text
src/lib/envColors.ts                 # single hex per index (no light/dark split)
src/index.css / theme.css            # --env-color-N identical in :root and .dark
src-tauri/src/commands/connect.rs    # fixture/test connect → Demo hydrate for that instanceId
src-tauri/src/k8s/catalog.rs         # hydrate_demo_catalog(instance_id) already keyed
src/views/LogWindow.tsx              # Pegar al final group layout
src/components/logs/WorkloadSummaryStrip.tsx  # conditional RAM/CPU/Uptime
tests/unit/env_colors_fixed.spec.ts
tests/unit/workload_summary_visibility.spec.tsx
tests/unit/stick_to_bottom_layout.spec.tsx
```

**Structure Decision**: Unify color tokens in TS + CSS. Treat “fixtures de prueba” connect as `ConnectMode::Demo` (or equivalent) when env is builtin demo **or** explicitly marked / detected as test-fixture profile, calling `hydrate_demo_catalog` for that `instance_id`. UI fixes are CSS/markup only.

## Complexity Tracking

> No constitution violations.
