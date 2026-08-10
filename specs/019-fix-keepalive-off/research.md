# Research: 019 Fix Keep-Alive Off & Drop Pulse Line

## R1 — Why OFF appears stuck at keepAlive: true

**Decision**: Treat the defect as a **runtime/UI sync failure on disable**, not a product-rule change. Primary hardening:

1. **`stop_loop` must be authoritative**: cancel flag + `health.keep_alive = false` using reliable `AppHandle` state access (prefer `app.state` / same path as `start_loop`, not a silent no-op if `try_state` misses).
2. **Emit `session-health` immediately on disable** with `keepAlive: false` so the frontend listener cannot remain on a stale ON from the last pulse.
3. **After a long pulse**, re-check `keep_alive` (and cancel) before treating the session as still keep-alive ON when emitting; never set `keep_alive = true` outside `start_loop`.
4. **UI**: stop using `keepAlive ?? true` as the toggle/display default when it can mask OFF or fight events; drive labels from the last known explicit boolean after connect/toggle. Show **Keep-alive: ON|OFF** explicitly.
5. **Verify IPC**: `envSetKeepAlive(id, false)` must send JSON `enabled: false` (not dropped); confirm command persists `"false"` then stops loop.

**Rationale**: Observed symptom (always ON) matches “pref/stop not reflected in UI” or “event/refresh reasserts true while loop still alive”. Emitting OFF on stop + reliable stop closes both gaps.

**Alternatives considered**:
- Only optimistic UI without Rust fix — insufficient (SC-001/002).
- Remove keep-alive feature — out of scope.

## R2 — Persist OFF across reconnect

**Decision**: Keep 018 semantics: missing key ⇒ ON on first live connect; **explicit `"false"` ⇒ OFF** and must not rematerialize `true` on connect. After disable, `set_keepalive_pref(..., false)` already runs first in `env_set_keep_alive`; verify reconnect uses `get_keepalive_pref_opt` → `Some(false)` and **does not** call `start_loop`.

**Rationale**: Spec scenario 4.

## R3 — Remove Último pulso from chrome

**Decision**: Delete `pulseLabel` rendering (and helper if unused) from `EnvTreeNav`. Keep optional `lastPulseAt` in IPC/events for diagnostics/future; do not show it. Status line shows session state + **Keep-alive: ON|OFF** only.

**Rationale**: Spec US2 / FR-005–006.

**Alternatives considered**: Hide only when OFF — rejected; user wants it gone entirely.

## R4 — Tests

**Decision**:
- Cargo: unit/integration-style test around stop transition (apply stop → `keep_alive` false; optionally emit payload).
- Vitest: after simulating health `keepAlive: false`, menu shows **Mantener conexión viva**; chrome has no `/Último pulso/i`; ON case still shows **No mantener…** and Keep-alive ON/OFF text.

## R5 — Out of scope

- Changing 60s interval or 3-failure threshold.
- Changing default-ON for first connect without pref (018).
