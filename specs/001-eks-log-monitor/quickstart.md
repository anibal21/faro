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

### V1 — Empty workspace

1. Launch with empty DB (or cleared instances).
2. Expect empty welcome + menú **Ambiente** with: configurar / cargar / cargar varios / desconectar.
3. **Ver** toggles modo claro/oscuro (pref persists after restart).

**Expect**: Matches `wireframes/01-empty-workspace.svg` intent.

### V2 — Configure & load environment

1. **Ambiente → Configurar nuevo ambiente** — fill SSH (host, port, user), PEM path, IAM credentials path, `region_name`, `cluster_name`, optional namespace; save.
2. Connect; status shows connected.
3. Optionally **Cargar varios ambientes** — two appear in sidebar; only one active.

**Expect**: Persist after restart (SC-006). Paths only in DB. See `wireframes/02-environment-loaded.svg`.

### V3 — Browse Pods / ConfigMaps

1. Switch Pods ↔ ConfigMaps; filter by name; open ConfigMap read-only.
2. Fail bastion/key intentionally — clear non-secret error.

**Expect**: FR-005–006, FR-011, FR-016.

### V4 — Structured logs + analyze

1. Open logs for a Deployment with ≥2 replicas.
2. Window opens in **Structured**; lines attributable to pods; live follow ≤3s (SC-003).
3. Click a marked stacktrace write-group → findings panel (severity, plain text, recommendation).
4. Confirm **no** buffer-wide Analyze / **no** Export in chrome.

**Expect**: `wireframes/03-logs-structured.svg`; SC-002, SC-004, SC-009.

### V5 — Raw (native) view

1. Same window → **Raw**.
2. Stream looks like terminal dump; no severity columns/grouping.
3. Switch back to Structured without stopping follow.

**Expect**: `wireframes/04-logs-raw.svg`; FR-018, FR-021.

### V6 — Security spot-check

1. Inspect network: only bastion/EKS (user-configured).
2. Confirm analyze is local; no log upload.

**Expect**: SC-008; constitution VI.

## References

- [data-model.md](./data-model.md)
- [contracts/tauri-commands.md](./contracts/tauri-commands.md)
- [contracts/ui-ia.md](./contracts/ui-ia.md)
- [wireframes/](./wireframes/)
