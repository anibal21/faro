# Implementation Plan: Live logs workspace UX

**Branch**: `010-live-logs-workspace` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-live-logs-workspace/spec.md` (clarify session 2026-07-29)

**Note**: Optional pre-hook `/speckit-wireframe-review` skipped unless user runs it (no signed-off wireframes yet for 010).

## Summary

Document and finish the live Deployment log workspace: continuous follow with ~500-line initial tail per pod + fan-in (largely already in tree), Spring Boot **write-groups** in Structured, bastion-identity token path (documented), plus the remaining UX gaps — **stick-to-bottom switch** (default on; auto-off on scroll up), **load older ~500 lines per pod** with viewport preservation, and **ConfigMap tabs** that fill main-pane height without empty analysis chrome.

## Technical Context

**Language/Version**: TypeScript/React (UI) · Rust/Tauri 2 (kube log streams + new load-older command)

**Primary Dependencies**: Existing Faro UI (`LogWorkspace`, `RawLogView`, `StructuredLogView`, `ConfigMapTab`, `useWorkspaceTabs`); kube client log API (`follow`, `tail_lines`); Tauri events `logs_chunk` / status

**Storage**: No durable log dumps (constitution IV). Ephemeral per-tab: chunks, `stickToBottom`, per-pod history depth / exhaustion flags. SQLite unchanged for this feature.

**Testing**: Vitest + Testing Library for stick-to-bottom / scroll-preserve / ConfigMap layout; cargo unit tests where load-older paging logic lives; extend structured-group tests if needed; manual quickstart for live follow + load-older

**Target Platform**: Desktop Faro (Windows-first; macOS/Linux same)

**Project Type**: Desktop Tauri hybrid — React workspace + Rust k8s log sessions

**Performance Goals**: New follow lines visible within a few seconds (SC-001); UI stays responsive with bounded in-memory chunks (existing ~2000 cap); load-older completes without freezing the main thread (Rust async + FE prepend)

**Constraints**: Read-only kube logs; no secret persistence; page size ~500 lines/pod; stick-to-bottom per tab only; fan-in order remains arrival-order (deferred refine); ConfigMap must not show Deployment analysis drawer footprint

**Scale/Scope**: Deployment log tabs + ConfigMap tabs in existing workspace; one new IPC (`logs_load_older` or equivalent); UI controls on log toolbar

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/010-live-logs-workspace/spec.md` + this plan
- [x] Secrets: no PEM/IAM/token persistence; errors must not expose tokens
- [x] No exfiltration (VI): logs stay in-process RAM; only user bastion/EKS
- [x] Network: only configured bastion + EKS via existing tunnel
- [x] Read-only K8s: get/list pods + pod logs only (including one-shot history fetches)
- [x] Local SQLite + rules analyzer unchanged (click-to-analyze stays local rules)
- [x] Tests planned: stick-to-bottom, load-older viewport, ConfigMap height; structured groups already covered
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU/tickets for stick-to-bottom, load-older, ConfigMap layout)

**Post-design re-check (Phase 1):** PASS — contracts are path/session local; no new egress; ephemeral buffers only.

## Project Structure

### Documentation (this feature)

```text
specs/010-live-logs-workspace/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── logs-session.md
│   └── log-workspace-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
src/
├── hooks/useWorkspaceTabs.ts          # stickToBottom; load-older state; chunk prepend
├── views/LogWindow.tsx                # Deployment → LogWorkspace; ConfigMap → ConfigMapTab
├── components/logs/
│   ├── LogWorkspace.tsx               # toolbar: stick switch + load older; analysis drawer only here
│   ├── RawLogView.tsx                 # scroll container + stick / preserve behaviors
│   ├── StructuredLogView.tsx          # same scroll contract; existing write-groups
│   └── AnalysisDrawer.tsx             # Deployment-only (unchanged role)
├── components/catalog/ConfigMapTab.tsx
└── styles/workspace.css               # full-height ConfigMap / log panes

src-tauri/src/
├── k8s/logs.rs                        # follow + NEW older-page fetch per pod
└── commands/logs.rs                   # logs_open / logs_close + NEW logs_load_older

tests/
├── unit/structured_log_groups.spec.ts # existing
├── unit/stick_to_bottom.spec.tsx      # NEW
├── unit/load_older_viewport.spec.tsx  # NEW (scrollHeight delta)
└── unit/configmap_layout.spec.tsx     # NEW (full height / no analysis chrome)
```

**Structure Decision**: Extend existing live-log pipeline and workspace components. No new top-level apps. History paging is a one-shot kube log read per pod layered beside the active follow stream; UI owns stick-to-bottom and viewport math.

## Complexity Tracking

> No constitution violations requiring justification.
