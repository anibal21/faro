# Quickstart validation: 001-eks-log-monitor

**Purpose**: Prove the feature end-to-end once scaffolded. Not an implementation guide.

## Prerequisites

- Spec + plan approved; wireframes reviewed (optional sign-off via `/speckit-wireframe-review`)
- Valid bastion host, PEM path, IAM credentials file path, `region_name`, `cluster_name` (demo env)
- Cluster RBAC: list/get pods, pod logs, ConfigMaps
- Dev toolchain: Node + Rust + Tauri 2 prerequisites for the demo OS

## Setup (after scaffold)

```text
# from app root (exact commands land in tasks/implement)
npm install
npm run tauri dev
```

Confirm SQLite DB created locally; no secrets in repo.

## Validation scenarios

### V0 — Splash / preparando

1. Launch Faro (cold start or after forced kill with leftover session rows).
2. Expect **minimal** window: title **Faro**, background-image slot (asset later), tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, status *…preparando aplicación*.
3. While splash is visible, `session_purge_ephemeral` runs — deletes leftover `«session»` tables only.
4. After purge, splash dismisses → main window (empty workspace if no loaded env).
5. Confirm saved **connection instances** and theme prefs still present (SC-006).

**Expect**: `wireframes/01-splash-preparing.svg`; FR-023, FR-024.

### V1 — Empty workspace

1. After splash, with empty loaded set (or cleared loaded sidebar).
2. Expect empty welcome + menú **Ambiente** with: configurar / cargar / cargar varios / desconectar.
3. **Ver** toggles modo claro/oscuro (pref persists after restart).

**Expect**: Matches `wireframes/02-empty-workspace.svg` intent.

### V2 — Configure & load environment

1. **Ambiente → Configurar nuevo ambiente** — fill SSH (host, port, user), PEM path, IAM credentials path, `region_name`, `cluster_name`, optional namespace; save.
2. Connect; status shows connected.
3. Optionally **Cargar varios ambientes** — two appear in sidebar; only one active.

**Expect**: Persist after restart (SC-006). Paths only in DB. See `wireframes/03-new-environment-modal.svg` + `04-environment-loaded.svg`.

### V3 — Browse Pods / ConfigMaps (session cache)

1. Connect successfully — catalog hydrate runs once (Deployments + ConfigMaps appear).
2. Switch Pods ↔ ConfigMaps; filter by name; open ConfigMap read-only (values load once into session cache).
3. Navigate away and back — lists still resolve from SQLite session cache without requiring a full re-list from the cluster (optional: verify via debug/log that hydrate is not repeated until refresh/disconnect).
4. Fail bastion/key intentionally — clear non-secret error.
5. Disconnect or quit the app — session-cache tables empty; reconnect regenerates catalog. Forced kill + relaunch: splash purge clears leftovers; environments remain.

**Expect**: FR-005–006, FR-011, FR-016; data-model session-cache lifecycle. See `wireframes/05-configmaps-raw-tabs.svg`.

### V4 — Structured logs + analyze

1. Open logs for a Deployment with ≥2 replicas.
2. Window opens in **Structured**; lines attributable to pods; live follow ≤3s (SC-003).
3. Click a marked stacktrace write-group → findings panel (severity, plain text, recommendation).
4. Confirm **no** buffer-wide Analyze / **no** Export in chrome.

**Expect**: `wireframes/06-structured-finding-detail.svg`; SC-002, SC-004, SC-009.

### V5 — Raw (native) view

1. Same window → **Raw**.
2. Stream looks like terminal dump; no severity columns/grouping.
3. Switch back to Structured without stopping follow.

**Expect**: FR-018, FR-021 (also covered in `04-environment-loaded` / Raw tab chrome).

### V6 — Security spot-check

1. Inspect network: only bastion/EKS (user-configured).
2. Confirm analyze is local; no log upload.

**Expect**: SC-008; constitution VI.

## References

- [data-model.md](./data-model.md)
- [contracts/ipc-commands-events.md](./contracts/ipc-commands-events.md)
- [contracts/ui-ia.md](./contracts/ui-ia.md)
- [wireframes/](./wireframes/)
