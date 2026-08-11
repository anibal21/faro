# Implementation Plan: Compact fixed windows

**Branch**: `007-compact-fixed-windows` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-compact-fixed-windows/spec.md`

**Note**: Revises 006 launch size (1400×900). Optional wireframe review pre-hook skipped unless user runs it.

## Summary

Use a **single main window** with two geometries: start as a **compact fixed splash** (**576×324**, 16:9), **centered**, **non-resizable**; on ready, **grow** to main default (**900×600**, clamped to work area if needed), **re-center**, then allow resize. Preserve branded splash + dwell from 005/006.

## Technical Context

**Language/Version**: TypeScript · Tauri 2 window APIs — no new languages

**Primary Dependencies**: `@tauri-apps/api` `getCurrentWindow`, `LogicalSize`; `tauri.conf.json` initial window; capability permissions for set-size / center / set-resizable

**Storage**: N/A

**Testing**: Vitest — conf splash defaults; geometry helper constants + clamp; E2E outline splash→main size transition; update 006 `window_geometry` asserts away from 1400×900

**Target Platform**: Desktop Faro (Windows primary)

**Project Type**: Desktop Tauri hybrid — window geometry lifecycle

**Performance Goals**: Splash→main size change before/with MainShell paint; no multi-second blank

**Constraints**: Constitution VI; keep dwell + splash art; supersede 1400×900; main must fit 1366×768-class work areas

**Scale/Scope**: 2 P1 stories — splash geometry + main geometry transition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/007-compact-fixed-windows/spec.md` + this plan
- [x] Secrets: none
- [x] No exfiltration (VI): local window APIs only
- [x] Network: unchanged
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules: unchanged
- [x] Tests planned for geometry conf + helper + transition outline
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU1 window note if needed)

**Post-design re-check (Phase 1):** PASS — config + window helper only.

## Project Structure

### Documentation (this feature)

```text
specs/007-compact-fixed-windows/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── window-geometry.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/
├── tauri.conf.json              # initial = splash size; center; resizable false
└── capabilities/default.json    # allow set-size, center, set-resizable, current-monitor

src/
├── lib/
│   └── windowGeometry.ts       # NEW — splash/main sizes, clamp, applySplash/applyMain
└── App.tsx                      # call applyMain() when phase → ready (keep dwell)

tests/
├── unit/window_geometry.spec.ts # UPDATE — splash conf + helper constants
└── e2e/compact_windows_flow.spec.ts
```

**Structure Decision**: Single-window resize/center lifecycle (not a second splash window). Constants + Tauri window APIs in `src/lib/windowGeometry.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
