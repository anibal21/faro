# Contract: Layout resize & window minima

## Window (main / ready)

| Property | Value |
|----------|--------|
| Default size | 900 × 600 |
| Minimum size | 900 × 600 (`setMinSize` after `applyMainWindowGeometry`) |
| Resizable | true after ready |
| Splash | unchanged 576×324 non-resizable |

## Sidebar

| Property | Value |
|----------|--------|
| Default width | 240px (`w-60` equivalent) |
| Min width | 200px |
| Max width | 360px |
| Interaction | Drag handle on right edge of aside |
| Persistence | Optional pref `ui.sidebarWidth` |

## Content panel

Center column must remain usable at window min + sidebar max (no overlap of menubar/tabs; `min-w-0` flex as today).

## Non-goals

Changing splash size; multi-window.
