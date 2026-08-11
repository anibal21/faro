# Contract: UI without last-pulse line

## EnvTree / connection chrome

**Remove**: any user-visible “Último pulso” / “hace Ns” / “hace Nm” tied to keep-alive.

**Keep / require**:
- Session status as today (Conectado / Degradado / Desconectado) where applicable.
- Explicit keep-alive state: e.g. `Keep-alive: ON` or `Keep-alive: OFF` (Spanish OK if consistent).

## Menu

Action labels unchanged from 018:
- ON → **No mantener conexión viva**
- OFF → **Mantener conexión viva**
