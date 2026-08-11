# Implementation Plan: Connection file browse

**Branch**: `009-connection-file-browse` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-connection-file-browse/spec.md` (clarify session 2026-07-28)

**Note**: Optional pre-hook `/speckit-wireframe-review` skipped unless user runs it (no signed-off wireframes yet for 009).

## Summary

Add native **Browse** controls next to PEM and IAM path fields on the new/edit environment modal so operators pick files instead of typing paths. Selection returns **absolute path strings only** (no file content into form/DB). No extension filters; OS-default start folder. Cancel leaves the field unchanged. If the native picker **fails/unavailable**, **block Save** until Browse works again; cancel ≠ failure. Manual type/paste and “Usar fixtures demo” remain when Browse is healthy.

## Technical Context

**Language/Version**: TypeScript/React (UI) · Rust/Tauri 2 (permissions/plugins only as needed) — no new languages

**Primary Dependencies**: Existing Faro UI + **`@tauri-apps/plugin-dialog`** (`open` file picker) registered in Tauri capabilities; thin FE helper wrapping open → path string | cancel | failure

**Storage**: Unchanged SQLite `connection_instance` — still **paths only**; no new tables/columns

**Testing**: Vitest + Testing Library — Browse fills path; cancel preserves; Save disabled on simulated picker failure and re-enabled after recovery; fixtures still work; env_crud updated for Browse controls

**Target Platform**: Desktop Faro (Windows primary; macOS/Linux same dialog plugin)

**Project Type**: Desktop Tauri hybrid — UI + native dialog capability

**Performance Goals**: File picker opens within normal OS latency; path applied to field immediately on selection (&lt;100ms after dialog returns)

**Constraints**: Constitution II/VI — never read PEM/IAM contents into form state or persist secrets; FR-007 no filters; FR-009 OS-default directory; FR-010 Save block on picker failure only

**Scale/Scope**: One modal (`NewEnvironmentModal`); two path fields; ephemeral browse-availability state

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/009-connection-file-browse/spec.md` + this plan
- [x] Secrets: Browse returns paths only; no PEM/IAM body in form/DB
- [x] No exfiltration (VI): dialog is local OS picker; no upload of selected files
- [x] Network: no new network for this feature
- [x] Read-only K8s: N/A (UI path entry only)
- [x] Local SQLite + rules analyzer unchanged
- [x] Tests planned: unit/integration for browse/cancel/failure Save-block
- [x] Desktop demonstrable
- [x] AI4Devs docs sync after tasks (HU note for path browse UX)

**Post-design re-check (Phase 1):** PASS — path-only contract; failure handling is local UI state.

## Project Structure

### Documentation (this feature)

```text
specs/009-connection-file-browse/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── file-browse-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
src/
├── components/env/NewEnvironmentModal.tsx   # Browse buttons; Save gate on browseBroken
├── lib/fileBrowse.ts                        # NEW — openPathPicker() → path | null | throw
└── …

src-tauri/
├── Cargo.toml / tauri.conf.json             # enable dialog plugin if not present
├── capabilities/*.json                      # dialog:allow-open (or equivalent)
└── src/lib.rs / main                        # plugin registration

tests/
├── unit/fileBrowse.test.ts                  # NEW — map dialog results; failure vs cancel
└── integration/env_crud.spec.tsx            # Browse + Save-block scenarios (mocked dialog)
```

**Structure Decision**: Keep persistence/IPC unchanged (`env_upsert` still receives path strings). All new behavior is frontend + Tauri dialog plugin wiring; optional tiny Rust surface only if plugin registration requires it.

## Complexity Tracking

> No constitution violations requiring justification.
