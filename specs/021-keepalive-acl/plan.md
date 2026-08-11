# Implementation Plan: Keep-Alive Toggle ACL

**Branch**: `021-keepalive-acl` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-keepalive-acl/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` skipped — ACL-only fix, no UI chrome change.

## Summary

Authorize `env_set_keep_alive` in Tauri 2 ACL so **No mantener conexión viva** is not rejected by the capability gate. Root cause after 017–020: command registered in `lib.rs` but missing from `permissions/faro.toml` and `capabilities/default.json`. Add `allow-env-set-keep-alive`, grant it on the default capability, prove with an automated ACL check, and document the “new command ⇒ permission + capability” rule.

## Technical Context

**Language/Version**: Tauri 2 ACL (TOML permissions + JSON capabilities); no new languages

**Primary Dependencies**: Existing `env_set_keep_alive` (Rust), `envSetKeepAlive` (TS); Tauri capability system

**Storage**: N/A (ACL is config at build/load time; keepalive pref unchanged)

**Testing**: Vitest file-content assert on `faro.toml` + `default.json`; manual quickstart after `tauri dev` restart

**Target Platform**: Desktop Faro (Windows WebView2 first)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Toggle invoke succeeds once ACL loads; OFF visible ≤1s (unchanged from 020)

**Constraints**: Constitution unchanged; restart required after capability edits; do not broaden ACL beyond this command

**Scale/Scope**: Two config files + regression test + docs note; runtime/IPC already from 017–020

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/021-keepalive-acl/spec.md` + this plan
- [x] Secrets / exfiltration / read-only K8s: unchanged (ACL only)
- [x] Local prefs for keepalive: unchanged
- [x] Tests planned: ACL unit assert (FR-005 / SC-003); manual OFF path
- [x] Desktop demonstrable after restart
- [x] AI4Devs docs: note under HU25 / tickets after tasks

**Post-design re-check (Phase 1):** PASS — no new network, secrets, or mutating K8s surface.

## Project Structure

### Documentation (this feature)

```text
specs/021-keepalive-acl/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── keepalive-acl.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
src-tauri/permissions/faro.toml           # [[permission]] allow-env-set-keep-alive
src-tauri/capabilities/default.json       # grant allow-env-set-keep-alive
src-tauri/src/lib.rs                      # already registers env_set_keep_alive (verify only)
tests/unit/keepalive_acl.spec.ts          # asserts permission + capability strings present
```

**Structure Decision**: Follow the established Faro pattern (002/012): every `#[tauri::command]` must have a matching `allow-*` in `faro.toml` **and** appear in `capabilities/default.json`. No capability plugin or custom ACL runtime — static config only.

## Complexity Tracking

> No constitution violations requiring justification.
