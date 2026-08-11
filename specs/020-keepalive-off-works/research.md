# Research: 020 Keep-Alive Off Must Work

## R1 — Why 019 can still look “broken” in real use

**Decision**: Treat remaining failure as one or more of:

1. **IPC argument shape risk** — command takes `payload: SetKeepAliveInput` while Tauri 2 docs prefer top-level keys matching parameter names. Nested `payload` works for other commands, but disable is the critical boolean path; flatten to `instanceId` + `enabled` to remove ambiguity.
2. **Context menu activation** — Radix `ContextMenuItem` `onSelect` can be flaky in WebView2 (focus/portal). Bind a reliable handler (`onSelect` + `onPointerDown`/`onClick` pattern, or preventDefault where needed) so the disable action always fires.
3. **UI sync** — optimistic OFF then `refresh()` must read `keepAlive: false` from Rust; if stop fails or emit/refresh races, ON returns. Keep stop authoritative + emit OFF; after disable, trust returned `{ keepAlive: false }` before/alongside refresh.
4. **Silent errors** — ensure invoke failures surface (alert already in MainShell); do not swallow.

**Rationale**: User reports 019 still broken; unit label tests pass without real IPC/WebView. Need end-to-end path hardening + FR-007 mock proof.

**Alternatives considered**:
- Only add logging — insufficient.
- Move control out of context menu to a permanent toggle — optional follow-up; not required if menu click is fixed.

## R2 — Flatten `env_set_keep_alive` IPC

**Decision**: Change Rust signature to:

```text
env_set_keep_alive(app, db, runtime, instance_id: String, enabled: bool)
```

Frontend:

```text
invoke("env_set_keep_alive", { instanceId, enabled })
```

(Tauri maps camelCase ↔ snake_case for **argument names**.)

**Rationale**: Matches [Tauri 2 calling Rust](https://v2.tauri.app/develop/calling-rust/); avoids nested struct edge cases for the boolean that must arrive as `false`.

**Alternatives considered**: Keep nested `payload` with extra logging — higher residual risk.

## R3 — Context menu click reliability

**Decision**: On the keep-alive `ContextMenuItem`, ensure the handler runs on user activation in WebView2 (e.g. `onSelect` that calls disable/enable; if needed also `onClick`). Capture `enabled` target (`!keepAliveOn`) at click time in a local const. Do not rely on menu staying open.

**Rationale**: Vitest fires `onSelect`; users may not get the same event path.

## R4 — Post-disable state source of truth

**Decision**: After successful invoke returning `keepAlive: false`, patch `byId` from the **command result** immediately, then refresh. Never leave UI dependent only on a later pulse event. Preferenced `"false"` must prevent `start_loop` on reconnect (already 018/019).

**Rationale**: SC-001–SC-003.

## R5 — Automated evidence (FR-007)

**Decision**: Add Vitest that mocks `envSetKeepAlive` / `envConnectionStates` and asserts after “disable” the hook/UI state has `keepAlive: false`. Cargo keeps stop/unit coverage from 019.

**Rationale**: Spec SC-005 / FR-007.

## R6 — Out of scope

- Changing default-ON on first connect.
- Pulse interval / failure threshold.
- Removing Keep-alive ON|OFF chrome (019 UI trim stays).
