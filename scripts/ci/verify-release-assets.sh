#!/usr/bin/env bash
# Verify mandatory Faro release assets (026). Exit 1 if any required pattern is missing.
# Usage: verify-release-assets.sh <dir-with-downloaded-artifacts>
set -euo pipefail

ROOT="${1:-.}"
fail=0

need() {
  local label="$1"
  local pattern="$2"
  # shellcheck disable=SC2086
  if ! compgen -G "${ROOT}/${pattern}" > /dev/null; then
    echo "MISSING required asset: ${label} (pattern: ${pattern})"
    fail=1
  else
    echo "OK ${label}: $(compgen -G "${ROOT}/${pattern}" | head -n1)"
  fi
}

need "Windows NSIS setup" "*-setup.exe"
need "Windows NSIS signature" "*-setup.exe.sig"
need "macOS DMG" "*.dmg"
need "macOS updater tar" "*.app.tar.gz"
need "macOS updater signature" "*.app.tar.gz.sig"
need "Linux AppImage" "*.AppImage"
need "Linux AppImage signature" "*.AppImage.sig"
need "Linux deb" "*.deb"

if [[ "$fail" -ne 0 ]]; then
  echo "Release asset verification FAILED — not ready for the team."
  exit 1
fi

echo "All mandatory release assets present."
