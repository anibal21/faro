# Contract: CI release gate

## Trigger

- `release: published` on `anibal21/faro`
- Optional `workflow_dispatch` for dry-run builds (upload only when release event)

## Jobs

1. **build-windows** — NSIS + `.sig`
2. **build-macos** — DMG + macOS updater artifacts + `.sig` (x64)
3. **build-linux** — AppImage + deb (+ `.sig` for AppImage)
4. **publish** — `needs: [build-windows, build-macos, build-linux]`

## Strict failure (FR-006)

- If **any** build job fails → `publish` does not succeed → release **not ready**.
- `publish` MUST verify all mandatory assets from [release-assets.md](./release-assets.md) exist before/after upload.
- Missing AppImage **or** missing `.deb` → fail (clarify Q5).
- Partial upload of “whatever succeeded” is forbidden.

## Secrets

- `TAURI_SIGNING_PRIVATE_KEY` (required)
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (optional)
- `GITHUB_TOKEN` / `contents: write` for upload

## Success signal

Green `publish` job + all mandatory assets listed on the Release page.
