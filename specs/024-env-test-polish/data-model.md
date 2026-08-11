# Data Model: Env Test Polish

## EnvColor (revised)

| Field | Notes |
|-------|--------|
| `index` | 0–9 |
| `hex` | Single color used in light and dark |

No separate light/dark variants.

## ConnectionInstance (optional extension)

| Field | Notes |
|-------|--------|
| `is_test_fixture` (optional bool) | True when created/updated via “Usar fixtures”; drives Demo hydrate on connect |

Alternatively derive from `pem_path` ending with `fixtures/demo.pem` — document chosen approach in implement.

## WorkloadSummary (visibility)

| Field | Show when |
|-------|-----------|
| `ramConsumed` | non-empty |
| `cpuConsumed` | non-empty |
| `uptime` | non-empty |
| replicas | when summary object present |

## UI state

No new persisted entities for checkbox layout.
