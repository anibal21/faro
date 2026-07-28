# Data Model: Accordion navigation layout

**Feature**: 002-accordion-nav-layout  
**Date**: 2026-07-27  
**Depends on**: [001 data-model](../001-eks-log-monitor/data-model.md) session catalog (`cached_deployment`, `cached_pod_replica`, `cached_configmap`)

## Overview

This feature is mostly **UI + runtime** state. Persistent SQLite schema from 001 remains authoritative for catalog. New entities below are **session/runtime** (RAM) unless noted.

## Entities

### AccordionSection (UI state)

| Field | Type | Notes |
|-------|------|--------|
| id | `pods` \| `configmaps` | Top-level section |
| expanded | bool | Independent collapse |

### NavItem

| Field | Type | Notes |
|-------|------|--------|
| kind | `deployment` \| `configmap` | Clickable target |
| namespace | string | Required for identity |
| name | string | Workload or ConfigMap name |
| label | string | Display (include ns when ambiguous) |
| secondary | optional string[] | Replica pod names (context only) |

**Identity**: `kind:namespace/name` — tab dedupe key.

### WorkspaceTab

| Field | Type | Notes |
|-------|------|--------|
| tabId | string | UI id |
| navKey | string | `kind:namespace/name` |
| kind | `deployment` \| `configmap` | |
| windowId | string? | Backend follow id for log tabs |
| title | string | Short label |
| focused | bool | One focused at a time |

### WorkloadSummary (runtime / command result)

| Field | Type | Notes |
|-------|------|--------|
| namespace | string | |
| deployment | string | |
| replicaCount | number | Desired or ready count |
| readyReplicas | number? | Optional |
| ramConsumed | string \| null | Human label e.g. `512Mi`; null → N/D |
| cpuConsumed | string \| null | e.g. `250m`; null → N/D |
| uptime | string \| null | e.g. `3d4h`; null → N/D |
| fetchedAt | ISO string | |

**Validation**: Never invent numeric metrics when source missing — leave null.

### LogFanInSession (runtime)

| Field | Type | Notes |
|-------|------|--------|
| windowId | string | |
| namespace | string | |
| deployment | string | |
| podNames | string[] | Replicas being followed |
| cancel | AtomicBool | Cleared only on tab close |

## Relationships

```text
AccordionSection 1──* NavItem
NavItem 1──0..1 WorkspaceTab   (via navKey; at most one open)
WorkspaceTab (deployment) 1──1 LogFanInSession
WorkspaceTab (deployment) 1──1 WorkloadSummary (refreshed on open / optional poll)
```

## State transitions

```text
Nav click → if tab exists: focus
         → else: create tab → (deployment) logs_open + workload_summary
Tab close → logs_close (if any) → remove tab
Disconnect / liveGeneration++ → close all tabs + cancel follows
```

## Persistence

- **Do not** persist log buffers or full summary history in SQLite for v1 of this feature.
- Optional later: cache last summary in session tables — out of scope unless tasks add it.
