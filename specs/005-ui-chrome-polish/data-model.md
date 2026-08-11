# Data Model: UI chrome polish (005)

No new SQLite tables. This feature is chrome/UX state only.

## Entities (UI / session)

### ApplicationVersion

| Field | Type | Notes |
|-------|------|--------|
| version | string | From desktop package (`getVersion`), e.g. `0.1.0` |
| display | string | Shown in Monitor footer, e.g. `v0.1.0` |
| fallback | string | `unknown` / `v?` if unavailable |

### SplashDwell

| Field | Type | Notes |
|-------|------|--------|
| minMs | number | Constant `5000` |
| startedAt | timestamp | When splash UI shown |
| readyAt | timestamp | When boot/purge finished |
| transitionAt | timestamp | `max(readyAt, startedAt + minMs)` |

### ProgramChromeTheme

| Field | Type | Notes |
|-------|------|--------|
| mode | `light` \| `dark` | Existing prefs `theme` |
| appliesTo | set | TitleBar, menubar, Monitor rail, main panels |

### AmbientesMenuAction

| Action | Confirm | Effect |
|--------|---------|--------|
| Nuevo… | no | Open new-environment modal |
| Desconectar todo | **always** | On confirm: disconnect all sessions; clear workspace tabs |

## Validation rules

- Ambientes top menu MUST NOT list Edit/Delete/Load/Connect/single Disconnect.
- Left rail context menu schema unchanged from 004 delivery.
- Version footer MUST NOT crash if version resolve fails.

## State transitions

```text
App boot:
  splash → (ready AND dwell≥5s) → main
  splash → error (purge fail; dwell not required to show error)

Theme:
  light ↔ dark  →  TitleBar + shell tokens update

Disconnect all:
  idle → confirm prompt → (cancel → idle) | (ok → disconnecting → idle)
```
