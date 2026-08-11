# Package smoke (US10)

## Build

```bash
npm install
npm run tauri build
```

Artifacts land under `src-tauri/target/release/bundle/` (nsis / dmg / appimage depending on OS).

## Launch checks

| OS | Artifact | Expect |
|----|----------|--------|
| Windows | `.exe` / NSIS | Splash → main chrome |
| macOS | `.app` / `.dmg` | Splash → main chrome |
| Linux | AppImage / deb | Splash → main chrome |

Demo connect: use **Usar fixtures demo** in the new-environment modal (paths under `fixtures/`).

## Faro NSIS (023)

On Windows, inspect `src-tauri/target/release/bundle/nsis/` and verify:
- Product Faro; publisher Aníbal Rodríguez; copyright 2026.
- Spanish installer and MIT license page.
- Existing Faro icon, Start Menu folder, and Desktop shortcut option.
- Per-machine default under Program Files.
