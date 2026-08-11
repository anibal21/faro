# Implementation Plan: Workspace catalog & UI polish

**Branch**: `011-workspace-catalog-ux` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-workspace-catalog-ux/spec.md` (clarify session 2026-07-29)

**Note**: Optional pre-hook `/speckit-wireframe-review` skipped unless user runs it (no signed-off wireframes for 011).

## Summary

Polish the connected workspace: fill the workload summary strip from **provisioned** one-pod requests/limits (`request / limit`) plus real replica/uptime status; fix stick-to-bottom label grouping; add thin themed scrollbars; indent catalog children; Spanish follow status; export Raw logs and ConfigMaps via native save dialog; expand the left tree to **Deployments → Pods → Services → ConfigMaps** with correct open behaviors (Deployment fan-in logs, Pod-scoped logs, Service read-only detail, ConfigMap as today).

## Technical Context

**Language/Version**: TypeScript/React · Rust/Tauri 2 (kube catalog + workload summary)

**Primary Dependencies**: Existing Faro UI (`EnvTreeNav`, `LogWindow`, `WorkloadSummaryStrip`); `@tauri-apps/plugin-dialog` (`save` + existing `open`); kube client for Deployment/Pod/Service/ConfigMap reads; session catalog cache

**Storage**: No SQLite log dumps. Export writes only operator-chosen local text files. Session cache may gain Services (+ flat Pods list exposure) without secret material.

**Testing**: Vitest for scrollbar CSS presence, stick layout, Spanish status mapping, export content builders, tree section order; cargo tests for provisioned `request/limit` aggregation and Spanish status strings; manual quickstart for live catalog/export

**Target Platform**: Desktop Faro (Windows-first)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Catalog sections load without blocking other sections on partial RBAC failure; summary fill within normal connect latency; export of in-memory buffer completes without UI freeze for typical buffers

**Constraints**: Read-only kube; RAM/CPU = one pod template (sum containers), not live metrics, not × replicas; log export = Raw buffer only; constitution VI — local save only, no third-party upload

**Scale/Scope**: Four catalog sections; summary strip; toolbar/CSS polish; export on log + ConfigMap tabs; Service detail tab

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/011-workspace-catalog-ux/spec.md` + this plan
- [x] Secrets: export excludes PEM/IAM/tokens; dialog save is local path only
- [x] No exfiltration (VI): user-chosen local file only; no SaaS upload
- [x] Network: only user bastion/EKS
- [x] Read-only K8s: list/get Deployments, Pods, Services, ConfigMaps + pod logs; no mutate
- [x] Local SQLite + rules analyzer unchanged for analysis; no full log dump persistence
- [x] Tests planned per Must-Have stories
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU19 / tickets)

**Post-design re-check (Phase 1):** PASS — contracts stay local; export is operator-initiated file write.

## Project Structure

### Documentation (this feature)

```text
specs/011-workspace-catalog-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── catalog-nav-ui.md
│   ├── workload-summary.md
│   └── export-text.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/catalog/EnvTreeNav.tsx     # 4 sections + indentation
├── components/catalog/ServiceDetailTab.tsx  # NEW
├── components/logs/WorkloadSummaryStrip.tsx
├── views/LogWindow.tsx                   # stick CSS; Export; Spanish status display
├── hooks/useCatalog.ts / useConfigMaps.ts / useWorkspaceTabs.ts
├── lib/fileExport.ts                     # NEW — saveTextFile via dialog.save
├── lib/ipc.ts                            # list pods/services; summary fields
└── styles/workspace.css / index.css      # scrollbars; stick; tree indent

src-tauri/src/
├── k8s/metrics.rs                        # live provisioned summary from Deployment
├── k8s/catalog.rs                        # hydrate Services; expose Pods flat
├── k8s/logs.rs                           # Spanish status strings; pod-scoped open
├── commands/catalog.rs / workload.rs / logs.rs
└── capabilities/default.json             # dialog:allow-save

tests/
├── unit/workload_summary_format.spec.ts
├── unit/stick_layout.spec.tsx
├── unit/scrollbar_theme.spec.ts
├── unit/catalog_section_order.spec.tsx
├── unit/export_raw.spec.ts
└── unit/follow_status_es.spec.ts
```

**Structure Decision**: Extend EnvTreeNav + catalog hydration; deepen `live_summary` from Deployment pod template; reuse dialog plugin with `save`; add Service detail tab parallel to ConfigMap.

## Complexity Tracking

> No constitution violations requiring justification.
