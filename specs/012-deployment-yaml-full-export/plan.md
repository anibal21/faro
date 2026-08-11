# Implementation Plan: Deployment YAML, Pod Logs & Full Export

**Branch**: `012-deployment-yaml-full-export` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-deployment-yaml-full-export/spec.md` (clarify session 2026-07-30)

**Note**: Optional pre-hook `/speckit-wireframe-review` available; no signed-off wireframes required to plan.

## Summary

Change catalog open semantics: **Deployments → read-only YAML only** (new tab kind; no log follow). **Pods → restore prior multi-replica fan-in** when the pod has a Deployment owner (open any replica → follow all siblings with per-pod attribution); orphans stay single-pod. Keep summary RAM/CPU from Deployment template (already provisioned `request / limit`). On **Export**, exhaust older history via paging for the tab’s pods, then write Raw text (progress + abort; no SQLite dump). Remove non-actionable **“iniciando”** chrome.

## Technical Context

**Language/Version**: TypeScript/React · Rust/Tauri 2 (`kube` get Deployment + logs)

**Primary Dependencies**: Existing `EnvTreeNav`, `useWorkspaceTabs`, `logs_open` / `logs_load_older`, `workload_summary`, `fileExport.saveTextFile`; new `k8s_get_deployment_yaml` (or equivalent) command; serde_yaml or kube JSON→YAML for document text

**Storage**: No durable log/YAML dumps in SQLite. Export = operator-chosen local `.txt` only. Session cache may store non-secret Deployment metadata already used for catalog.

**Testing**: Vitest — Deployment open routes to YAML tab (not logs); Pod open with owner fans in (no `podName` filter / correct navKey reuse); export gather-then-write mocks; no “iniciando” in LogWindow toolbar. Cargo — Deployment YAML serialization smoke; exhaust load-older loop unit helper if extracted.

**Target Platform**: Desktop Faro (Windows-first)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Deployment YAML open &lt; 10s typical; fan-in follow shows multi-pod lines &lt; 30s; export gather shows progress and remains abortable (large histories may take minutes)

**Constraints**: Read-only kube; Deployments never start follow; export exhausts cluster-retained history only (not infinite past); constitution VI — local file only; no live metrics-server

**Scale/Scope**: One new YAML tab type; remapped Pod/Deployment open; export exhaust path; status chrome cleanup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/012-deployment-yaml-full-export/spec.md` + this plan
- [x] Secrets: YAML/logs/export never include PEM/IAM; errors sanitized
- [x] No exfiltration (VI): local save only; no third-party upload
- [x] Network: only user bastion/EKS
- [x] Read-only K8s: get Deployment, get/list pods, get logs; no mutate/apply
- [x] Local SQLite + rules analyzer unchanged; no full log persistence
- [x] Tests planned per Must-Have stories (US1–US4); US5 unit/assert
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU20 / tickets)

**Post-design re-check (Phase 1):** PASS — contracts are local IPC/UI only; export remains user-initiated file write after exhaust gather.

## Project Structure

### Documentation (this feature)

```text
specs/012-deployment-yaml-full-export/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── deployment-yaml.md
│   ├── pod-fanin-logs.md
│   ├── export-exhaust.md
│   └── status-chrome.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src-tauri/src/
├── commands/catalog.rs          # k8s_get_deployment_yaml (NEW)
├── k8s/catalog.rs               # get Deployment → YAML string (demo + live)
├── k8s/logs.rs                  # fan-in unchanged; ensure owner open without pod filter
└── permissions / capabilities   # allow new command

src/
├── components/catalog/
│   ├── EnvTreeNav.tsx           # wire Deployment → YAML; Pod → fan-in
│   └── DeploymentYamlTab.tsx    # NEW — read-only YAML viewer
├── components/logs/WorkloadSummaryStrip.tsx  # confirm template metrics on fan-in tabs
├── hooks/useWorkspaceTabs.ts    # openDeployment → YAML; openPod → fan-in owner; no iniciando
├── views/LogWindow.tsx          # YAML branch; export exhaust; drop iniciando display
├── lib/fileExport.ts            # optional gather orchestration helpers
└── lib/ipc.ts                   # k8sGetDeploymentYaml; types

tests/unit/ …                    # yaml tab routing, fan-in open, export exhaust, status
```

**Structure Decision**: Extend existing Faro hybrid layout; no new app package. Demo fixtures gain Deployment YAML samples aligned with payments-api / payments-worker.

## Complexity Tracking

> No constitution violations requiring justification.
