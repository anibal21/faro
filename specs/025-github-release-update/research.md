# Research: GitHub Release Update Check

## 1. Update mechanism

**Decision**: Use **`tauri-plugin-updater`** with a **static JSON** endpoint hosted on GitHub Releases (e.g. `latest.json` attached to the latest release or updated by CI), plus `bundle.createUpdaterArtifacts: true` for NSIS `.exe` + `.sig`.

**Rationale**: Matches “download installer + launch”, verifies signatures, handles Windows NSIS restart/UAC patterns already battle-tested in Tauri 2.

**Alternatives considered**:
- Custom `GET /repos/anibal21/faro/releases/latest` + download `*-setup.exe` + `Command::spawn` — simpler keys, but no signature verification and more custom error paths.
- Open browser to release page only — rejected in clarify (Option A = download+install).

## 2. Version source of truth

**Decision**: Compare app SemVer from Tauri package/`getVersion()` against `latest.json` `version` (stable latest). Ignore drafts/prereleases unless published as the feed’s latest.

**Rationale**: Spec FR-008 + clarify repo `anibal21/faro`.

**Alternatives**: Live GitHub API only without JSON feed — works but rate limits / no `.sig` pairing; keep API as optional fallback for “notes” if needed, primary path is updater JSON.

## 3. When to check

**Decision**: After main workspace ready (post-splash), once per process; plus menu **Ayuda → Buscar actualizaciones…**.

**Rationale**: Spec assumptions + US1/US4.

## 4. Decline behavior

**Decision**: No persistent “skip version”; dismiss for current session only; next cold start re-checks and may re-offer same newer version.

**Rationale**: Clarify Q2 = A.

## 5. Platform matrix (v1)

**Decision**:
- **Windows**: full check → offer → download → install.
- **macOS/Linux**: check may run; UI shows informational “hay versión nueva” without install action (or omit install CTA).

**Rationale**: Clarify Q3 = A; current packaging is NSIS-first.

## 6. Security / constitution VI

**Decision**: Updater HTTP client contacts only GitHub release URLs / configured updater endpoints. No bastion hosts, PEM paths, logs, or profiles in requests. Signing pubkey embedded in app config; private key only in CI secrets.

**Rationale**: Constitution VI allows tool version egress; signing reduces supply-chain risk on update payloads.

## 7. UX states

**Decision**:
- Auto check failure: silent (no blocking modal).
- Manual check failure: short error toast/dialog.
- Offer dialog: current vs remote version, Accept / Reject.
- Accept: progress indication while downloading; then installer takes over (FR-009).

## 8. CI / release pipeline

**Decision**: On GitHub Release publish (or tag), CI builds NSIS with updater artifacts, uploads `Faro_*_x64-setup.exe`, `.sig`, and regenerates/uploads `latest.json` with platform `windows-x86_64` URLs + signature body.

**Alternatives**: Hand-maintained JSON — error-prone for demos.
