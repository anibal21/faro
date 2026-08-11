# Implementation Plan: Workspace Delivery Polish

**Branch**: `023-workspace-delivery` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-workspace-delivery/spec.md`

**Note**: Optional `/speckit-wireframe-review` skipped — contracts cover layout, colors, modal, tabs; wireframes optional later.

## Summary

Delivery polish for multi-environment work: resizable left rail + window min **900×600**; richer demo fixtures; **Eliminar** (incl. demo, restorable via fixture); **10** env colors (line + tab border) with max **10** saved configs; true multi-session tabs keyed by `instanceId` (same pod name across envs); hard cap **2** live connections with modal on third; NSIS installer branded (Aníbal Rodríguez, 2026, MIT, ES, Desktop+Start, Program Files\Faro, existing icons + brand color).

## Technical Context

**Language/Version**: TypeScript/React · Rust/Tauri 2 · SQLite · NSIS via Tauri bundle

**Primary Dependencies**: Existing `EnvTreeNav`, `useWorkspaceTabs`, `useConnection`, `RuntimeState` sessions map, `env_delete`/`env_upsert`, `windowGeometry` (900×600), Tauri `setMinSize` / window APIs, CSS variables light/dark

**Storage**: SQLite `connection_instance` (+ color index / slot); prefs optional for sidebar width; demo seed/`ensure_demo` behavior change

**Testing**: Vitest (navKey+instanceId, color tokens, delete/restore, connect limit modal); cargo where session cap/delete demo; manual quickstart multi-env + installer smoke

**Target Platform**: Windows-first (NSIS); dmg/appimage targets remain but theming focus is NSIS

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Two concurrent tunnels + tabs usable; sidebar drag without jank

**Constraints**: Constitution II–VI; max 2 connections / 10 configs; colors OK in light+dark; no new SaaS egress

**Scale/Scope**: 8 user stories; touches chrome, runtime focus/logs, DB, fixtures, bundle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/023-workspace-delivery/spec.md` + this plan
- [x] Secrets: still PEM paths only; fixtures stay local non-secret samples
- [x] No exfiltration / read-only K8s / local-first: unchanged
- [x] Tests planned per Must stories
- [x] Desktop demonstrable + branded installer
- [x] AI4Devs docs sync after tasks (HU27+)

**Post-design re-check (Phase 1):** PASS — multi-session still user-configured bastions only; installer metadata is product identity not telemetry.

## Project Structure

### Documentation (this feature)

```text
specs/023-workspace-delivery/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── layout-resize.md
│   ├── env-color-limits.md
│   ├── multi-session-tabs.md
│   ├── connection-cap.md
│   ├── env-delete-fixtures.md
│   └── nsis-faro.md
└── tasks.md
```

### Source Code (repository root)

```text
src/lib/windowGeometry.ts              # setMinSize 900×600 after main geometry
src/lib/envColors.ts                   # 10-color palette light/dark tokens
src/hooks/tabKeys.ts                   # include instanceId in all navKeys
src/hooks/useWorkspaceTabs.ts          # instance-scoped open/dedupe; tab envColor
src/hooks/useConnection.ts             # enforce max 2; focus on tree select
src/hooks/useEnvironments.ts           # max 10 upsert; wire remove
src/components/catalog/EnvTreeNav.tsx  # resize handle; color rail; Eliminar
src/views/MainShell.tsx / LogWindow.tsx # splitter; tab border by env color
src/components/env/*                   # connection-limit modal; delete confirm
src-tauri/src/commands/connect.rs      # reject 3rd session; focus helpers
src-tauri/src/commands/env.rs          # allow demo delete; count≤10; color_index
src-tauri/src/db/connection_instance.rs
src-tauri/src/commands/logs.rs / catalog.rs  # instance_id args OR reliable focus-on-open
fixtures/                              # richer demo catalog/logs samples
src-tauri/tauri.conf.json              # nsis publisher, languages, templates
tests/unit/…                           # coverage for keys, cap, colors, delete
```

**Structure Decision**: Prefer **focus-on-select** + **`instanceId` in navKey/tab model** so catalog/logs keep using focused session without rewriting every command on day one—but opening a tab from env B MUST set focus to B first (or pass `instanceId` through IPC). Cap connections in both FE (modal) and Rust (authoritative). Color as `color_index` 0–9 on `connection_instance`.

## Complexity Tracking

> No constitution violations. Complexity is product scope (8 stories), not principle conflicts.
