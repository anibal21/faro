# Implementation Plan: Keep-Alive Off Must Work

**Branch**: `020-keepalive-off-works` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-keepalive-off-works/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; bugfix — wireframes optional.

## Summary

Make **No mantener conexión viva** actually turn keep-alive **OFF** end-to-end after 019 failed in real use. Diagnose and fix the full path: context-menu click → IPC args → Rust stop → preference → UI refresh, with automated proof that disable leaves `keepAlive: false` for the UI.

## Technical Context

**Language/Version**: Rust (Tauri 2 command + keepalive) · TypeScript/React (EnvTreeNav context menu + useConnectionHealth)

**Primary Dependencies**: `@tauri-apps/api` invoke, Radix ContextMenu, existing `env_set_keep_alive` / `stop_loop`

**Storage**: `keepalive.<instanceId>` must stay `"false"` after disable

**Testing**: Vitest with mocked IPC proving disable → `keepAlive: false`; cargo regression on stop; manual quickstart mandatory

**Target Platform**: Desktop Faro (Windows WebView2)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: OFF visible ≤1s after click

**Constraints**: Constitution unchanged; no pulse-interval changes

**Scale/Scope**: Narrow reliability fix on disable path

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/020-keepalive-off-works/spec.md` + this plan
- [x] Secrets / exfiltration / read-only: unchanged
- [x] Tests planned including FR-007 observable OFF state
- [x] Desktop demonstrable
- [x] Docs note under HU25 after tasks

**Post-design re-check (Phase 1):** PASS.

## Project Structure

### Documentation (this feature)

```text
specs/020-keepalive-off-works/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── disable-keepalive-e2e.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/src/commands/connect.rs   # flatten or harden env_set_keep_alive args; ensure false path
src-tauri/src/keepalive.rs          # stop already emits OFF — verify no re-ON race
src/lib/ipc.ts                      # invoke shape matching Rust params (flat preferred)
src/hooks/useConnectionHealth.ts    # reliable setKeepAlive; no silent swallow
src/components/catalog/EnvTreeNav.tsx  # reliable menu activation (onSelect/onClick)
tests/unit/keepalive_disable.spec.tsx  # mocked IPC: disable → keepAlive false
```

**Structure Decision**: Prefer **flat** Tauri command args (`instanceId`, `enabled`) over nested `payload` to match Tauri 2 docs and eliminate deserialize ambiguity; harden context-menu event binding; add hook-level test with mocked invoke.

## Complexity Tracking

> No constitution violations requiring justification.
