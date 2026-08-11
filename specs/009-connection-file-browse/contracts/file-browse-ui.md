# Contract: File browse UI

## Scope

UI + Tauri dialog plugin behavior for PEM / IAM path entry on `NewEnvironmentModal`. No change to `env_upsert` / `env_list` IPC payloads.

## Browse control

| Control | Field | Action |
|---------|-------|--------|
| Browse (PEM) | `pemPath` | Open single-file picker; on select set absolute path |
| Browse (IAM) | `iamCredentialsPath` | Open single-file picker; on select set absolute path |

### Picker options (normative)

- `multiple`: false  
- `directory`: false  
- **No** `filters`  
- **No** required custom `defaultPath` (OS default start folder)

### Results

| Result | UI effect |
|--------|-----------|
| Absolute path string | Update that field only |
| Cancel / dismiss | Leave field unchanged |
| Plugin error / unavailable | Set browse-broken; show message; **disable Save** |

## Save gate

| Condition | Save |
|-----------|------|
| `browseBroken === false` | Allowed (subject to existing field validation) |
| `browseBroken === true` | **Blocked**; message that Browse must work before saving |
| User cancelled a healthy picker | Does **not** set broken; Save allowed |

Clear `browseBroken` when Browse opens successfully again (whether user selects a file or cancels).

## Path hygiene

- Dialog MUST return filesystem path only (never file bytes into form state).
- Form MUST NOT read PEM/IAM file contents for this feature.
- Persist via existing upsert: path strings only.

## Manual entry & fixtures

When Browse is healthy:

- Typing/pasting into path inputs remains valid.
- “Usar fixtures demo” may set both paths programmatically without Browse.

## Accessibility / copy (Spanish UI)

- Button label: **Examinar** (or “Browse…” acceptable if matching existing English chrome; prefer Spanish consistent with modal).
- Broken message (example): “No se puede guardar: el selector de archivos no está disponible. Reintenta Examinar.”

## Test doubles

`openPathPicker()` MUST be mockable in Vitest to return `{ ok: path } | { cancelled: true } | throw`.
