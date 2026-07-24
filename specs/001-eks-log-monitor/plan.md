# Implementation Plan: Faro — EKS log monitor via bastion

**Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)  
**Branch**: `feature-entrega1-AERC` (feature id `001-eks-log-monitor`)

**Input**: Feature specification from `/specs/001-eks-log-monitor/spec.md`

**Note**: This plan includes Spec Kit wireframe mockups under `wireframes/` and **draw.io architecture diagrams** under `docs/architecture/` (system context, components, connection sequence).

## Summary

Faro is a **desktop** app (Tauri 2 + React + TypeScript) that lets ops/colleagues browse EKS **Pods (Deployments)** and **ConfigMaps** through an SSH bastion, follow **aggregated live logs** per Deployment in **Structured** (default) or **Raw** (terminal dump) views, and run a **local Spring Boot rules engine** on click of a detected error write-group. Launch shows a **minimal splash** (brand **Faro** over a **full-bleed background image** — asset deferred to implement / wireframe shows placeholder slot — plus AWS tagline + *…preparando aplicación*) while purging leftover **session/log-ephemeral** SQLite rows; durable environments and prefs are kept. Connection **environments** persist as **paths and identifiers only**. Cluster catalog is **hydrated once per connect** into session-cache tables. New-environment form: PEM + SSH + ruta IAM + región + cluster.

## Technical Context

**Language/Version**: TypeScript (frontend, ES2022+) · Rust (stable, edition 2021) for Tauri commands

**Primary Dependencies**: Tauri 2 · React 18+ · Vite · `tauri-plugin-sql` (SQLite) · kube / aws-sdk (Rust) · SSH tunnel with local PEM path · IAM credentials **file path** (read at connect) · local rules engine (patterns, no generative AI)

**Storage**: Local SQLite in two tiers — (1) **durable**: connection environments (paths/ids only), UI prefs, light analysis history metadata — **kept across sessions**; (2) **session/ephemeral**: catalog leftovers + any log-session residue — purged on splash startup (and disconnect/exit). **Not** full log dumps — see [data-model.md](./data-model.md) + [`docs/architecture/04-sqlite-er.drawio`](../../docs/architecture/04-sqlite-er.drawio)

**Testing**: Vitest (frontend unit) · `cargo test` (Rust) · Playwright or Tauri WebDriver for ≥1 E2E primary flow

**Target Platform**: Desktop installers/runnables for Windows (demo-first), macOS, Linux

**Project Type**: Desktop application (Tauri hybrid)

**Performance Goals**: New log lines visible ≤3s under demo load (SC-003); UI remains scrollable/searchable under high volume (drop oldest buffer lines if needed)

**Constraints**: Constitution VI — no credential/user-data exfiltration; read-only K8s v1; PEM path + IAM credentials **file path** only (no secret values in DB); `region_name` + `cluster_name` required; no log export in MVP; no buffer-wide Analyze button

**Scale/Scope**: Single-user desktop; **10 atomic user stories (US1–US10)** for development control; splash then main window; multiple saved environments; one **active** cluster session; multiple concurrent log windows; MVP screens = splash / empty / env loaded / Structured / Raw (+ theme)

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

**Post-design re-check (Phase 1):** PASS — splash purge ephemeral-only; IPC documented as commands/events (no HTTP SaaS); no full log dumps in SQLite; wireframes 01–06.

## Project Structure

### Documentation (this feature)

```text
specs/001-eks-log-monitor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ipc-commands-events.md   # canonical IPC map
│   ├── tauri-commands.md        # stub → ipc-commands-events
│   └── ui-ia.md
├── wireframes/
│   ├── 01-splash-preparing.svg
│   ├── 02-empty-workspace.svg
│   ├── 03-new-environment-modal.svg
│   ├── 04-environment-loaded.svg
│   ├── 05-configmaps-raw-tabs.svg
│   └── 06-structured-finding-detail.svg
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

- [research.md](./research.md) — stack, multi-env UX, Raw/Structured, theme, **session catalog cache**
- [data-model.md](./data-model.md) — ER/UML entities, durable vs session tiers, validation
- [contracts/](./contracts/) — **Comandos y eventos IPC** + UI IA
- [quickstart.md](./quickstart.md) — validation scenarios (incl. cache lifecycle)
- [wireframes/](./wireframes/) — UI SVG mockups (iterating; sign-off pending)
- [docs/architecture/](../../docs/architecture/) — draw.io + SVG (system context, components, sequence, SQLite ER, **IPC commands/events**)

## Architecture diagrams (draw.io)

| # | Diagram | Editable | Agent/PR export |
|---|---------|----------|-----------------|
| 1 | System context (user → Faro → bastion → EKS) | [`01-system-context.drawio`](../../docs/architecture/01-system-context.drawio) | [`01-system-context.svg`](../../docs/architecture/01-system-context.svg) |
| 2 | Internal components (UI · IPC · Rust · SQLite · externos) | [`02-components.drawio`](../../docs/architecture/02-components.drawio) | [`02-components.svg`](../../docs/architecture/02-components.svg) |
| 3 | Connection / logs / analyze sequence | [`03-connection-sequence.drawio`](../../docs/architecture/03-connection-sequence.drawio) | [`03-connection-sequence.svg`](../../docs/architecture/03-connection-sequence.svg) |
| 4 | SQLite ER (durable + session cache) | [`04-sqlite-er.drawio`](../../docs/architecture/04-sqlite-er.drawio) | [`04-sqlite-er.svg`](../../docs/architecture/04-sqlite-er.svg) |
| 5 | IPC commands vs events | [`05-ipc-commands-events.drawio`](../../docs/architecture/05-ipc-commands-events.drawio) | [`05-ipc-commands-events.svg`](../../docs/architecture/05-ipc-commands-events.svg) |

**Edit:** open `.drawio` in [diagrams.net](https://app.diagrams.net/) or Draw.io VS Code/Cursor extension; re-export SVG after changes.  
**Contrast:** diagrams use fixed white page/canvas, solid fills, dark text (`#0F172A`), and `labelBackgroundColor=#FFFFFF` on edge labels so they stay readable in editor dark or light theme.

## UI Mockups (this plan)

| # | Screen | File |
|---|--------|------|
| 1 | Splash / preparando (BG image slot + purge sesión) | `wireframes/01-splash-preparing.svg` |
| 2 | Empty workspace + Ambiente menu | `wireframes/02-empty-workspace.svg` |
| 3 | New environment modal | `wireframes/03-new-environment-modal.svg` |
| 4 | Environment loaded (Pods catalog) | `wireframes/04-environment-loaded.svg` |
| 5 | ConfigMaps Raw tabs | `wireframes/05-configmaps-raw-tabs.svg` |
| 6 | Structured finding detail | `wireframes/06-structured-finding-detail.svg` |

**Startup:** Splash shows brand Faro over a **background-image slot** (asset deferred to implement), tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, and *…preparando aplicación* while `session_purge_ephemeral` runs. Only ephemeral session/log residue is deleted; **durable** `connection_instance` / prefs / light history are kept. Then main window opens (empty or last prefs).

**Menus (IA):**

- **Ambiente**: Configurar nuevo ambiente · Cargar ambiente configurado · Cargar varios ambientes · Desconectar
- **Ver**: Modo claro · Modo oscuro

**Product note:** Multiple environments may be **loaded/listed**; only **one** is **active** for cluster ops (aligns with spec assumption). Loading several at once populates the sidebar; switching active invalidates prior live windows.
