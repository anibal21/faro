# Quickstart: Env Test Polish (024)

## Prerequisites

- `specs/024-env-test-polish/` artifacts
- `npm run tauri dev`

## Automated

```bash
npx vitest run tests/unit/env_colors_fixed.spec.ts tests/unit/workload_summary_visibility.spec.tsx tests/unit/stick_to_bottom_layout.spec.tsx
```

## Manual

### V1 — Colors
1. Note env color bars/tabs in light theme.
2. Switch to dark — same colors; still distinct.

### V2 — Multi fixture envs
1. Create/restore two envs with fixtures.
2. Connect both (≤2).
3. Each shows test catalog; open same deploy name on both → two tabs.

### V3 — Pegar al final
1. Open log tab; confirm checkbox sits next to “Pegar al final” on the right.

### V4 — Metrics
1. Summary without metrics → no RAM/CPU/Uptime text.
2. Demo/live with metrics → only present fields show.

## Contracts

See `contracts/*.md`.
