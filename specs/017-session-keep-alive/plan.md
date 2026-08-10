# Implementation Plan: Session Keep-Alive

**Branch**: `017-session-keep-alive` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-session-keep-alive/spec.md`

**Note**: Optional pre-hook `/speckit-wireframe-review` available; keep-alive is a small control on EnvTree — wireframes optional.

## Summary

Add a **per live environment** toggle **Mantener conexión viva** (default OFF). When ON, Faro runs a **60s** read-only **remote heartbeat** through the existing bastion/EKS/kube session (never localhost ping as primary). Extend connection state to **conectado | degradado | desconectado** with **last successful pulse**; after **3 consecutive** failures mark **desconectado** and offer **Reconectar** via existing `env_connect` without re-filling the form.

## Technical Context

**Language/Version**: Rust (Tauri runtime / connect / SSH tunnel) · TypeScript/React (EnvTreeNav / connection chrome)

**Primary Dependencies**: Existing `RuntimeState` / `SessionEntry`, `env_connect` / `env_disconnect` / `env_connection_states`, `ssh::tunnel`, kube `Client` for live sessions

**Storage**: Keep-alive ON/OFF may persist in `ui_preferences` or session-scoped memory for MVP — prefer **persist per instance id** lightly so reconnect restores intent; last pulse is ephemeral

**Testing**: Cargo unit tests for failure counter / state machine; Vitest for toggle + status + reconnect affordance; quickstart manual

**Target Platform**: Desktop Faro

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Heartbeat &lt; ~2s typical; no UI jank; no toast spam on success

**Constraints**: Constitution III/IV/VI — read-only pulse; no exfiltration; no localhost-as-primary; demo skip

**Scale/Scope**: One timer per connected live session with keep-alive ON; multi-session map already exists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/017-session-keep-alive/spec.md` + this plan
- [x] Secrets: heartbeats use existing session creds/paths only; never log PEM/tokens
- [x] No exfiltration (VI): pulse stays on user bastion/EKS path
- [x] Network: only user-configured infrastructure
- [x] Read-only K8s: heartbeat = GET health / equivalent read
- [x] Local rules analyzer: N/A (unchanged)
- [x] Tests planned for Must-Have stories
- [x] Desktop demonstrable
- [x] AI4Devs docs sync (HU25) after tasks

**Post-design re-check (Phase 1):** PASS — no constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/017-session-keep-alive/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── keep-alive-api.md
│   ├── connection-health.md
│   └── ui-keep-alive.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src-tauri/src/
├── runtime.rs                 # SessionEntry: keep_alive, health, fail_count, last_pulse
├── commands/connect.rs        # env_set_keep_alive, richer env_connection_states, heartbeat hook
├── session/keepalive.rs       # NEW — interval loop + kube/SSH pulse + fail threshold
└── ssh/tunnel.rs              # optional: SSH ServerAlive* when opening live tunnel

src/
├── lib/ipc.ts                 # ConnectionHealth, envSetKeepAlive, extended states
├── components/catalog/EnvTreeNav.tsx  # toggle + status + Reconectar
└── hooks/…                    # poll or event-driven state refresh
```

**Structure Decision**: Keep heartbeat in Rust runtime (authoritative); UI only toggles and displays. Reconnect = call existing `env_connect(instanceId)`.

## Complexity Tracking

> No constitution violations requiring justification.
