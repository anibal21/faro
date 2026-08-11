# Data Model: 019 Fix Keep-Alive Off

## KeepAlivePreference (unchanged keys, stricter OFF behavior)

| State | Stored value | Effective on connect |
|-------|--------------|----------------------|
| Never set | (missing) | ON (018) |
| User ON | `"true"` | ON |
| User OFF | `"false"` | OFF — must not start loop |

## SessionHealth (runtime)

| Field | On disable |
|-------|------------|
| `keep_alive` | **false** (required) |
| `keepalive_cancel` | signaled / cleared |
| `status` | unchanged unless disconnect threshold (not part of toggle OFF) |
| `last_pulse_at` | may remain historically; **not shown in UI** (019) |

## UI projection

| keepAlive | Menu action | Chrome fragment |
|-----------|-------------|-----------------|
| true | No mantener conexión viva | Keep-alive: ON (or Keep-alive ON) |
| false | Mantener conexión viva | Keep-alive: OFF |

No “Último pulso” field in projection.

## Transitions

```text
ON --[No mantener]--> OFF (persist false, stop loop, emit health)
OFF --[Mantener]--> ON (persist true, start loop, emit health)
OFF --[reconnect]--> OFF (no loop)
```
