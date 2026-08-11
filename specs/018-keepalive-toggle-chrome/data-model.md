# Data Model: 018 Keep-Alive Toggle Chrome

## Entities

### KeepAlivePreference (existing, semantics change)

| Field | Type | Notes |
|-------|------|--------|
| key | string | `keepalive.<instanceId>` in `ui_preferences` |
| value | `"true"` \| `"false"` | Stored only when user toggles or connect materializes default |

**Effective value**:
- Row missing → **ON** (`true`) for live sessions
- `"false"` / `"0"` / `"no"` → OFF
- `"true"` / `"1"` / `"yes"` → ON

**Transitions**:
1. First live connect, no row → behave as ON; optionally write `"true"` so later reads are explicit.
2. User chooses “No mantener…” → write `"false"`, stop loop.
3. User chooses “Mantener…” → write `"true"`, start loop.
4. Demo → no preference writes for keep-alive.

### MenuActionLabel (UI projection)

| keepAlive | label |
|-----------|--------|
| true | No mantener conexión viva |
| false | Mantener conexión viva |

### SessionHealth (unchanged from 017)

`status`, `keepAlive`, `lastPulseAt`, `mode` — UI must refresh after toggle so `keepAlive` matches preference.

## Validation

- Demo instance ids never enable keep-alive.
- Toggle only when session is connected live (or reconnect path after restore).

## Relationships

`ConnectionInstance` 1—0..1 `KeepAlivePreference`  
`SessionEntry.health.keep_alive` mirrors effective preference while connected and loop running.
