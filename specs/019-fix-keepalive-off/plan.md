# Implementation Plan: Fix Keep-Alive Off & Drop Pulse Line

**Branch**: `019-fix-keepalive-off` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-fix-keepalive-off/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; bugfix + UI trim — wireframes optional.

## Summary

Fix the defect where choosing **No mantener conexión viva** leaves keep-alive stuck **ON**. Make OFF persist in runtime + preference + UI, and remove the **Último pulso** chrome so only keep-alive ON/OFF (plus session status as today) remains visible.

## Technical Context

**Language/Version**: Rust (`keepalive`, `env_set_keep_alive`) · TypeScript/React (`EnvTreeNav`, `useConnectionHealth`)

**Primary Dependencies**: Existing 017/018 keep-alive loop, prefs, `session-health` events, `env_connection_states`

**Storage**: `ui_preferences` key `keepalive.<instanceId>` — OFF must remain `"false"` across reconnect

**Testing**: Cargo: stop clears `keep_alive` + cancel; Vitest: OFF label + no “Último pulso”; regression that ON still works

**Target Platform**: Desktop Faro

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: OFF reflected in UI ≤1s; no pulse reopen after stop

**Constraints**: Constitution unchanged; demo still excluded; pulse interval/threshold unchanged

**Scale/Scope**: Narrow bugfix + UI deletion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/019-fix-keepalive-off/spec.md` + this plan
- [x] Secrets: unchanged
- [x] No exfiltration (VI)
- [x] Network: unchanged
- [x] Read-only K8s pulse unchanged
- [x] Tests planned for Must-Have stories
- [x] Desktop demonstrable
- [x] Docs: note under HU25 / 019 after tasks

**Post-design re-check (Phase 1):** PASS — no constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/019-fix-keepalive-off/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── keep-alive-off.md
│   └── ui-no-pulse.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/src/
├── keepalive.rs              # stop: reliable cancel + keep_alive=false + emit session-health OFF
└── commands/connect.rs       # ensure env_set_keep_alive(false) path emits/persists; no re-ON

src/
├── components/catalog/EnvTreeNav.tsx  # remove Último pulso; show Keep-alive ON|OFF; fix toggle default
├── hooks/useConnectionHealth.ts       # merge events without resurrecting keepAlive true after OFF
└── lib/ipc.ts                         # verify envSetKeepAlive passes enabled:false

tests/unit/
└── session_keep_alive.spec.tsx        # OFF sticks; no Último pulso text
```

**Structure Decision**: Fix authoritative Rust stop + emit; harden UI sync; delete pulse line only (keep lastPulseAt in IPC for optional future, unused in chrome).

## Complexity Tracking

> No constitution violations requiring justification.
