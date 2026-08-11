# Contract: Workload metrics visibility

## Rules

| Metric | Visible |
|--------|---------|
| RAM | only if `ramConsumed` non-empty |
| CPU | only if `cpuConsumed` non-empty |
| Uptime | only if `uptime` non-empty |
| Replicas | when summary loaded (existing behavior OK) |

- Do **not** render `RAM: N/D` / `CPU: N/D` / `Uptime: N/D` when missing.
- Join visible metric segments with ` | ` only between shown parts.
- If summary is null: do not show fake triple N/D metrics (prefer loading/empty minimal).
