# Research: Connection file browse

## Decision: Use `@tauri-apps/plugin-dialog` `open()` for Browse

**Rationale**: Faro is Tauri 2 desktop; the official dialog plugin provides a native OS file picker, returns filesystem paths (not file blobs), and matches constitution path-only hygiene. HTML `<input type="file">` in the webview often yields fake/`C:\fakepath\` style paths and is a poor fit for absolute PEM/IAM paths on Windows.

**Alternatives considered**:
- HTML file input — rejected (unreliable absolute paths in Tauri webview).
- Custom Rust `rfd` command without plugin — more code; plugin is standard and capability-gated.
- Folder picker — out of scope (files only).

## Decision: No file-type filters; OS-default start directory

**Rationale**: Clarify session: show all files; do not set custom defaultPath/home/last-used. Simplifies picker options (`multiple: false`, no `filters`).

**Alternatives considered**: Soft filters + “All files”; start in current path’s parent — rejected by clarify.

## Decision: Cancel vs failure semantics

**Rationale**:
- **Cancel**: dialog resolves with no selection (`null`) → leave field unchanged; Save remains allowed.
- **Failure**: dialog invoke throws / plugin unavailable → set ephemeral `browseBroken`; disable Save with clear message until a later Browse invoke completes without throwing (selection or cancel both clear the broken flag once the dialog opens successfully).

**Alternatives considered**: Silent failure; block Save until a file is selected after recovery — rejected (spec: recovery = picker works again, not mandatory re-select).

## Decision: No backend schema or `env_upsert` contract change

**Rationale**: Feature only changes how path strings are entered. Existing validation (non-empty paths, reject secret material in fields) stays.

**Alternatives considered**: Upload file contents to Rust for validation at save — rejected (constitution II; connect-time validation remains elsewhere).

## Decision: Test with injectable picker in Vitest

**Rationale**: Native dialog cannot run in jsdom. Export `openPathPicker` with optional inject/mock so integration tests cover fill, cancel, and Save-block without Tauri.

**Alternatives considered**: E2E-only Tauri tests for Browse — heavier for MVP; keep manual desktop check in quickstart plus unit/integration mocks.
