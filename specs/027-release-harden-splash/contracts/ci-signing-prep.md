# Contract: CI signing prep

## Purpose

Normalize Tauri updater private key for Actions so `tauri build` can sign updater artifacts.

## Behavior

Input env:

- `TAURI_SIGNING_PRIVATE_KEY_VALUE` ← GitHub secret contents of `.tauri/faro.key`
- Optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD_VALUE`

Script: `scripts/ci/prepare-tauri-signing.sh`

- Strip CR.
- If plaintext minisign (`untrusted comment:`): keep internal newlines; single trailing newline.
- If base64-wrapped: strip **all** whitespace (prevents `Invalid symbol 10`).
- Export `TAURI_SIGNING_PRIVATE_KEY` (+ password) via `$GITHUB_ENV` for subsequent steps.
- NEVER echo secret body.

## Errors

- Empty secret → fail with actionable message.
- Neither plaintext nor decodable base64 with `untrusted comment` → fail.
