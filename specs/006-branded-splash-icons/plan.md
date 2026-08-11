# Implementation Plan: Branded splash and app icons

**Branch**: `006-branded-splash-icons` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-branded-splash-icons/spec.md`

**Note**: Visual branding only. Preserves splash dwell from `005-ui-chrome-polish`. Optional wireframe review pre-hook skipped unless user runs it.

## Summary

Replace the CSS-gradient splash with the **branded lighthouse load image** (full-bleed, no duplicate centered title). Optional status/error text only **bottom-right**. Raise default window size to **1400×900**. Confirm packaging/OS icons use the **newly loaded** `src-tauri/icons` set.

## Technical Context

**Language/Version**: TypeScript · Rust/Tauri 2 config — no new languages

**Primary Dependencies**: Existing React SplashView · Vite static assets · Tauri `tauri.conf.json` window + bundle.icon

**Storage**: N/A (no new DB)

**Testing**: Vitest (splash DOM: no brand h1, bottom-right status class; conf asserts width/height ≥ IDE default; icon paths exist)

**Target Platform**: Desktop Faro (Windows primary)

**Project Type**: Desktop Tauri hybrid — branding + window geometry

**Performance Goals**: Splash image paints without white flash (dark `#0a192f` fallback); image from local bundle (no network)

**Constraints**: Constitution VI; keep 5s dwell; do not redesign artwork; custom TitleBar may be absent during splash (splash-only root is OK)

**Scale/Scope**: 3 P1 stories — SplashView + asset copy, tauri window size, icon bundle verification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/006-branded-splash-icons/spec.md` + this plan
- [x] Secrets: none
- [x] No exfiltration (VI): local image/icons only
- [x] Network: unchanged
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules: unchanged
- [x] Tests planned for splash layout + window size + icon path presence
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks

**Post-design re-check (Phase 1):** PASS — assets + UI/config only.

## Project Structure

### Documentation (this feature)

```text
specs/006-branded-splash-icons/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── splash-visual.md
│   └── window-icons.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/
├── load-page/load_page.png     # source splash artwork (already present)
├── icons/                      # new icon set (already present; verify bundle refs)
└── tauri.conf.json             # width/height 1400x900; bundle.icon paths

src/
├── assets/
│   └── splash-load.png         # NEW — copy/import of load_page for Vite frontend
├── views/
│   ├── SplashView.tsx          # image full-bleed; status bottom-right only
│   └── SplashView.css          # cover bg; remove brand/tagline overlay
└── App.tsx                     # unchanged dwell gate
```

**Structure Decision**: Copy splash into `src/assets/` (or `public/`) so Vite serves it; keep `src-tauri/load-page/` as canonical source if desired. Icons stay under `src-tauri/icons/` per Tauri bundle.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
