# Contract: Multiplatform `latest.json`

## URL

`https://github.com/anibal21/faro/releases/latest/download/latest.json`

## Schema (Tauri static JSON)

```json
{
  "version": "0.3.0",
  "notes": "optional",
  "platforms": {
    "windows-x86_64": { "url": "https://github.com/anibal21/faro/releases/download/v0.3.0/Faro_…_x64-setup.exe", "signature": "<sig file body>" },
    "darwin-x86_64": { "url": "https://…/Faro_…_x64.app.tar.gz", "signature": "<sig>" },
    "linux-x86_64": { "url": "https://…/Faro_….AppImage", "signature": "<sig>" }
  }
}
```

## Rules

- URLs MUST point to **build** assets on the same release tag — never Source code zip/tar.
- `version` MUST match `tauri.conf.json` / `package.json` for that tag.
- `.deb` is **not** required in `platforms` (manual download only).
- App auto-install remains Windows-first (025); other OS use feed for version awareness / future install.

## Privacy

Payload: version + public download URLs + signatures only (constitution VI).
