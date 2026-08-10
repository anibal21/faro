# Research: 018 Keep-Alive Toggle Chrome & Desktop Overscroll

## R1 — Default keep-alive ON when preference missing

**Decision**: Treat **absent** `keepalive.<instanceId>` as **ON**. Only an explicitly stored `"false"` (or equivalent) means OFF. On successful live `env_connect`, if pref is missing/ON, start the keep-alive loop (same as 017 when `want_keepalive`).

**Rationale**: Spec FR-001 / user request; 017 used `unwrap_or(false)` which made first connect never start keep-alive unless the user toggled — and the menu looked stuck.

**Alternatives considered**:
- Always write `"true"` on every connect — works but overwrites less clearly; still need “missing ⇒ ON” semantics for reads.
- Global app setting — out of scope; per-env remains.

## R2 — Menu copy = next action

**Decision**: Label mapping:
| Current `keepAlive` | Menu label |
|---------------------|------------|
| `true` | `No mantener conexión viva` |
| `false` | `Mantener conexión viva` |

Click calls `env_set_keep_alive(id, !current)` then refreshes health state (and/or optimistic local patch).

**Rationale**: Matches user mental model; SC-001/SC-002.

**Alternatives considered**: Checkbox with checkmark — not requested this increment.

## R3 — “Click does nothing” root cause

**Decision**: Fix as a combo of:
1. Ensure post-connect `health.byId` reflects `keepAlive: true` when loop started (poll/event).
2. After `envSetKeepAlive`, **always** `refresh()` and optionally **optimistic** update of `byId[id].keepAlive` so the next open menu shows the flipped label even if poll lags.
3. Prefer `ContextMenuItem` `onSelect` that does not swallow errors; surface failures via existing connection/error UI if invoke fails.
4. Avoid relying on stale `!(healthById[id]?.keepAlive ?? false)` alone without refresh — after default ON, connected sessions must report `keepAlive` from Rust.

**Rationale**: User-reported no-op is likely stale UI and/or default OFF so “enable” appeared to work visually only if refresh failed; making default ON + optimistic update makes success/failure obvious.

**Alternatives considered**: Separate toast on every toggle — optional; prefer label change as primary feedback (FR-005).

## R4 — Desktop overscroll / pull-to-refresh

**Decision**: Apply CSS on `html`, `body`, and `#root` (and main shell wrapper if needed):

```css
html, body, #root {
  overscroll-behavior: none;
  overflow: hidden;
  height: 100%;
}
```

Keep `overflow: auto` / `overflow-y: auto` on **inner** panels (tree, logs). If WebView2 still rubber-bands the window, add `overscroll-behavior-y: none` on `.main-shell` and verify; only then consider WebView env flags.

**Rationale**: Standard desktop-webview pattern; preserves FR-007 panel scroll.

**Alternatives considered**:
- Disable touch entirely — too aggressive.
- JS `touchmove` preventDefault — fragile; CSS first.

## R5 — Preference API shape

**Decision**: Add `get_keepalive_pref_opt` → `Option<bool>` **or** change `get_keepalive_pref` to accept/default `true` when row missing. Connect path: `want_keepalive = get…unwrap_or(true)` for live; demo unchanged.

**Rationale**: Minimal API churn; tests assert missing key ⇒ true, explicit false ⇒ false.

## R6 — Docs / HU

**Decision**: Small note under HU25 or ticket 018 polish — default ON + labels + overscroll; full new HU optional. Sync in `/speckit-tasks` / implement polish tasks.

**Rationale**: Incremental polish on 017, not a new product surface.
