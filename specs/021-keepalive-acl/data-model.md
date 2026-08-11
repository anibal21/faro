# Data Model: Keep-Alive Toggle ACL

No new persisted domain entities. ACL is **build/load-time configuration**, not SQLite.

## Entities (conceptual)

### Permission entry (`allow-env-set-keep-alive`)

| Field | Meaning |
|-------|---------|
| `identifier` | `allow-env-set-keep-alive` |
| `commands.allow` | `["env_set_keep_alive"]` |
| Scope | Session keep-alive toggle (ON and OFF via `enabled`) |

### Capability grant (default window)

| Field | Meaning |
|-------|---------|
| Capability | Main window default (`default.json`) |
| Permission ref | `"allow-env-set-keep-alive"` |
| Effect | Frontend may `invoke("env_set_keep_alive", …)` |

### Related (unchanged from 017–020)

| Entity | Notes |
|--------|-------|
| Pref `keepalive.<instanceId>` | `"true"` / `"false"`; ACL does not alter schema |
| Health `keepAlive: boolean` | Runtime + UI; set only after successful command |

## Validation rules

1. If `env_set_keep_alive` is registered in `lib.rs`, both permission **and** capability grant MUST exist (FR-001, FR-006).
2. Missing grant ⇒ invoke fails ⇒ UI MUST NOT show durable OFF (FR-004; handled by existing error/revert paths).
3. Capability changes require app restart to take effect (edge case in spec).

## State transitions

```text
[Command registered only]
        │
        ▼ add permission + capability grant + restart
[Toggle authorized]
        │
        ├── enabled=false → keepAlive OFF (runtime + pref)
        └── enabled=true  → keepAlive ON
```
