# Quickstart: GitHub Release Update Check

## Prerequisites

- Windows build of Faro with updater pubkey configured
- GitHub release on `anibal21/faro` with `latest.json` + NSIS + `.sig`
- Or local mock feed for UI-only tests

## Automated

```bash
npx vitest run tests/unit/update_offer_ui.spec.tsx tests/unit/app_menubar_check_updates.spec.tsx
```

(Adjust paths when tests land in `/speckit-tasks` / implement.)

## Manual V1 — startup offer (Windows)

1. Install Faro at version **V** lower than published **W**.
2. Launch → splash → main workspace.
3. Expect update dialog: V → W, Actualizar / Ahora no.
4. Choose **Ahora no** → workspace usable; dialog does not loop in-session.
5. Quit and relaunch → dialog may appear again for W.

## Manual V2 — accept install

1. From offer, **Actualizar**.
2. Observe download progress; NSIS/UAC may appear.
3. Complete install; reopen Faro → version **W**.

## Manual V3 — menu

1. On latest version: **Ayuda → Buscar actualizaciones…** → “al día”.
2. Offline: same menu → clear error; app still usable.

## Manual V4 — non-Windows (if available)

1. Newer remote version → informational notice without install action.
