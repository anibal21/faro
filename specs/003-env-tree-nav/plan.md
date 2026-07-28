# Implementation Plan: Environment tree navigation

**Branch**: `003-env-tree-nav` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-env-tree-nav/spec.md`

**Note**: Builds on `001` + `002` (accordion layout). Replaces left accordion + right environment selector with an **environment-rooted tree**, **multi-connect**, and a **lightweight React tree library**. Wireframes for 003 SHOULD be generated before implement (`/speckit-wireframe-generate`); none signed off yet at plan time.

## Summary

Left panel becomes a **tree of all saved environments** (`name` + `cluster`, status icon green/yellow/red). Hierarchy: **Env → Pods → leaves | ConfigMaps → leaves**. Label click **selects**; chevron **expands**; **right-click context menu** (one Conectar/Desconectar action) manages connection. **Multiple environments may be connected at once**. Catalog/logs/tabs are **scoped by environment id**. Remove `EnvironmentSelector` and standalone `AccordionNav`. Adopt **`react-complex-tree`** for accessible tree + context-menu patterns (see [research.md](./research.md)).

## Technical Context

**Language/Version**: TypeScript (ES2022+) · Rust (edition 2021) — same Faro app

**Primary Dependencies**: Tauri 2 · React 19 · Vite · **`react-complex-tree`** (tree UI) · existing `commands` / `k8s` / `db` / `runtime`

**Storage**: Existing SQLite durable environments. Runtime gains **multi-session map** (per-instance connect state, catalog epoch, tunnel/demo handle). No full log dumps in SQLite. Workspace “loadedIds” listing is superseded for nav by **all saved** instances; selected id remains UI focus.

**Testing**: Vitest (tree hierarchy, context menu action, multi-status, tab env scoping) · `cargo test` (multi-session connect does not drop peer sessions; catalog/logs require instance id) · ≥1 E2E outline: two envs connect → both green → open leaf under each

**Target Platform**: Desktop Faro (Win/macOS/Linux)

**Project Type**: Desktop application (Tauri hybrid) — nav + session architecture increment

**Performance Goals**: Tree remains responsive with dozens of envs; per-env catalog refresh independent; log ring buffer ≤500 chunks **per tab**; connecting env B must not stall UI for env A

**Constraints**: Constitution VI; read-only K8s; no right-side env selector; no standalone Pods/ConfigMaps accordion; status icon display-only; multi-connect required (FR-013); soft advisory if many concurrent sessions (no hard product ban)

**Scale/Scope**: 3 user stories; refactor MainShell, remove AccordionNav/EnvironmentSelector; runtime + IPC multi-session; tab `navKey` includes `instanceId`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: scope covered by `specs/003-env-tree-nav/spec.md` + this plan
- [x] Secrets: path-only environments; no PEM/IAM bodies in tree or IPC payloads
- [x] No exfiltration (VI): no third-party egress; tree lib is local npm only
- [x] Network: only user-configured bastion/EKS per connected instance
- [x] Read-only K8s in v1: catalog/logs unchanged capability set
- [x] Local SQLite + rules-based analyzer unchanged
- [x] Tests planned: unit/integration + primary multi-env tree flow
- [x] Desktop demonstrable; public URL not required
- [x] AI4Devs docs sync planned (`5`/`6` after tasks; architecture note for multi-session)

**Post-design re-check (Phase 1):** PASS — multi-session stays on-device; IPC scoped by instance id; no credential upload; tree dependency is UI-only.

## Project Structure

### Documentation (this feature)

```text
specs/003-env-tree-nav/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-ia.md
│   └── ipc-multi-session.md
├── checklists/
│   └── requirements.md
└── tasks.md              # NOT created by /speckit-plan
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── catalog/
│   │   ├── EnvTreeNav.tsx            # NEW — react-complex-tree shell
│   │   ├── EnvTreeStatusDot.tsx      # NEW — green/yellow/red
│   │   ├── EnvTreeContextMenu.tsx    # NEW — Conectar | Desconectar
│   │   ├── AccordionNav.tsx          # REMOVE (replaced by EnvTreeNav)
│   │   └── ConfigMapTab.tsx          # keep; tabs remain env-scoped
│   └── env/
│       └── EnvironmentSelector.tsx   # REMOVE from MainShell chrome
├── views/
│   ├── MainShell.tsx                 # tree | main; no right selector
│   └── LogWindow.tsx                 # tab labels include env name when multi
├── hooks/
│   ├── useEnvTree.ts                 # NEW — tree data + expand/select
│   ├── useMultiConnection.ts         # NEW/extend — Map instanceId → status
│   ├── useWorkspaceTabs.ts           # navKey includes instanceId
│   ├── useCatalog.ts                 # catalog keyed by instanceId
│   └── useConfigMaps.ts              # same
└── styles/workspace.css              # tree + status + context menu

src-tauri/src/
├── runtime.rs                        # sessions: HashMap<instanceId, Session>
├── commands/
│   ├── connect.rs                    # connect without dropping peers; disconnect(id)
│   ├── catalog.rs                    # require instance_id
│   ├── logs.rs                       # logs_open(instance_id, …)
│   └── session.rs / env.rs           # list all saved; optional deprecate load-only UX
└── db/…                              # reuse connection_instance list
```

**Structure Decision**: Single Tauri app at repo root. Primary work is multi-session runtime + EnvTreeNav replacing AccordionNav/selector.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multi concurrent tunnels/sessions | Spec FR-013 explicit | Single-session auto-disconnect contradicts clarified product goal |
