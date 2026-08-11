# Contract: Window size and app icons (006)

## Default window (`tauri.conf.json`)

| Property | Required value |
|----------|----------------|
| `app.windows[0].width` | `1400` |
| `app.windows[0].height` | `900` |
| `app.windows[0].resizable` | `true` |
| `app.windows[0].decorations` | `false` (unchanged from 005) |

## Bundle icons

`bundle.icon` MUST list existing files under `icons/`, typically:

- `icons/32x32.png`
- `icons/128x128.png`
- `icons/128x128@2x.png`
- `icons/icon.icns`
- `icons/icon.ico`

Audit: each path exists; artwork matches the newly loaded Faro icon set.

## Verification

```bash
# Files exist
Test-Path src-tauri/icons/icon.ico
# Conf size
# (see quickstart)
```
