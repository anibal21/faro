# Implementation Plan: UI chrome polish

**Branch**: `005-ui-chrome-polish` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-ui-chrome-polish/spec.md`

**Note**: Visual/UX polish on top of `004-pro-workspace-chrome`. Clarifications: top Ambientes menu only; left rail unchanged; custom window chrome; always confirm Desconectar todo.

## Summary

Raise UI text to **VS Code–like default workbench scale**; replace tree chevrons with **lucide Plus/Minus icons**; shrink top **Ambientes** to **Nuevo…** + **Desconectar todo** (always confirm); retitle left rail **Monitor** with **app version** footer; ship **undecorated custom title bar** themed with Temas; enforce **≥5s splash dwell** even when boot is ready early.

## Technical Context

**Language/Version**: TypeScript (ES2022+) · Rust (edition 2021) — minimal config change for window decorations

**Primary Dependencies**: Tauri 2 · React 19 · Vite · Tailwind / shadcn (existing) · **lucide-react** (Plus/Minus) · `@tauri-apps/api` (`getCurrentWindow`, `getVersion`)

**Storage**: Existing theme prefs; no new secret storage. Version is read-only from package/`getVersion()`

**Testing**: Vitest (menubar items, Monitor title, splash dwell timer mock, confirm-before-disconnect-all, plus/minus icons present) · manual theme + title-bar check on Windows

**Target Platform**: Desktop Faro (primary: Windows; decorations:false works cross-platform)

**Project Type**: Desktop application (Tauri hybrid) — chrome polish

**Performance Goals**: Splash gate is wall-clock only (no extra network); title-bar drag/minimize/maximize feel native; theme toggle updates chrome without remounting workspace tree data

**Constraints**: Constitution VI (version display is tool metadata, local only); left rail context menu **unchanged**; no credential UI changes; splash min 5s

**Scale/Scope**: 4 user stories; touch AppMenubar, EnvTreeNav, MainShell/App splash, theme CSS, `tauri.conf.json` decorations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: `specs/005-ui-chrome-polish/spec.md` + this plan
- [x] Secrets: unchanged; no PEM/keys in UI
- [x] No exfiltration (VI): version shown locally only; no third-party version check required
- [x] Network: unchanged
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules analyzer: unchanged
- [x] Tests planned for menubar, splash dwell, disconnect-all confirm, icons/title
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (`5`/`6`)

**Post-design re-check (Phase 1):** PASS — UI/config only; `getVersion` is local metadata.

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-chrome-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-chrome.md
│   └── splash-dwell.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
src-tauri/
└── tauri.conf.json          # decorations: false (custom chrome)

src/
├── components/
│   ├── chrome/
│   │   ├── AppMenubar.tsx   # Ambientes: Nuevo… + Desconectar todo (+ confirm)
│   │   └── TitleBar.tsx     # NEW — drag region + min/max/close, themed
│   ├── catalog/
│   │   └── EnvTreeNav.tsx   # title Monitor; Plus/Minus icons; version footer
│   └── ui/                  # existing Dialog for confirm
├── views/
│   ├── MainShell.tsx        # TitleBar + shell; wire disconnect-all
│   └── SplashView.tsx       # unchanged visuals; dwell owned in App
├── App.tsx                  # splash: max(ready, 5s) gate
├── hooks/
│   └── useTheme.ts          # already bridges .dark / data-theme → chrome
├── lib/
│   └── appVersion.ts        # NEW — getVersion() with fallback
└── index.css / styles/      # base font-size ~13px (VS Code workbench scale)
```

**Structure Decision**: Single Tauri app; no new packages beyond existing lucide + Tauri APIs.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Custom undecorated title bar | Spec FR-007 / clarify C | OS title bar theming alone — unreliable on Windows and fails “no classic OS title bar” |
