# Implementation Plan: Professional workspace chrome

**Branch**: `004-pro-workspace-chrome` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-pro-workspace-chrome/spec.md`

**Note**: Platform UI chrome + density pass. Depends on / absorbs env-tree UX from `003-env-tree-nav` (fixed left tree, multi-connect, context menus). Wireframes for 004 SHOULD be generated before implement.

## Summary

Adopt **shadcn/ui + Tailwind CSS** across Faro for a dense, professional desktop look. Replace the bulky top header with a **Menubar**: **Ambientes** | **Temas**. Left environment nav stays **fixed**; **logs use full remaining width**; **analysis/findings** move into a **foldable, closable, vertically resizable panel below logs**. Tree selection hits **label text only**; environment context menu adds **Editar configuración**. Compact type and tight spacing throughout.

## Technical Context

**Language/Version**: TypeScript (ES2022+) · Rust (edition 2021) — unchanged backend unless 003 multi-session still pending

**Primary Dependencies**: Tauri 2 · React 19 · Vite · **Tailwind CSS** · **shadcn/ui** (Radix primitives) · `react-resizable-panels` (via shadcn Resizable) · tree: prefer **custom/shadcn Collapsible tree** OR style **react-complex-tree** with Faro tokens (see research)

**Storage**: Existing SQLite prefs for theme; optional UI prefs for below-panel open height (session or `ui_preferences`)

**Testing**: Vitest (menubar presence, label hit-target, context menu Edit, panel open/close/resize) · visual checklist for density · no new network egress

**Target Platform**: Desktop Faro (Win/macOS/Linux)

**Project Type**: Desktop application (Tauri hybrid) — UI system + layout

**Performance Goals**: Menubar/context menus open &lt;100ms perceived; panel resize does not drop log scroll position; theme toggle without full remount storm

**Constraints**: Constitution VI; path-only secrets on edit; dense UI (prefer `text-xs`/`text-sm`, small paddings); no permanent right analysis column; no bulky header strip

**Scale/Scope**: 3 user stories; platform-wide component migration of primary surfaces (MainShell, tree, LogWindow, dialogs, menus)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: `specs/004-pro-workspace-chrome/spec.md` + this plan
- [x] Secrets: edit config remains path/identifier only
- [x] No exfiltration (VI): shadcn/Tailwind are local npm; no telemetry SDKs
- [x] Network: unchanged product endpoints
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules analyzer: analysis UI moves below; engine unchanged
- [x] Tests planned for chrome + panel + edit menu
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (`5`/`6`)

**Post-design re-check (Phase 1):** PASS — UI-only + prefs; no credential egress.

## Project Structure

### Documentation (this feature)

```text
specs/004-pro-workspace-chrome/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-ia.md
│   └── ui-components.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
# NEW tooling
components.json                 # shadcn config
tailwind.config.* / @tailwind   # per shadcn Vite setup
src/
├── components/
│   ├── ui/                     # NEW — shadcn primitives (button, menubar, …)
│   ├── chrome/
│   │   ├── AppMenubar.tsx      # NEW — Ambientes | Temas
│   │   └── (remove bulky MainShell header strip)
│   ├── catalog/
│   │   ├── EnvTreeNav.tsx      # label-only select; ContextMenu + Edit
│   │   └── AccordionNav.tsx    # remove if still present
│   ├── logs/
│   │   ├── LogWorkspace.tsx    # NEW — vertical Resizable: logs | below panel
│   │   ├── AnalysisDrawer.tsx  # NEW — foldable findings/inspector
│   │   └── FindingPanel.tsx    # relocate into drawer
│   └── env/
│       └── NewEnvironmentModal.tsx  # restyle with shadcn Dialog
├── views/
│   ├── MainShell.tsx           # Menubar + fixed left + LogWorkspace
│   └── LogWindow.tsx           # tabs full width; no side FindingPanel column
├── hooks/
│   ├── useTheme.ts             # wired from Temas menu
│   └── useAnalysisDrawer.ts    # open/close/height
└── styles/
    ├── theme.css               # map to CSS variables / shadcn tokens (dense)
    └── workspace.css           # tighten; deprecate bulky rules

# Dependency note
# If 003 multi-session runtime not yet landed, implement IPC/runtime from
# specs/003-env-tree-nav/plan.md in the same delivery train as this chrome.
```

**Structure Decision**: Single Tauri app. 004 owns UI system + chrome/layout; pull 003 backend/tree behavior if still missing.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Add Tailwind + shadcn platform-wide | Spec FR-004 + user mandate | Keep ad-hoc CSS — fails cohesive professional system |
| Absorb unfinished 003 tree/multi-session | Spec assumes env tree | Ship chrome only on AccordionNav — contradicts fixed env tree + edit/connect model |
