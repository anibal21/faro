# Research: Multi-Platform Release Artifacts

## 1. CI matrix vs single-job

**Decision**: GitHub Actions **matrix** (or three named jobs) — `windows-latest` (NSIS), macOS x64 runner (DMG + updater tar), `ubuntu-22.04` (AppImage + deb) — then a **final publish job** that `needs` all builds (default fail-fast on any failure).

**Rationale**: FR-006 / clarify Q1+Q5 require strict all-or-nothing; matrix isolates OS toolchains.

**Alternatives considered**:
- Windows-only (025) — rejected by spec.
- Publish partial assets — rejected by clarify.

## 2. Windows install without admin

**Decision**: Set `bundle.windows.nsis.installMode` to **`currentUser`** (install under `%LOCALAPPDATA%`, `RequestExecutionLevel user`).

**Rationale**: FR-002 / team without admin; Tauri docs recommend this for no-UAC installs.

**Alternatives**: `perMachine` (current) — requires admin; `both` — still prompts admin.

## 3. macOS x64 without notarization

**Decision**: Build DMG (and updater `.app.tar.gz` + `.sig` if `createUpdaterArtifacts`) on an **x86_64 macOS** environment (`macos-13` Intel runner preferred). Do **not** run `notarytool` / staple. Document Gatekeeper bypass in team guide.

**Rationale**: Clarify Q2 (x64 only) + Q3 (no notarization). Apple Silicon runners default to arm64; using Intel runner avoids cross-compile complexity for MVP.

**Alternatives**: Cross-compile `x86_64-apple-darwin` from `macos-14` arm — more fragile; full notarization — out of scope.

## 4. Linux AppImage + deb

**Decision**: Add **`deb`** to `bundle.targets` alongside existing `appimage` (and keep `nsis`/`dmg`). Linux job: `npm run tauri build -- --bundles appimage,deb` (or full build with targets filtered).

**Rationale**: Clarify Q4–Q5; both assets mandatory for gate.

**Alternatives**: AppImage-only or deb-only — rejected.

## 5. `latest.json` multiplatform

**Decision**: Final job merges platform entries:

| Key | Artifact |
|-----|----------|
| `windows-x86_64` | NSIS `*-setup.exe` + `.sig` body |
| `darwin-x86_64` | macOS updater bundle URL + `.sig` (typically `.app.tar.gz`) |
| `linux-x86_64` | AppImage URL + `.sig` |

**.deb** is a **release download asset** for humans; it MAY be omitted from updater `platforms` (Tauri updater consumes AppImage on Linux). Release page still must list both.

**Rationale**: FR-005 + 025 plugin; keep feed valid for updater while satisfying dual Linux downloads.

**Alternatives**: Put `.deb` in feed — not used by updater; confuse install path.

## 6. Strict gate / “ready” signal

**Decision**: Publish job only runs if all build jobs succeed; it verifies required filenames exist before `gh release upload`. If verification fails → job fails (release may exist with only Source code — treat as **not ready**; optional: delete assets / fail check run so team sees red).

**Rationale**: FR-006; GitHub always attaches Source code zips — cannot remove; success = presence of the four packages.

**Alternatives**: Soft “incomplete” label — rejected by clarify.

## 7. Signing key

**Decision**: Reuse existing `TAURI_SIGNING_PRIVATE_KEY` (+ optional password) on **all** OS jobs that produce updater `.sig` files.

**Rationale**: Same pubkey already embedded in `tauri.conf.json` (025).

## 8. Documentation

**Decision**: `docs/RELEASE.md` (maintainer cut-release) + team section (what to download, Gatekeeper, `chmod +x` AppImage, install `.deb`) referenced from `TESTING.md` §026.

**Rationale**: FR-007 / FR-009 / SC-001–SC-006.
