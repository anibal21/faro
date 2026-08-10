# Research: Keep-Alive Toggle ACL

## R1 — Root cause: command registered, ACL missing

**Decision**: Treat missing Tauri 2 permission/capability as the primary cause of “OFF does nothing” when IPC/runtime already looked correct (017–020).

**Rationale**: Tauri 2 denies `invoke` for commands not allowed by the window capability. `env_set_keep_alive` was in `invoke_handler` but not in `faro.toml` / `default.json`, so disable failed at the ACL boundary; UI could revert or show error while keep-alive stayed ON.

**Alternatives considered**:
- Re-debug IPC flatten / menu handlers only — already covered by 020; symptom persisted until ACL was checked.
- Disable ACL / use unrestricted capabilities in dev — insecure and diverges from prod.

## R2 — Permission identifier naming

**Decision**: Use `allow-env-set-keep-alive` with `commands.allow = ["env_set_keep_alive"]`, mirroring `allow-env-connect` / `allow-env-disconnect`.

**Rationale**: Consistent with existing Faro permission naming; one permission covers both ON and OFF (same command, `enabled` bool).

**Alternatives considered**:
- Separate allow-on / allow-off permissions — unnecessary; one command.
- Reuse a broad “allow all env commands” — violates least privilege.

## R3 — Where to grant

**Decision**: Add `"allow-env-set-keep-alive"` to `src-tauri/capabilities/default.json` (main window), same list as other env session commands.

**Rationale**: Keep-alive toggle is invoked from the main shell only; no secondary windows need the command.

**Alternatives considered**:
- Custom capability file per feature — overkill for one allow entry.

## R4 — Verification without flaky E2E

**Decision**: Vitest reads `faro.toml` and `default.json` and asserts both contain `allow-env-set-keep-alive` (and toml contains `env_set_keep_alive`). Manual quickstart proves live OFF after restart.

**Rationale**: ACL is static config; file asserts catch regressions if someone removes the grant. Runtime denial is hard to unit-test without stripping permissions in a separate harness.

**Alternatives considered**:
- Cargo integration that boots Tauri with ACL — heavy for this fix.
- Only manual checklist — fails FR-005 / SC-003 automation bar.

## R5 — UI fallback when health row missing

**Decision** (related hardening, optional in tasks): `keepAliveOn` must not assume ON solely because `connectedIds` includes the id when health is missing — that re-showed ON after failed/empty refresh.

**Rationale**: Amplifies ACL failures; prefer explicit `healthById[id]?.keepAlive === true`.

**Alternatives considered**: Keep 018 “assume ON while connected” — caused false ON after deny/fail paths.
