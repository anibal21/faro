# Contract: Eliminar + fixtures

## Menu (EnvTreeNav context)

Order (indicative):
1. Conectar / Desconectar / Reconectar (as today)
2. Keep-alive items (live only)
3. Editar configuración (non-blocking for demo policy as today or allow edit demo paths)
4. **Eliminar** — all envs including demo

## Eliminar flow

1. Confirm dialog (name of env).
2. If connected → disconnect first (counts toward cap).
3. `envDelete(id)` — **must allow** `faro-demo`.
4. Close tabs for that `instanceId`.
5. Refresh env list — demo stays gone until restore.

## Restore demo

- UI action: existing “Usar fixtures demo” / explicit restore that calls ensure-demo or upsert from `demo_fixture_paths`.
- `list_all` must **not** silently re-insert demo after user deleted it (pref flag `demo.dismissed` or stop unconditional `ensure_demo`).

## Rich fixtures

Demo catalog/logs/YAML/configmaps/services sufficient to walk: tree, open tabs, structured/raw, analyze on synthetic error lines, export smoke.
