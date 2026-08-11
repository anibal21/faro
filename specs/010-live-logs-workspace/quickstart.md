# Quickstart: Live logs workspace UX

## Prerequisites

- Faro desktop: `npm run tauri dev`
- For live checks: operator environment that already connects (bastion + cluster); optional demo env for offline UI checks
- Contracts: [logs-session.md](./contracts/logs-session.md), [log-workspace-ui.md](./contracts/log-workspace-ui.md)
- Model: [data-model.md](./data-model.md)

## Validate stick-to-bottom

1. Open a Deployment log tab (demo or live).
2. Confirm stick-to-bottom / auto-scroll control defaults **on**.
3. With follow producing lines (demo stream or live app logs), viewport stays at newest.
4. Scroll **up** → control turns **off**; new lines do not yank viewport.
5. Turn control **on** again → jumps to newest.

## Validate load older (~500 / pod)

1. Open a live Deployment with pods that have more than ~500 lines of history.
2. Note initial content ≈ last 500/pod.
3. Click **Load older** (or Spanish equivalent) once → older content prepends; reading position preserved if you were mid-scroll.
4. Repeat until UI indicates beginning reached; further clicks do nothing useful / control disabled.
5. Confirm follow still appends new lines after paging.

## Validate Structured write-groups

1. Open logs containing a Spring-style ERROR + stack frames.
2. Structured shows stack as **one** clickable group; INFO lines separate.
3. Click error group → local analysis runs (no external AI).

## Validate ConfigMap full height

1. Open a ConfigMap tab.
2. Content area fills main pane height; scroll inside content if needed.
3. Confirm **no** large empty lower analysis panel.
4. Switch to a Deployment log tab → analysis UI available again; switch back → ConfigMap still full height.

## Automated checks

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

Expect coverage for stick-to-bottom, load-older viewport preserve, ConfigMap layout, and existing structured grouping tests.
