# Contract: Cold-start window

## Purpose

Avoid white WebView flash before branded splash.

## Behavior

`tauri.conf.json` → `app.windows[main]`:

- `visible`: `false`
- `backgroundColor`: `#0a192f` (splash fallback)

Frontend:

1. Apply splash geometry.
2. Preload splash image.
3. Wait ≥2 animation frames.
4. `show()` (+ focus) via window API.

Permissions: `core:window:allow-show`, `core:window:allow-set-focus`.

`index.html` inline CSS: `html, body, #root { background-color: #0a192f }`.

## Non-goals

- Changing splash dwell duration (005/006).
- Authenticode / SmartScreen.
