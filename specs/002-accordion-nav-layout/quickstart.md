# Quickstart validation: 002-accordion-nav-layout

**Purpose**: Prove accordion layout + multi-replica tabs after implement.

## Prerequisites

- Faro builds (`npm run tauri dev`)
- Feature 001 connect/demo fixtures available (`Usar fixtures demo`)
- Spec + plan for `002-accordion-nav-layout` approved

## Setup

```text
npm install
npm run tauri dev
```

## Validation scenarios

### V1 — Accordion chrome (US1)

1. Connect with demo fixtures.
2. Expect left accordion with **Pods** and **ConfigMaps** only (no buscador, no right ConfigMaps rail).
3. Expand/collapse each section independently.
4. Main area occupies most of the width.

### V2 — Click workload → combined logs + summary (US2)

1. Expand Pods → click `payments-api` (or equivalent).
2. Expect **one** tab; log body shows lines from **multiple** replica pod names.
3. Expect summary under tab: replica count, RAM, CPU, uptime (or N/D).
4. Confirm **no** “Abrir logs” button anywhere.

### V3 — Tabs dedupe + background follow (US2)

1. Open workload A, then workload B.
2. Expect two tabs; re-click A focuses without a third tab.
3. Stay on B ≥10s, return to A → new lines appeared (background follow).

### V4 — ConfigMap tab (US3)

1. Expand ConfigMaps → click an item.
2. Expect RO detail in a tab in the **same** strip; re-click focuses, no duplicate.

### V5 — Empty / disconnect (US4)

1. Disconnect → accordion empty/hint; tabs closed or cleared.
2. Collapse both sections → only headers remain.

## Expect

See [contracts/ui-ia.md](./contracts/ui-ia.md) and [contracts/ipc-layout.md](./contracts/ipc-layout.md).
