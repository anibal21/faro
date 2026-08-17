# Tasks: Multi-Platform Release Artifacts

**Input**: Design documents from `/specs/026-multi-platform-release/`  
**Branch / feature**: `026-multi-platform-release`  
**Decisions baked in**: x64 only; NSIS `currentUser`; macOS DMG unsigned; Linux AppImage **and** `.deb` both mandatory; strict CI gate; multiplatform `latest.json` (deb manual-only in feed)

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: REQUIRED (constitution) — Vitest/conf asserts for `tauri.conf.json`; CI gate verification script; manual quickstart V1–V5.

**Organization**: Setup → Foundational (conf + workflow skeleton) → US1 packages → US2 feed → US3 gate/docs → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align context and inventory current release path

- [X] T001 Confirm agent context points at `specs/026-multi-platform-release/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory current `.github/workflows/release-updater.yml` and `bundle` section in `src-tauri/tauri.conf.json`

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Packaging config + workflow skeleton that all stories depend on

**⚠️ CRITICAL**: No story-complete release until conf targets/installMode and multi-job workflow exist

- [X] T003 Set `bundle.windows.nsis.installMode` to `currentUser` in `src-tauri/tauri.conf.json`
- [X] T004 Add `deb` to `bundle.targets` (keep `nsis`, `dmg`, `appimage`) in `src-tauri/tauri.conf.json`
- [X] T005 [P] Add Vitest conf assertions for `currentUser` + required targets in `tests/unit/release_bundle_conf.spec.ts`
- [X] T006 Replace/extend `.github/workflows/release-updater.yml` with jobs `build-windows`, `build-macos`, `build-linux`, and `publish` stub per [contracts/ci-release-gate.md](./contracts/ci-release-gate.md)
- [X] T007 [P] Document required Actions secrets (`TAURI_SIGNING_PRIVATE_KEY`, optional password) in workflow header comments in `.github/workflows/release-updater.yml`

**Checkpoint**: Conf green in unit test; workflow YAML validates structurally

---

## Phase 3: User Story 1 — Descargar instalable por plataforma (P1) 🎯 MVP

**Goal**: Ready release exposes Windows NSIS (no admin), macOS DMG, Linux AppImage + `.deb` (x64).

**Independent Test**: After a successful publish, release page lists all four packages with clear names; Windows installs without admin UAC.

### Tests

- [X] T008 [P] [US1] Extend `tests/unit/release_bundle_conf.spec.ts` (or `nsis_faro_config`) to assert NSIS language/hooks still present with `currentUser`
- [X] T009 [P] [US1] Add checklist snippet for mandatory asset name patterns in `docs/RELEASE.md` (draft section) matching [contracts/release-assets.md](./contracts/release-assets.md)

### Implementation

- [X] T010 [US1] Implement `build-windows` job: Node+Rust, sign env, `tauri build --bundles nsis`, upload workflow artifacts in `.github/workflows/release-updater.yml`
- [X] T011 [US1] Implement `build-macos` job on x64 macOS runner (`macos-13` or equiv.): DMG + updater artifacts, no notarization, upload artifacts in `.github/workflows/release-updater.yml`
- [X] T012 [US1] Implement `build-linux` job: AppImage **and** deb bundles, upload both artifacts in `.github/workflows/release-updater.yml`
- [X] T013 [US1] Implement `publish` job: download all build artifacts and `gh release upload` NSIS(+sig), DMG(+mac updater/sig), AppImage(+sig), `.deb` when `release` event in `.github/workflows/release-updater.yml`
- [X] T014 [P] [US1] Write team download/install steps (Win/macOS/Linux) in `docs/RELEASE.md` per [contracts/team-install.md](./contracts/team-install.md)

**Checkpoint**: US1 quickstart V1 + V3 (Windows no-admin)

---

## Phase 4: User Story 2 — Feed de actualización multiplataforma (P2)

**Goal**: `latest.json` on the release points at build binaries for `windows-x86_64`, `darwin-x86_64`, `linux-x86_64` (AppImage); not Source code zips.

**Independent Test**: Fetch `latest.json`; URLs resolve to installers/bundles; version matches tag.

### Tests

- [X] T015 [P] [US2] Add unit/fixture test validating example `latest.json` shape in `tests/unit/latest_json_multiplatform.spec.ts` per [contracts/latest-json-multiplatform.md](./contracts/latest-json-multiplatform.md)

### Implementation

- [X] T016 [US2] In `publish` job, generate merged `latest.json` from Windows/macOS/Linux sig+URL artifacts in `.github/workflows/release-updater.yml`
- [X] T017 [US2] Upload `latest.json` to the GitHub Release (clobber) and ensure endpoint `…/latest/download/latest.json` works
- [X] T018 [P] [US2] Note in `docs/RELEASE.md` that `.deb` is manual-only (not required inside updater `platforms`)

**Checkpoint**: US2 quickstart V5

---

## Phase 5: User Story 3 — Publicar builds, no el repo como producto (P2)

**Goal**: Pipeline fails visibly if any mandatory exportable missing; Source code zips are not the product deliverable.

**Independent Test**: Simulate missing deb/AppImage/macOS → publish fails; docs say Source code ≠ installer.

### Tests

- [X] T019 [P] [US3] Add verification script/step that fails if any required asset missing before upload completes in `.github/workflows/release-updater.yml` (or `scripts/ci/verify-release-assets.ps1` / `.sh` invoked by publish)

### Implementation

- [X] T020 [US3] Wire `publish` `needs: [build-windows, build-macos, build-linux]` so any build failure blocks publish in `.github/workflows/release-updater.yml`
- [X] T021 [US3] Enforce AppImage **and** `.deb` both present in verify step (clarify Q5) in verify script / publish job
- [X] T022 [P] [US3] Document maintainer cut-release flow + “Source code zip is not the product” in `docs/RELEASE.md`
- [X] T023 [P] [US3] Cross-link `TESTING.md` §026 to `docs/RELEASE.md` and quickstart V0–V5

**Checkpoint**: US3 quickstart V2

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T024 [P] Align `TESTING.md` §025 updater notes with multiplatform `latest.json` (Windows install path still primary for auto-update)
- [X] T025 Run [quickstart.md](./quickstart.md) V0–V1 locally/CI as far as secrets allow; record gaps
- [X] T026 [P] Confirm no Apple notarization steps exist in `.github/workflows/release-updater.yml`
- [X] T027 Mark all tasks complete after validation

---

## Phase 7: Post-delivery (tracked in 027)

Work after the initial 026 task list (CI flaky NSIS, macOS updater tar, signing whitespace, splash white flash, product **1.0.0**) is specified and closed under [`../027-release-harden-splash/`](../027-release-harden-splash/spec.md). Do not reopen 026 tasks for those items.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (T003–T007) → US1 builds/upload  
- US2 depends on US1 artifacts existing in publish job  
- US3 depends on publish job + verify (can harden same workflow as US1/US2)  
- Polish last  

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Foundational |
| US2 | US1 publish artifacts |
| US3 | US1 workflow jobs (gate hardening) |

### Parallel Opportunities

- T010 ∥ T011 ∥ T012 (different OS jobs in YAML — implement sequentially in one file but logically parallel in CI)
- T014 ∥ T015; T018 ∥ T022 ∥ T023 docs

---

## Parallel Example: User Story 1

```text
Task: T010 build-windows job
Task: T011 build-macos job
Task: T012 build-linux job
Task: T014 docs/RELEASE.md team install
```

---

## Implementation Strategy

### MVP First

1. Conf `currentUser` + `deb` target + unit test  
2. Three build jobs + publish uploading four packages  
3. Then `latest.json` merge + strict verify  

### Suggested MVP

**T001–T014** (installable assets on release) then T016–T021 (feed + gate).

### Notes

- Do not commit `.tauri/*.key` private keys  
- macOS runner must be x64-capable (`macos-13`) per research  
- GitHub Source code archives will still appear — success = presence of build assets  
