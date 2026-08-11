# Contract: UI keep-alive

## Placement

On **connected live** environment row in `EnvTreeNav` (or adjacent connection chrome):

1. Toggle **Mantener conexión viva** (default off).
2. Status chip/text: Conectado / Degradado / Desconectado.
3. **Último pulso** line when applicable.
4. Button **Reconectar** when status is `degraded` (optional) or **required** when `disconnected` after failure (not while healthy).

## Demo

- Toggle disabled or hidden; no heartbeat.

## Noise

- No toast on each successful pulse.
- Optional single toast/banner on transition to disconnected.

## Polling

- Refresh states on toggle, on `session-health` event, and light poll (e.g. 5–10s) while any keep-alive ON or any non-connected status visible.
