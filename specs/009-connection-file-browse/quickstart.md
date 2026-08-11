# Quickstart: Connection file browse

## Prerequisites

- Faro desktop (`npm run tauri dev`) on Windows (or other desktop target with dialog plugin enabled)
- Any local file usable as a path stand-in (does not need to be a real PEM for this UI check)

## Validate Browse fills paths

1. Ambiente → Configurar nuevo ambiente (or Edit).
2. Next to **PEM (ruta)**, click **Examinar** → select any file → field shows absolute path.
3. Next to **Credenciales IAM (ruta)**, click **Examinar** → select any file → field updates.
4. Optionally edit the path text, then **Guardar**.
5. Re-open edit: paths match what was saved (round-trip). See [data-model.md](./data-model.md).

## Validate cancel

1. Pre-fill or Browse a PEM path.
2. Examinar → Cancel → path unchanged.
3. Guardar still works if other required fields are valid.

## Validate fixtures + manual entry

1. Click **Usar fixtures demo** → PEM/IAM paths populate without Browse.
2. Or type paths manually with Browse healthy → Guardar succeeds.

## Validate Save block (manual / simulated)

- Desktop: hard to force dialog failure; prefer Vitest mock that throws from `openPathPicker` → Guardar disabled + message; then mock success/cancel → Guardar enabled again.
- Contract: [contracts/file-browse-ui.md](./contracts/file-browse-ui.md).

## Automated checks

```powershell
npm test
```

Expect unit coverage for picker result mapping and integration coverage for Browse / cancel / Save-block on the environment modal.
