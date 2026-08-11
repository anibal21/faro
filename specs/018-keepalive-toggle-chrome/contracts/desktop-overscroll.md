# Contract: Desktop overscroll

## Goal

Root document / app shell MUST NOT exhibit elastic overscroll or pull-to-refresh-like vertical bounce of the entire UI.

## Required CSS (or equivalent)

Apply to document roots (`html`, `body`, app mount node) and optionally `.main-shell`:

- `overscroll-behavior: none` (or `overscroll-behavior-y: none`)
- Root `overflow: hidden` with `height: 100%` so only **inner** scroll regions scroll

## Allowed

- `overflow: auto` / `overflow-y: auto` on catalog tree, log panes, modals, drawers

## Verification

1. Drag/scroll past top of shell → no whole-window bounce.
2. Long log list still scrolls inside its pane.
