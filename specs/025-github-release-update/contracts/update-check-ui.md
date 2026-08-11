# Contract: Update check UI

## Triggers

1. **Startup**: After splash → main workspace ready → fire check once.
2. **Manual**: Menubar **Ayuda → Buscar actualizaciones…**

## Dialog: update available

Must show:
- Current version
- Available version
- Primary: **Actualizar** (Accept) — enabled only if `canInstall`
- Secondary: **Ahora no** (Reject)

On non-Windows with newer version: informational copy; no install primary (or disabled with explanation).

## Manual “up to date”

Short message: ya está en la última versión.

## Manual / download errors

Non-blocking error text; workspace remains usable.

## Session rule

After Reject/dismiss in a session, do not re-open the offer until next app process start (startup check may run again then).
