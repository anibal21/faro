# Implementation Plan: Faro — EKS log monitor via bastion

**Branch**: `feature-entrega1-AERC` (feature id `001-eks-log-monitor`) | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-eks-log-monitor/spec.md`

**Note**: This plan includes Spec Kit wireframe mockups under `wireframes/` and **draw.io architecture diagrams** under `docs/architecture/` (system context, components, connection sequence).

## Summary

Faro is a **desktop** app (Tauri 2 + React + TypeScript) that lets ops/colleagues browse EKS **Pods (Deployments)** and **ConfigMaps** through an SSH bastion, follow **aggregated live logs** per Deployment in **Structured** (default) or **Raw** (terminal dump) views, and run a **local Spring Boot rules engine** on click of a detected error write-group. Connection **environments** persist in local SQLite as **paths and identifiers only** (PEM path, IAM credentials file path, `region_name`, `cluster_name`, bastion SSH fields)—never PEM/IAM secret contents. New-environment form: PEM + SSH + ruta IAM + región + cluster.

## Technical Context

**Language/Version**: TypeScript (frontend, ES2022+) · Rust (stable, edition 2021) for Tauri commands

**Primary Dependencies**: Tauri 2 · React 18+ · Vite · `tauri-plugin-sql` (SQLite) · kube / aws-sdk (Rust) · SSH tunnel with local PEM path · IAM credentials **file path** (read at connect) · local rules engine (patterns, no generative AI)

**Storage**: Local SQLite for connection instances, UI prefs (theme), light analysis history metadata — **not** full log dumps

**Testing**: Vitest (frontend unit) · `cargo test` (Rust) · Playwright or Tauri WebDriver for ≥1 E2E primary flow

**Target Platform**: Desktop installers/runnables for Windows (demo-first), macOS, Linux

**Project Type**: Desktop application (Tauri hybrid)

**Performance Goals**: New log lines visible ≤3s under demo load (SC-003); UI remains scrollable/searchable under high volume (drop oldest buffer lines if needed)

**Constraints**: Constitution VI — no credential/user-data exfiltration; read-only K8s v1; PEM path + IAM credentials **file path** only (no secret values in DB); `region_name` + `cluster_name` required; no log export in MVP; no buffer-wide Analyze button

**Scale/Scope**: Single-user desktop; multiple saved environments; one **active** cluster session at a time; multiple concurrent log windows; MVP screens = empty / env loaded / Structured / Raw (+ theme toggle)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: scope covered by `specs/001-eks-log-monitor/spec.md` + this plan
- [x] Secrets: no PEM/IAM key contents in DB; paths only (`pem_path`, `iam_credentials_path`) + `region_name` / `cluster_name` / bastion fields
- [x] No exfiltration (VI): no third-party/telemetry/LLM egress of credentials or user-domain data; only tool metadata (e.g. version) may leave to non-user endpoints
- [x] Network: only user-configured bastion/EKS for product function
- [x] Read-only K8s in v1: no mutating APIs in contracts
- [x] Local SQLite + rules-based analyzer (no in-app generative AI for analyze)
- [x] Tests planned: unit/integration + ≥1 E2E for primary flow
- [x] Desktop demonstrable; public URL not required
- [x] AI4Devs docs sync planned (`2`/`3`/`4` after plan; `6` after tasks)

**Post-design re-check (Phase 1):** PASS — contracts are local Tauri command/event surfaces only; no SaaS egress; wireframes do not imply credential upload or export.

## Project Structure

### Documentation (this feature)

```text
specs/001-eks-log-monitor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── tauri-commands.md
│   └── ui-ia.md
├── wireframes/
│   ├── 01-empty-workspace.svg
│   ├── 02-environment-loaded.svg
│   ├── 03-logs-structured.svg
│   └── 04-logs-raw.svg
├── checklists/
└── tasks.md              # NOT created by /speckit-plan
```

### Source Code (repository root)

```text
apps/faro/                    # or repo-root app after scaffold
├── src/                      # React + TypeScript UI
│   ├── components/           # menus, env list, catalog, log views
│   ├── views/                # empty, connected, log window
│   ├── hooks/
│   └── styles/               # light/dark theme tokens
├── src-tauri/                # Rust
│   ├── src/
│   │   ├── commands/         # connect, list, logs, analyze
│   │   ├── ssh/
│   │   ├── k8s/
│   │   ├── db/
│   │   └── rules/            # Spring Boot rules engine
│   └── Cargo.toml
├── rules/                    # shipped Spring Boot rule pack (JSON/YAML)
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Single Tauri desktop app at repo root (or `apps/faro` if monorepo later). Frontend owns IA/menus and dual log views; Rust owns SSH tunnel, kube reads, SQLite, and rules engine. Wireframes under `specs/001-eks-log-monitor/wireframes/` are design constraints pending `/speckit-wireframe-review` sign-off.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 & Phase 1 Outputs

- [research.md](./research.md) — stack, multi-env UX, Raw/Structured, theme
- [data-model.md](./data-model.md) — entities and validation
- [contracts/](./contracts/) — Tauri commands + UI IA
- [quickstart.md](./quickstart.md) — validation scenarios
- [wireframes/](./wireframes/) — UI SVG mockups (iterating; sign-off pending)
- [docs/architecture/](../../docs/architecture/) — draw.io + SVG (system context, components, sequence)

## Architecture diagrams (draw.io)

| # | Diagram | Editable | Agent/PR export |
|---|---------|----------|-----------------|
| 1 | System context (user → Faro → bastion → EKS) | [`01-system-context.drawio`](../../docs/architecture/01-system-context.drawio) | [`01-system-context.svg`](../../docs/architecture/01-system-context.svg) |
| 2 | Internal components (UI · IPC · Rust · SQLite · externos) | [`02-components.drawio`](../../docs/architecture/02-components.drawio) | [`02-components.svg`](../../docs/architecture/02-components.svg) |
| 3 | Connection / logs / analyze sequence | [`03-connection-sequence.drawio`](../../docs/architecture/03-connection-sequence.drawio) | [`03-connection-sequence.svg`](../../docs/architecture/03-connection-sequence.svg) |

**Edit:** open `.drawio` in [diagrams.net](https://app.diagrams.net/) or Draw.io VS Code/Cursor extension; re-export SVG after changes.  
**Contrast:** diagrams use fixed white page/canvas, solid fills, dark text (`#0F172A`), and `labelBackgroundColor=#FFFFFF` on edge labels so they stay readable in editor dark or light theme.

## UI Mockups (this plan)

| # | Screen | File |
|---|--------|------|
| 1 | Empty workspace + Ambiente menu | `wireframes/01-empty-workspace.svg` |
| 2 | Environment loaded (Pods catalog) | `wireframes/02-environment-loaded.svg` |
| 3 | Logs Structured + findings panel | `wireframes/03-logs-structured.svg` |
| 4 | Logs Raw (native terminal) | `wireframes/04-logs-raw.svg` |

**Menus (IA):**

- **Ambiente**: Configurar nuevo ambiente · Cargar ambiente configurado · Cargar varios ambientes · Desconectar
- **Ver**: Modo claro · Modo oscuro

**Product note:** Multiple environments may be **loaded/listed**; only **one** is **active** for cluster ops (aligns with spec assumption). Loading several at once populates the sidebar; switching active invalidates prior live windows.
