# Implementation Plan: Keep-Alive Toggle Chrome & Desktop Overscroll

**Branch**: `018-keepalive-toggle-chrome` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-keepalive-toggle-chrome/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; scope is menu copy + CSS chrome — wireframes optional.

## Summary

Polish **017 keep-alive UX**: (1) **default ON** for live connect when no explicit OFF preference exists; (2) menu label is the **next action** — ON → **No mantener conexión viva**, OFF → **Mantener conexión viva** — and every click must toggle + refresh UI; (3) disable **root overscroll / pull-to-refresh bounce** so Faro feels like a desktop app while keeping panel scroll.

## Technical Context

**Language/Version**: Rust (connect + prefs default) · TypeScript/React (EnvTreeNav menu + global CSS)

**Primary Dependencies**: Existing `env_set_keep_alive`, `get_keepalive_pref` / `set_keepalive_pref`, `useConnectionHealth`, Radix `ContextMenuItem`, global styles (`index.css` / shell)

**Storage**: Same `ui_preferences` key `keepalive.<instanceId>`; **missing key ⇒ effective ON** (change from 017’s missing⇒OFF)

**Testing**: Cargo: default-when-missing preference; Vitest: action labels + toggle updates; CSS/overscroll smoke via unit or manual quickstart

**Target Platform**: Desktop Faro (Windows WebView2 primary)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Menu label flip ≤1s after click (SC-002); no shell jank

**Constraints**: Constitution unchanged; demo still excluded; pulse interval/threshold from 017 unchanged

**Scale/Scope**: Small delta on 017 + global overscroll CSS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/018-keepalive-toggle-chrome/spec.md` + this plan
- [x] Secrets: no change to credential handling
- [x] No exfiltration (VI): keep-alive traffic still user bastion/EKS only
- [x] Network: unchanged
- [x] Read-only K8s: pulse unchanged from 017
- [x] Local rules analyzer: N/A
- [x] Tests planned for Must-Have (US1 + overscroll verification)
- [x] Desktop demonstrable
- [x] AI4Devs docs: note HU25 delta / small ticket note after tasks if needed

**Post-design re-check (Phase 1):** PASS — no constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/018-keepalive-toggle-chrome/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── keep-alive-toggle-ui.md
│   └── desktop-overscroll.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # via /speckit-tasks
```

### Source Code (repository root)

```text
src-tauri/src/
├── db/workspace.rs          # missing keepalive pref → default true (Option or helper)
└── commands/connect.rs      # want_keepalive uses new default; optionally persist true on first live connect

src/
├── components/catalog/EnvTreeNav.tsx   # action labels; reliable toggle + optimistic/refresh
├── hooks/useConnectionHealth.ts        # ensure setKeepAlive refreshes / error surface
├── index.css / styles/theme.css        # overscroll-behavior on html, body, #root
└── views/MainShell.css                 # shell overflow containment if needed

tests/unit/
└── session_keep_alive.spec.tsx         # extend: default labels, toggle flip, click effect
```

**Structure Decision**: Prefer preference-layer default + UI label fix; overscroll via CSS (`overscroll-behavior: none`) on document roots — no new Tauri plugins unless CSS alone fails on WebView2.

## Complexity Tracking

> No constitution violations requiring justification.
