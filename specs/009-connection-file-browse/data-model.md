# Data Model: Connection file browse

No durable schema changes. Paths continue to live on existing `connection_instance` rows.

## Entities (unchanged durable)

### ConnectionInstance (existing)

| Field | Notes for this feature |
|-------|-------------------------|
| `pem_path` | Absolute path string; may be set via Browse or typing |
| `iam_credentials_path` | Absolute path string; may be set via Browse or typing |
| other fields | Unchanged |

**Validation (existing)**: Non-empty paths; reject secret-looking material in path fields; never store file contents.

## Ephemeral UI entities (form session only)

### PathFieldValue

| Attribute | Type | Rules |
|-----------|------|-------|
| `pemPath` | string | Full absolute path or empty before save |
| `iamCredentialsPath` | string | Full absolute path or empty before save |

### BrowseAvailabilityState

| Attribute | Type | Rules |
|-----------|------|-------|
| `browseBroken` | boolean | `true` after picker invoke throws / unavailable |
| recovery | — | Set `browseBroken=false` when a later Browse invoke opens without throwing (select **or** cancel) |

### PickerResult (ephemeral)

| Outcome | Effect |
|---------|--------|
| Selected file path | Replace corresponding path field with absolute path string |
| Cancel (`null`) | No field change; if dialog opened OK, clear `browseBroken` |
| Error (throw) | Set `browseBroken=true`; no field change; Save blocked |

## State transitions

```text
[healthy] --Browse throws--> [broken] --Browse opens OK--> [healthy]
[healthy] --Browse cancel--> [healthy] (field unchanged)
[healthy] --Browse select--> [healthy] (field = path)
[broken]  --Save attempt--> blocked (message)
[healthy] --Save--> env_upsert(paths only)
```

## Relationships

- Form path fields → persisted on Save via existing `env_upsert` → `connection_instance`
- Picker never creates a stored “file” entity; only feeds path strings
