# Contract: macOS updater bundles

## Purpose

Ensure macOS CI emits both installer DMG and updater archive for `darwin-x86_64`.

## Behavior

```text
npm run tauri build -- --target x86_64-apple-darwin --bundles app,dmg
```

Mandatory outputs under target bundle:

- `dmg/*.dmg`
- `macos/*.app.tar.gz`
- `macos/*.app.tar.gz.sig` (when signing env set)

## Errors

- Building with `--bundles dmg` only → missing `.app.tar.gz` → stage/publish fail (strict gate).
