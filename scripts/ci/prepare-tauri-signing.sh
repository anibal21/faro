#!/usr/bin/env bash
# Normalize Tauri updater signing env for CI.
# Writes the private key to a file (more reliable than multiline secrets in env)
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
# Strip CR from Windows pastes; keep body intact for now
printf '%s' "$TAURI_SIGNING_PRIVATE_KEY_VALUE" | tr -d '\r' > "$KEY_FILE"

if grep -q '^untrusted comment:' "$KEY_FILE"; then
  # Plaintext minisign: keep internal newlines; normalize to a single trailing newline
  # (strip trailing blank lines, then add one newline)
  # shellcheck disable=SC2002
  CONTENT="$(cat "$KEY_FILE")"
  CONTENT="${CONTENT%"${CONTENT##*[![:space:]]}"}"
  printf '%s\n' "$CONTENT" > "$KEY_FILE"
  echo "Signing key: plaintext minisign format OK"
elif command -v base64 >/dev/null 2>&1; then
  # Base64 form: Tauri's decoder is strict — ANY whitespace (incl. LF at EOF) fails
  # with "Invalid symbol 10". Strip all whitespace before writing.
  COMPACT="$(tr -d '[:space:]' < "$KEY_FILE")"
  printf '%s' "$COMPACT" > "$KEY_FILE"
  DECODED="$(printf '%s' "$COMPACT" | base64 --decode 2>/dev/null || printf '%s' "$COMPACT" | base64 -d 2>/dev/null || true)"
  if printf '%s' "$DECODED" | grep -q 'untrusted comment:'; then
    echo "Signing key: base64-wrapped minisign format OK (whitespace stripped)"
  else
    echo "::error::TAURI_SIGNING_PRIVATE_KEY does not look like a Tauri/minisign private key (missing 'untrusted comment')."
    echo "Re-copy the entire contents of .tauri/faro.key into the GitHub Actions secret."
    exit 1
  fi
else
  # No base64 tool: still strip whitespace for the common single-line secret case
  COMPACT="$(tr -d '[:space:]' < "$KEY_FILE")"
  printf '%s' "$COMPACT" > "$KEY_FILE"
  echo "Signing key: written compact (could not base64-validate on this runner)"
fi

{
  echo "TAURI_SIGNING_PRIVATE_KEY=${KEY_FILE}"
  # Always set password (empty string is valid for --ci keys with no passphrase)
  echo "TAURI_SIGNING_PRIVATE_KEY_PASSWORD=${TAURI_SIGNING_PRIVATE_KEY_PASSWORD_VALUE:-}"
} >> "$GITHUB_ENV"

echo "Prepared updater signing env (key path only; secret not printed)."
