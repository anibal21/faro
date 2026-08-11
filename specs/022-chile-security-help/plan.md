# Implementation Plan: Chile Security Help

**Branch**: `022-chile-security-help` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-chile-security-help/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` skipped — UI is a single Help dialog on existing `AppMenubar`; contract covers layout.

## Summary

Add **Ayuda → Seguridad** to the existing app menubar and open an in-app dialog that lists Chilean security/privacy frameworks (21.663, ANCI/CSIRT, 19.628, 21.719) with short descriptions, plus a verifiable **Cómo Faro se alinea** section and an honest disclaimer (facilitates compliance; does not certify OIV/ANCI). Content lives in one typed module. No new network destinations; no changes to connect/logs/keep-alive.

## Technical Context

**Language/Version**: TypeScript/React (UI) · existing Tauri shell unchanged for this feature

**Primary Dependencies**: `@radix-ui/react-menubar` (`AppMenubar`), `@radix-ui/react-dialog` (`src/components/ui/dialog.tsx`), Vitest + Testing Library

**Storage**: N/A (static copy; no SQLite writes for opening Seguridad)

**Testing**: Vitest UI test — open Seguridad content asserts Ley 21.663 + Ley 21.719 (or 19.628); optional assert no forbidden certification phrases

**Target Platform**: Desktop Faro main window (Windows-first)

**Project Type**: Desktop Tauri hybrid — frontend-only feature for Must scope

**Performance Goals**: Dialog opens on menubar select in &lt; 300ms perceived; no IPC required

**Constraints**: Constitution II–VI; Spanish copy; no ANCI certification claims; no new egress; FR-015 first-run notice is Should/optional deferrable

**Scale/Scope**: One menubar menu + one dialog + content module + unit test + docs note

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/022-chile-security-help/spec.md` + this plan
- [x] Secrets / no exfiltration: dialog is local static content; no third-party calls
- [x] Read-only K8s / local-first: unchanged; alignment bullets restate existing principles
- [x] Tests planned (FR-012)
- [x] Desktop demonstrable
- [x] AI4Devs docs: brief HU/ticket note after tasks (Help → Seguridad)

**Post-design re-check (Phase 1):** PASS — optional official links (if any) open via OS/browser only; no payload upload.

## Project Structure

### Documentation (this feature)

```text
specs/022-chile-security-help/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── help-seguridad-ui.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src/components/chrome/AppMenubar.tsx     # add MenubarMenu Ayuda → Seguridad first
src/components/help/SecurityDialog.tsx   # modal using ui/dialog
src/components/help/SecurityDialog.css   # scrollable body if needed (match existing modal density)
src/content/chileSecurity.ts             # intro, norms[], alignment[], forbiddenClaims helpers
src/views/MainShell.tsx                  # wire open state for SecurityDialog
tests/unit/chile_security_help.spec.tsx  # FR-012 content + menubar path
```

**Structure Decision**: Extend `AppMenubar` (already has Ambientes/Temas) rather than inventing a second chrome. Reuse Radix `Dialog` like other modals. Keep normative copy in `src/content/chileSecurity.ts` as single source of truth for UI and tests.

## Complexity Tracking

> No constitution violations requiring justification.
