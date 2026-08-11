# Implementation Plan: PEM-Only Live Connect

**Branch**: `014-pem-only-live-connect` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-pem-only-live-connect/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; form change is a field removal — wireframes optional.

## Summary

Remove the local IAM credentials file from live connect. Obtain EKS endpoint + CA by running `aws eks describe-cluster` on the bastion (same `ssh_exec` + PEM path already used for `get-token`). Drop IAM path from the new/edit environment UI and upsert validation. Ignore legacy `iam_credentials_path` at connect. Demo unchanged. Reuse existing tunnel + bastion token path for catalog/logs.

## Technical Context

**Language/Version**: TypeScript/React · Rust (Tauri 2 commands)

**Primary Dependencies**: Existing `ssh::tunnel::ssh_exec`, `eks_auth::mint_eks_token_via_bastion`, `env_upsert` / `NewEnvironmentModal`, SQLite `connection_instance`

**Storage**: Durable `connection_instance` — keep `iam_credentials_path` column for legacy rows; stop requiring/using it on connect; allow empty on upsert

**Testing**: Cargo unit tests (describe-via-bastion command construction / JSON parse / stderr sanitize); Vitest form without IAM field + upsert payload; connect path mock/assert no `validate_iam_credentials_file` / no local `describe_cluster_endpoint` with IAM file

**Target Platform**: Desktop Faro (Windows-first)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: One extra bastion SSH exec for describe-cluster before tunnel; same order of magnitude as existing get-token

**Constraints**: Read-only K8s; PEM path-only; no SSO/~/.aws; errors must not leak PEM/token; constitution secret hygiene

**Scale/Scope**: Connect + env form + light DB validation; no new auth identity model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/014-pem-only-live-connect/spec.md` + this plan
- [x] Secrets: PEM path only for operators; no IAM key read at connect; no secret persistence
- [x] No exfiltration (VI): bastion/EKS only; no third-party egress
- [x] Network: user-configured bastion only
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules analyzer: unchanged
- [x] Tests planned for Must-Have stories (US1–US2) + demo/legacy coverage
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after plan/tasks (constitution II wording + HU notes)

**Post-design re-check (Phase 1):** PASS — justified evolution of connect-time IAM file read (see Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/014-pem-only-live-connect/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── env-form-no-iam.md
│   ├── bastion-cluster-discovery.md
│   └── connect-no-local-iam.md
├── checklists/
│   └── requirements.md
└── tasks.md            # /speckit-tasks (later)
```

### Source Code (repository root)

```text
src-tauri/src/
├── k8s/eks_auth.rs              # describe_cluster_endpoint_via_bastion; stop requiring local IAM on live connect
├── commands/connect.rs          # wire bastion describe; remove validate_iam + local describe
├── db/connection_instance.rs    # upsert: iam_credentials_path optional/empty OK
└── ssh/tunnel.rs                # reuse ssh_exec (unchanged contract)

src/
├── components/env/NewEnvironmentModal.tsx  # remove IAM field / browse
├── lib/ipc.ts                              # EnvUpsert types if IAM required today
└── (fixtures / demo helpers as needed)

tests/
├── unit/ / integration/          # form + upsert without IAM
src-tauri/ (cargo tests)          # parse describe JSON; sanitize errors
```

**Structure Decision**: Extend existing bastion SSH exec pattern; no new crates. Prefer empty-string legacy column over destructive DROP COLUMN in v1 of this feature.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution II currently says IAM file is read at connect | Live connect already uses bastion for kube token; local IAM was only for DescribeCluster and expires for colleagues | Keep requiring laptop IAM — fails product goal (PEM-only distribution) |
| Soft-deprecate `iam_credentials_path` instead of DROP | Preserve existing DBs / FR-008 | Hard migration DROP — higher risk, no user value this release |
