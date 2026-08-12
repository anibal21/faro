#!/usr/bin/env bash
# Normalize Tauri updater signing env for CI.
# Writes the private key to a file (more reliable than raw multiline/base64 in env)
# and exports TAURI_SIGNING_PRIVATE_KEY as that path.
#
# Required env:
#   TAURI_SIGNING_PRIVATE_KEY_VALUE — secret contents of .tauri/faro.key
# Optional:
#   TAURI_SIGNING_PRIVATE_KEY_PASSWORD_VALUE — empty if key has no password
#
# Appends to $GITHUB_ENV for subsequent steps.
set -euo pipefail

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY_VALUE:-}" ]]; then
  echo "::error::Secret TAURI_SIGNING_PRIVATE_KEY is empty or missing."
  echo "Set it to the FULL contents of .tauri/faro.key (one line is OK)."
  echo "Do not use the .pub file. Do not wrap in quotes."
  exit 1
fi

KEY_FILE="${RUNNER_TEMP:-/tmp}/faro-updater.key"
# Preserve exact secret body (trim only a single trailing newline GitHub may add)
printf '%s' "$TAURI_SIGNING_PRIVATE_KEY_VALUE" | tr -d '\r' > "$KEY_FILE"
# Ensure file ends with newline (minisign-friendly)
printf '\n' >> "$KEY_FILE"

# Validate: either plaintext minisign header or base64 that decodes to it
if grep -q '^untrusted comment:' "$KEY_FILE"; then
  echo "Signing key: plaintext minisign format OK"
elif command -v base64 >/dev/null 2>&1; then
  DECODED="$(base64 --decode < "$KEY_FILE" 2>/dev/null || base64 -d < "$KEY_FILE" 2>/dev/null || true)"
  if printf '%s' "$DECODED" | grep -q 'untrusted comment:'; then
    echo "Signing key: base64-wrapped minisign format OK"
  else
    echo "::error::TAURI_SIGNING_PRIVATE_KEY does not look like a Tauri/minisign private key (missing 'untrusted comment')."
    echo "Re-copy the entire contents of .tauri/faro.key into the GitHub Actions secret."
    exit 1
  fi
else
  echo "Signing key: written (could not base64-validate on this runner)"
fi

{
  echo "TAURI_SIGNING_PRIVATE_KEY=${KEY_FILE}"
  # Always set password (empty string is valid for --ci keys with no passphrase)
  echo "TAURI_SIGNING_PRIVATE_KEY_PASSWORD=${TAURI_SIGNING_PRIVATE_KEY_PASSWORD_VALUE:-}"
} >> "$GITHUB_ENV"

echo "Prepared updater signing env (key path only; secret not printed)."
