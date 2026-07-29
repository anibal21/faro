# Feature Specification: Connection file browse

**Feature Branch**: `009-connection-file-browse`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "quiero que en el formulario de conexión, los archivos se puedan buscar para cargar su ruta, y no tener que escribirla uno mismo"

## Clarifications

### Session 2026-07-28

- Q: When Browse opens, which starting folder should the native file picker use? → A: No preference — leave the OS / platform default starting folder (do not require Faro to set home, current-path parent, or last-used directory).
- Q: How strict should file-type filters be in the Browse picker? → A: No filters — always show all files.
- Q: If the native file picker fails or is unavailable, what should happen? → A: Block Save until Browse works again (operator cannot save while the picker is broken/unavailable).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse PEM and IAM paths when creating/editing an environment (Priority: P1)

An operator opens the connection/environment form (new or edit) and, for the PEM file path and the IAM credentials file path, chooses **Browse…** (or equivalent). The system shows the platform’s native file picker. After the operator selects a file, the corresponding path field is filled with that file’s full local path. The operator can still review or fine-tune the path text before saving. Saving still stores **paths only**, never file contents.

**Why this priority**: Typing long Windows paths is error-prone and the main friction when configuring live environments; this is the core ask.

**Independent Test**: Open new/edit environment modal → click Browse on PEM → select any file → field shows absolute path; repeat for IAM credentials path → save → persisted environment retains those paths.

**Acceptance Scenarios**:

1. **Given** the new-environment form is open, **When** the operator uses Browse on the PEM path field and selects a file, **Then** the PEM path field shows the selected file’s absolute path.
2. **Given** the new-environment form is open, **When** the operator uses Browse on the IAM credentials path field and selects a file, **Then** the IAM path field shows the selected file’s absolute path.
3. **Given** the edit-environment form is open with existing paths, **When** the operator browses a different file for either path field, **Then** that field updates to the newly selected path (other fields unchanged).
4. **Given** the operator selected paths via Browse, **When** they save the environment, **Then** Faro persists only the path strings (same as today’s path-only model)—not the file contents.
5. **Given** a path was filled via Browse, **When** the operator edits the path text manually before save, **Then** the edited text is what is saved.

---

### User Story 2 - Cancel or dismiss the file picker without changing the field (Priority: P2)

If the operator opens Browse and cancels or closes the picker without choosing a file, the path field keeps its previous value (empty or previously entered).

**Why this priority**: Prevent accidental clearing of already-correct paths during edits.

**Independent Test**: Pre-fill a path → Browse → Cancel → field unchanged.

**Acceptance Scenarios**:

1. **Given** a path field already has a value, **When** the operator opens Browse and cancels, **Then** the field value is unchanged.
2. **Given** a path field is empty, **When** the operator opens Browse and cancels, **Then** the field remains empty.

---

### User Story 3 - Manual path entry when Browse is healthy (Priority: P2)

Operators who prefer typing or pasting a path can still do so **when the native file picker is available**; Browse is an addition, not a replacement for healthy sessions. Demo fixture shortcuts (e.g. “Usar fixtures demo”) continue to fill paths as they do today. If Browse fails or is unavailable, Save is blocked until Browse works again (see User Story 4).

**Why this priority**: Preserve existing workflows and offline demo setup when the picker works.

**Independent Test**: With Browse working, type/paste a path without using Browse → save succeeds; use demo fixtures button → paths still populate.

**Acceptance Scenarios**:

1. **Given** the environment form is open and the native picker is available, **When** the operator types or pastes a path without using Browse, **Then** save behaves as today (path required/validated as before).
2. **Given** the form exposes the demo fixtures shortcut, **When** the operator uses it, **Then** PEM and IAM path fields still receive the fixture paths.

---

### User Story 4 - Block Save while Browse is broken (Priority: P1)

If the native file picker fails to open or is unavailable, the form MUST prevent saving until Browse works again. The operator sees a clear message that Save is blocked for that reason. Typing a path alone MUST NOT bypass this block while Browse remains broken.

**Why this priority**: Product decision: path configuration must remain tied to a working Browse capability when the picker is down; avoids silent half-broken setups.

**Independent Test**: Simulate picker failure → attempt Save → blocked with clear message; restore picker → Browse or manual path + Save succeeds again.

**Acceptance Scenarios**:

1. **Given** Browse fails or is unavailable, **When** the operator tries to save (even with typed paths), **Then** Save is blocked and a clear message explains that Browse must work first.
2. **Given** Browse was previously failing and becomes available again, **When** the operator retries Browse successfully (or the picker is confirmed available again), **Then** Save is allowed under normal rules (typed or browsed paths).
3. **Given** the operator cancels a healthy picker (not a failure), **When** they try to save with valid paths, **Then** Save is **not** blocked solely because they cancelled (cancel ≠ broken).

---

### Edge Cases

- Operator selects a file that later is moved/deleted: Browse still succeeds at form time; connect-time failures remain handled by existing connect error messaging (out of scope to re-validate on every keystroke).
- Very long paths: field shows the full path (scrollable/truncated visually if needed) but the full string is retained for save.
- Operator picks an unexpected file type (e.g. image for PEM): allowed at browse time (no type filters); validation at save/connect stays path-presence oriented (no silent reading of file contents into the form).
- Multiple rapid Browse clicks: only one picker interaction should apply; last successful selection wins.
- Picker starting folder follows OS default; Faro does not force a custom initial directory.
- Native picker fails/unavailable: Save blocked until Browse works again; cancel of a working picker does not count as failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The environment create/edit form MUST provide a Browse control next to the **PEM path** field that opens a native file picker and, on selection, sets that field to the chosen file’s absolute path.
- **FR-002**: The environment create/edit form MUST provide a Browse control next to the **IAM credentials path** field that opens a native file picker and, on selection, sets that field to the chosen file’s absolute path.
- **FR-003**: Cancelling the file picker MUST leave the associated path field unchanged.
- **FR-004**: Path fields MUST remain manually editable (type/paste) in addition to Browse when the native picker is available.
- **FR-005**: Browse MUST only return filesystem **paths** into the form; Faro MUST NOT load PEM or IAM file contents into the form state, clipboard, or persisted profile for this feature.
- **FR-006**: Saving an environment after Browse MUST continue to persist paths only under the existing connection-instance model (no change to secret hygiene).
- **FR-007**: The native file picker MUST show **all files** (no extension/type filters for PEM or IAM Browse). Validity of the chosen file remains a connect/save concern, not a picker filter concern.
- **FR-008**: Existing demo fixture path-filling behavior MUST remain available and compatible with Browse (fixtures may still set paths programmatically).
- **FR-009**: The native file picker’s **starting directory** MUST follow the OS / platform default; Faro MUST NOT require a custom start folder (home, current-path parent, or last-used).
- **FR-010**: If the native file picker fails to open or is unavailable, the form MUST **block Save** until Browse works again, with a clear message; typed paths MUST NOT bypass this block. Canceling a working picker MUST NOT trigger this Save block.

### Key Entities

- **Environment / connection form path fields**: Local absolute path strings for PEM and IAM credentials files; unchanged entity model except how the user populates them.
- **Selected file (ephemeral)**: Temporary picker result used only to derive a path string for the form; not a stored entity.
- **Browse availability state (ephemeral)**: Whether the native picker is currently usable for this form session; drives Save enablement when broken.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a guided test, an operator can fill both PEM and IAM paths using only Browse (no typing) and successfully save the environment in under 1 minute.
- **SC-002**: 100% of cancel-picker trials leave the prior path value unchanged.
- **SC-003**: After Browse + save, a reopen of edit shows the same absolute paths that were selected (round-trip fidelity).
- **SC-004**: Security spot-check: no PEM body or IAM key/secret values appear in saved environment records or UI error toasts as a result of using Browse.
- **SC-005**: When Browse is healthy, operators who only type paths can still complete create/edit without being forced to use Browse.
- **SC-006**: In 100% of simulated picker-failure trials, Save remains blocked until Browse works again; cancel-only trials do not block Save.

## Assumptions

- Applies to the existing **new/edit environment** (connection) modal; no new environment types.
- Only **PEM path** and **IAM credentials path** need Browse; other fields (host, region, cluster, namespace) stay text entry.
- Native OS file picker is acceptable UX on Windows-first demos (and other desktop targets); starting folder is OS-default (see FR-009); picker lists all files with no type filters (see FR-007).
- Constitution path-only / no-exfiltration rules continue to apply; Browse does not introduce uploading files off-machine.
- Connect-time validation of whether the file is a valid key/credentials set remains the responsibility of connect flows (this feature only improves path entry).
- “Usar fixtures demo” / built-in demo behavior is unchanged except that Browse remains available on the same form.
- “Browse works again” means the native picker can open successfully (failure cleared); it does not require the operator to have selected a file after recovery.
