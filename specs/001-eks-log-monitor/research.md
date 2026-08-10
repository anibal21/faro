# Research: 001-eks-log-monitor

**Date**: 2026-07-22  
**Plan**: [plan.md](./plan.md)

All Technical Context items resolved; no remaining NEEDS CLARIFICATION.

---

## Decision: Tauri 2 + React + TypeScript + Vite

**Rationale**: Constitution and seed (`docs/SPEC.md`) lock desktop delivery with Rust commands for SSH/kube and a web UI for IA. Tauri 2 fits multi-OS packaging without a public URL, keeps secrets on-device, and matches AI4Devs demonstrability.

**Alternatives considered**:
- Electron — heavier runtime, larger attack surface for credential-bearing tools
- Pure native (Swift/WinUI) — triple UI cost for MVP
- Web SaaS — conflicts with constitution VI and “desktop demo” delivery

---

## Decision: Local SQLite via `tauri-plugin-sql`

**Rationale**: Persist connection instances and UI prefs (theme) across restarts (SC-006) without a backend. Full log dumps must not be persisted (constitution IV).

**Alternatives considered**:
- JSON files only — weaker querying/migrations for prefs + history metadata
- Cloud sync DB — forbidden (exfiltration / multi-user backend)

---

## Decision: Ten atomic user stories for development control

**Rationale**: Coarse US1–US5 packed too much for ticket/PR sizing. Split into **US1–US10** (splash, CRUD env, load/active, connect, Pods cache, ConfigMaps, logs dual view, analyze click, theme Should, desktop P3) without adding product scope beyond plan/FR. Enables `/speckit-tasks` to map 1:1 or few tasks per story.

**Alternatives considered**:
- Keep 5 coarse stories — harder to track implement progress
- 15+ micro-stories — overhead without independence gains

---

## Decision: Document IPC as Commands + Events (not HTTP API)

**Rationale**: Faro is a Tauri desktop app; frontend↔backend is local IPC. Delivery docs must map **commands** (`invoke`, request/response, including CRUD) and **events** (`emit`, log stream) explicitly so evaluators and implementers see the real contract. Canonical artifacts: `contracts/ipc-commands-events.md`, AI4Devs `4-comandos-y-eventos-ipc.md`, diagram `docs/architecture/05-ipc-commands-events`.

**Alternatives considered**:
- OpenAPI REST doc — implies a web API Faro does not have
- Only informal command list — weaker for AI4Devs “API” section and IPC visualization

---

## Decision: Splash window + ephemeral purge before main UI

**Rationale**: On launch, Faro shows a **minimal** splash (brand **Faro** over a **background image** full-bleed in the splash window — concrete asset **deferred to implementation**; wireframe `01-splash-preparing.svg` only shows the placeholder slot — plus tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, status *…preparando aplicación*) while `session_purge_ephemeral` clears leftover **session/log-ephemeral** SQLite rows from a dirty prior exit. Only after purge completes does the main window open. Durable **connection instances**, UI prefs, and light analysis history **must** survive. Wireframe order: `01-splash-preparing` then empty/modal/loaded/… renumbered 02–06.

**Alternatives considered**:
- Jump straight to empty workspace — no branded load moment; harder to hide startup purge latency
- Wipe entire SQLite including environments — violates SC-006 and user requirement to keep connections across sessions
- Purge only in-memory (no SQLite cleanup) — leaves stale session catalog after crash

---

## Decision: Two-tier SQLite — durable profiles + session catalog cache

**Rationale**: Environments (`connection_instance`) and UI prefs must survive restart. Cluster catalog (namespaces, Deployments, ConfigMaps, pod replica stubs, ConfigMap entries) is fetched **once per successful connect** (or explicit refresh), stored in SQLite **session-cache** tables so the UI can filter/browse without re-hitting AWS/K8s on every navigation. That cache **MUST be purged on application exit** (and on disconnect / reconnect) so the next launch always regenerates from the live cluster — never treating yesterday’s catalog as durable truth. Aligns with constitution IV (local SQLite for profiles + light history; no full log dumps) and improves perceived platform speed.

**Catalog hydrate**: After `env_connect` succeeds → mint `catalog_epoch` → list Deployments + ConfigMaps (+ namespaces) → INSERT session tables. ConfigMap **values** load lazily on first open within the same epoch. Optional `catalog_refresh` replaces the epoch for the active instance.

**Dirty exit**: Crash or forced kill can skip the shutdown purge and leave session rows on disk. **Mitigation**: splash runs `session_purge_ephemeral` (session/log residue only). Durable environment rows stay.

**Also persisted (durable, non-secret)**: `sort_order`, `is_favorite`, optional `notes` on environments; light `analysis_finding_history` summaries (severity / rule_id / short text — not stacktrace bodies); `schema_meta` for migrations.

**Alternatives considered**:
- RAM-only catalog — simpler, but loses fast re-filter and multi-pane browse under demo load; user asked for SQLite-backed speed
- Durable catalog across app restarts — stale RBAC/workloads risk; user required regenerate-on-close
- Cache full log streams in SQLite — forbidden (constitution IV / FR-017 export OoS)

---

## Decision: SSH bastion (PEM) + IAM credentials file path + region_name + cluster_name

**Rationale**: Ops colleagues often lack AWS CLI/local profiles. Faro is standalone: each environment stores **paths only** — PEM for SSH tunnel and a local IAM credentials file (`aws_access_key_id` / `aws_secret_access_key`) read at connect time to mint EKS tokens. `region_name` + `cluster_name` identify the cluster (SDK can `DescribeCluster` for endpoint/CA). No AWS secrets persisted in SQLite.

**New-environment form fields**: name, bastion host, SSH port, SSH user, namespace (optional), PEM path, IAM credentials path, `region_name`, `cluster_name`.

**Alternatives considered**:
- AWS profile name only — requires CLI/SSO setup; poor fit for ops-only PEM users
- Embedding Access Key/Secret in SQLite — violates constitution II
- SSO start URL alone — insufficient without account/role/region/cluster
- Kubeconfig-only auth — valid later; MVP locks IAM file + PEM + region + cluster

---

## Decision: Dual log views — Structured default, Raw unmodified

**Rationale**: Clarification session 2026-07-22. Structured groups by **each write** (stacktrace ≈ one write); Raw is terminal dump with **no** manipulation. Default Structured (FR-022); switch via button without dropping follow (FR-021).

**Alternatives considered**:
- Raw-only — fails non-technical analysis path
- Always parse/columns in Raw — violates FR-018
- Buffer-wide Analyze button — out of scope MVP

---

## Decision: Lightweight live detection + full rules on click

**Rationale**: Live follow stays cheap; full Spring Boot rules run when user clicks a marked write-group/stacktrace (FR-012, FR-020).

**Alternatives considered**:
- Full rules on every line — too expensive under volume
- Generative AI panel — forbidden by constitution IV / FR-014

---

## Decision: Multi-environment load vs one active session

**Rationale**: User menu asks for configure / load one / load many. Spec assumes one **active** connection for browsing. **UX**: load many into the Ambientes list; only the active environment drives SSH/kube; switching active closes or invalidates live log windows.

**Alternatives considered**:
- Concurrent tunnels to many clusters — higher complexity and unclear MVP value
- Single environment only — rejects “cargar varios” menu need

---

## Decision: Light / dark theme as Ver menu preference

**Rationale**: Explicit UX request for plan/mockups. Store in SQLite UI prefs; default light to match Spec Kit wireframe light theme for review. Theme does not affect Raw’s terminal-like contrast (dark dump panel may remain dark in both app themes for readability—implementation detail).

**Alternatives considered**:
- OS-only theme follow — still need explicit Ver menu per product request
- Theme per log window — overkill for MVP

---

## Decision: Wireframe-first UI constraints (Spec Kit extension)

**Rationale**: Six light/dark-aware SVGs under `wireframes/`: splash, empty, new-env modal, connected, ConfigMaps Raw, Structured finding. Sign-off via `/speckit-wireframe-review` should promote them into `spec.md` ## UI Mockup before implement freezes layout.

**Alternatives considered**:
- Implement without mockups — higher IA rework risk for AI4Devs delivery
- Figma-only — outside Spec Kit artifact trail

---

## Best practices captured

| Area | Practice |
|------|----------|
| Secrets | Paths only (PEM, IAM file); never log/persist key contents |
| Catalog cache | Hydrate once per connect into SQLite session tables; purge on app exit / disconnect; optional `catalog_refresh` |
| K8s | get/list/watch + pod logs only |
| Log buffer | Ring buffer with searchable window; drop oldest under pressure |
| Errors | Actionable, non-secret-leaking messages |
| Tests | Unit rules + integration connect mocks + 1 E2E happy path |

---

## Decision: Architecture diagrams in draw.io (+ SVG export)

**Rationale**: AI4Devs / `docs/SPEC.md` require editable architecture artifacts separate from UI wireframes. `.drawio` is the source of truth; `.svg` is the agent/PR-readable export (XML de draw.io se lee mal).

**Location**: `docs/architecture/01-system-context`, `02-components`, `03-connection-sequence` (each `.drawio` + `.svg`).

**Contrast (dark/light editor)**: white page `background` + canvas rect; solid shape fills; dark text `#0F172A` on light fills / white text on navy; edge labels use `labelBackgroundColor=#FFFFFF`.

**Alternatives considered**:
- Only Mermaid in markdown — fine for quick view, weaker for formal delivery/editing in diagrams.net
- Spec Kit wireframe dark theme for “architecture” — reserved for UI/backend mockups, not the agreed draw.io package
- Figma — not the repo source of truth for this project
- Transparent titles (`fillColor=none`) — unreadable when Draw.io UI is in dark mode
