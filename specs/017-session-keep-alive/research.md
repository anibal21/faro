# Research: 017-session-keep-alive

## Decision: Heartbeat = kube API read via existing live client (primary)

**Rationale**: Live sessions already hold a `kube::Client` tunneled through the bastion. A cheap read (e.g. `GET /readyz` or `GET /version` / list namespaces with limit) proves tunnel + API + auth still work. Aligns with FR-004 (remote path) and FR-005 (read-only).

**Alternatives considered**:
- `ping 127.0.0.1` — rejected (spec forbidden as primary; does not keep SSH/token alive).
- Only SSH `ServerAliveInterval` — helpful but does not refresh EKS token or prove kube API; use as **complement** when opening tunnel, not sole mechanism.
- Bastion `ssh echo` only — proves SSH but not EKS token/API.

## Decision: Complement — refresh EKS token when near expiry

**Rationale**: Idle can be token TTL as much as SSH. On heartbeat (or when remaining TTL &lt; ~5 min), reuse existing bastion `get-token` path and rebuild client if needed. Skip if still fresh.

**Alternatives considered**: Always re-token every 60s — noisier and slower; unnecessary if token long-lived.

## Decision: Optional SSH keepalive flags on tunnel open

**Rationale**: OpenSSH `-o ServerAliveInterval=30 -o ServerAliveCountMax=3` reduces silent NAT drops. Apply for **live** tunnels only; does not replace application-level health UI.

## Decision: State machine — connected → (fail streak) → disconnected

**Rationale**: Spec MVP: after **3 consecutive** failed heartbeats → **desconectado** (honest). Intermediate **degradado** MAY be shown after 1–2 failures for UX (“último pulso falló”) without offering full reconnect yet; after 3 → desconectado + Reconectar.

**Alternatives considered**: Immediate disconnect on first fail — flaky on blips. Only degradado forever — unclear recovery.

## Decision: Timer ownership in Rust

**Rationale**: Authoritative session lives in `RuntimeState`. Spawn/abort per-instance task when keep-alive toggled; emit Tauri event `session-health` or rely on UI polling `env_connection_states` every few seconds. Prefer **event + poll fallback**.

## Decision: Persist keep-alive preference per instance

**Rationale**: Soft preference in SQLite `ui_preferences` or column/key `keepalive:<instanceId>=true|false` so after reconnect intent survives. Default OFF if missing. Last pulse **not** persisted.

## Decision: Demo / offline skips keep-alive

**Rationale**: No bastion path; toggle disabled or hidden for builtin demo.

## Decision: Reconnect = `env_connect(Some(id))`

**Rationale**: Already rebuilds tunnel + token + catalog; UI must not require form. On success, if preference ON, restart heartbeat loop.
