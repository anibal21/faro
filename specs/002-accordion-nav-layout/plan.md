# Implementation Plan: Accordion navigation layout

**Branch**: `002-accordion-nav-layout` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-accordion-nav-layout/spec.md`

**Note**: UI/layout evolution on top of `001-eks-log-monitor`. Wireframes for this feature SHOULD be generated before implement (`/speckit-wireframe-generate`); none signed off yet at plan time.

## Summary

Replace the three-column catalog chrome with a **left accordion** (Pods / ConfigMaps), **click-to-open** items (no “Abrir logs” / buscador), and a **wide main tab workspace**. Clicking a Pods workload opens **one tab** with **combined live logs from all replicas**, keeps **background follow** on inactive tabs, and shows a **compact summary strip** (replica count, RAM, CPU, uptime) under the tab chrome. ConfigMaps open as tabs in the same strip. Builds on existing Tauri IPC, session catalog, and log events from feature 001.

## Technical Context

**Language/Version**: TypeScript (ES2022+) · Rust (edition 2021) — same as Faro app

**Primary Dependencies**: Tauri 2 · React · Vite · existing `commands` / `k8s` / `db` / `runtime` modules; no new SaaS deps

**Storage**: Existing SQLite durable + session tiers. This feature adds **UI/runtime state** for tabs + summary; may extend session cache or ephemeral structs for workload summary fields (see [data-model.md](./data-model.md)). No full log dumps in SQLite.

**Testing**: Vitest (accordion/tabs/dedupe) · `cargo test` (workload summary + multi-replica follow stubs) · ≥1 integration/E2E path: connect → click workload → combined logs + summary strip

**Target Platform**: Desktop Faro (Win/macOS/Linux) — same packages as 001

**Project Type**: Desktop application (Tauri hybrid) — layout/UX increment

**Performance Goals**: Inactive log tabs keep following without freezing UI; ring buffer per tab (reuse ≤500 chunks); summary refresh does not block log paint

**Constraints**: Constitution VI; read-only K8s; no buscador in accordion; no “Abrir logs” button; metrics best-effort with **N/D** when unavailable; no mutating APIs

**Scale/Scope**: 4 user stories (US1–US4 in this spec); refactor MainShell / catalog / LogWindow; IPC deltas for workload-scoped open + summary

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: scope covered by `specs/002-accordion-nav-layout/spec.md` + this plan
- [x] Secrets: no PEM/IAM bodies; reuse path-only environments from 001
- [x] No exfiltration (VI): no third-party egress of logs/metrics/user data
- [x] Network: only user-configured bastion/EKS for product function
- [x] Read-only K8s in v1: summary + logs are get/list/watch/log only
- [x] Local SQLite + rules-based analyzer unchanged (analyze stays on click)
- [x] Tests planned: unit/integration + primary accordion→tab flow
- [x] Desktop demonstrable; public URL not required
- [x] AI4Devs docs sync planned (`1`/`2`/`5` UX; `6` after tasks)

**Post-design re-check (Phase 1):** PASS — metrics/summary are local RO observations; IPC only; no log export; N/D placeholders avoid inventing values.

## Project Structure

### Documentation (this feature)

```text
specs/002-accordion-nav-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-ia.md
│   └── ipc-layout.md
├── checklists/
│   └── requirements.md
└── tasks.md              # NOT created by /speckit-plan
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── catalog/
│   │   ├── AccordionNav.tsx          # NEW — Pods/ConfigMaps accordion
│   │   ├── DeploymentsRail.tsx       # REMOVE or shrink → replaced by AccordionNav
│   │   ├── ConfigMapsPanel.tsx       # REMOVE right rail; detail moves into tabs
│   │   └── CatalogFilter.tsx         # REMOVE (no buscador)
│   ├── logs/
│   │   ├── WorkloadSummaryStrip.tsx  # NEW — replicas/RAM/CPU/uptime
│   │   ├── StructuredLogView.tsx
│   │   └── RawLogView.tsx
│   └── ...
├── views/
│   ├── MainShell.tsx                 # layout: accordion | main tabs
│   └── LogWindow.tsx                 # shared tab strip + summary
├── hooks/
│   ├── useCatalog.ts
│   ├── useConfigMaps.ts
│   ├── useLogWindows.ts              # dedupe by workload key; background follow
│   └── useWorkspaceTabs.ts           # NEW optional — unified pod+cm tabs
└── styles/workspace.css

src-tauri/src/
├── commands/
│   ├── logs.rs                       # open by namespace+deployment; multi-pod follow
│   ├── catalog.rs
│   └── workload.rs                   # NEW — workload_summary command
├── k8s/
│   ├── logs.rs                       # fan-in chunks from all replica pods
│   └── metrics.rs                    # NEW — best-effort summary fields
└── runtime.rs                        # track follows per window_id
```

**Structure Decision**: Single Tauri app at repo root (same as 001). This feature is primarily frontend IA + log fan-in + summary IPC; no new crate.

## Complexity Tracking

> No constitution violations requiring justification.
