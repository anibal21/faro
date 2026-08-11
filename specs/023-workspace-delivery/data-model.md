# Data Model: Workspace Delivery Polish

## ConnectionInstance (extended)

| Field | Notes |
|-------|--------|
| Existing profile fields | Unchanged (PEM path, bastion, cluster, …) |
| `color_index` | `0..9` — maps to palette; assigned on create |
| `is_builtin_demo` | May be deleted; restorable via fixture ensure |

**Rules**
- Max **10** rows in `connection_instance` (counting demo if present).
- Creating 11th → error.
- Deleting frees `color_index` for reuse (prefer lowest free).

## EnvColor

| Field | Notes |
|-------|--------|
| `index` | 0–9 |
| `cssVar` | `--env-color-N` with light/dark values |

## ActiveConnection

| Field | Notes |
|-------|--------|
| `instanceId` | Key in runtime `sessions` |
| Cap | **≤ 2** simultaneous |

## WorkspaceTab (extended)

| Field | Notes |
|-------|--------|
| `instanceId` | Required for resource tabs |
| `navKey` | Must include `instanceId` |
| `colorIndex` | Denormalized for tab border |
| `chunks` / kind fields | As today |

## UI prefs (optional)

| Key | Notes |
|-----|--------|
| `ui.sidebarWidth` | px, clamped |

## State transitions

```text
Configs:  empty → create (≤10, assign color) → delete → restore demo via fixture
Sessions: 0 → connect → 1 → connect → 2 → connect 3rd → BLOCKED (modal)
Tabs:     open(resource, instanceId) → unique navKey per instance
Window:   splash → main ≥900×600 min; sidebar width ∈ [200,360]
```
