# Implementation Plan: Live cluster connect (keep demo)

**Branch**: `008-live-cluster-connect` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-live-cluster-connect/spec.md` (clarify session 2026-07-28)

**Note**: Replaces unconditional demo hydrate on every `env_connect`. Optional wireframe review pre-hook skipped unless user runs it.

## Summary

Introduce a built-in **demo** environment (first in tree, connect/disconnect only, disconnected at start) that keeps today’s sample catalog/logs. Every **operator-added** environment uses a **real** per-session SSH tunnel + EKS IAM token + Kubernetes read APIs to hydrate catalog, ConfigMaps, and logs—**no silent demo fallback**. Multi-connect: each environment owns its tunnel/port/kube client/session cache.

## Technical Context

**Language/Version**: Rust (Tauri 2 backend) · TypeScript/React frontend — no new languages

**Primary Dependencies**: Existing Tauri/React stack + **`russh` (or managed OpenSSH)** for per-session local port-forward + **`aws-config` / `aws-sdk-eks` / SigV4 EKS token** (credentials from IAM **file at connect**) + **`kube` / `k8s-openapi`** for list/get/watch/logs (read-only) through `https://127.0.0.1:{local_port}` with cluster CA

**Storage**: SQLite durable `connection_instance` (+ builtin demo row or virtual id) · session cache unchanged · **never** persist IAM/PEM contents

**Testing**: Cargo unit tests (tunnel port alloc, IAM parse without leaking secrets, demo vs live branch) · Vitest UI (demo first, no edit/delete, namespace required) · mocked kube/AWS for live hydrate · demo E2E outline unchanged path

**Target Platform**: Desktop Faro (Windows primary; OpenSSH Client or russh)

**Project Type**: Desktop Tauri hybrid — live infrastructure integration

**Performance Goals**: Connect + catalog hydrate usable within ~30–60s on typical bastion; log follow starts within a few seconds after open; multi-session isolation with no cross-talk

**Constraints**: Constitution II/VI (paths only, no exfiltration); III read-only K8s; mandatory namespace for live; no demo seed on live failure; multi-connect isolation

**Scale/Scope**: 3 P1 stories — live full-feature parity, built-in demo UX, no silent fallback

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/008-live-cluster-connect/spec.md` + this plan
- [x] Secrets: IAM/PEM read at connect from paths only; never SQLite/log secrets
- [x] No exfiltration (VI): traffic only to user bastion + their EKS API via tunnel
- [x] Network: user-configured bastion/EKS only
- [x] Read-only K8s: list/get/watch/logs only
- [x] Local SQLite + rules analyzer unchanged for findings
- [x] Tests planned: unit + integration mocks + demo/live branch coverage
- [x] Desktop demonstrable (built-in demo retained)
- [x] AI4Devs docs sync after tasks (HU16)

**Post-design re-check (Phase 1):** PASS — live path is user-infra only; demo remains offline.

## Project Structure

### Documentation (this feature)

```text
specs/008-live-cluster-connect/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── connect-modes.md
│   └── live-k8s-session.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/src/
├── ssh/tunnel.rs              # real port-forward; unique local_port per session
├── k8s/
│   ├── eks_auth.rs            # real token from IAM file + DescribeCluster
│   ├── catalog.rs             # hydrate_demo vs hydrate_live(namespace)
│   ├── client.rs              # NEW — kube Client per SessionEntry
│   ├── logs.rs                # live pod log follow (demo path retained)
│   └── metrics.rs             # live summary or N/D (no fake live metrics)
├── db/connection_instance.rs  # namespace required; builtin demo id
├── commands/connect.rs        # branch demo vs live; no live→demo fallback
├── runtime.rs                 # SessionEntry: tunnel + client + epoch isolated
└── …

src/
├── components/catalog/EnvTreeNav.tsx   # demo first; actions Connect/Disconnect only
├── components/env/NewEnvironmentModal.tsx  # namespace required
└── hooks/useConnection.ts             # multi-connect unchanged contract
```

**Structure Decision**: Extend existing connect/catalog/logs modules with a **mode branch** (`demo` | `live`) keyed by builtin instance id; keep IPC command names stable.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| SSH + AWS + kube deps | Spec requires real connect for all live features | Keep stubs — fails US1 / user need |
| Multi concurrent tunnels | Clarify Q5 isolation | Single tunnel — mixes sessions / rejects multi-connect |
