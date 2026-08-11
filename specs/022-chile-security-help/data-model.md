# Data Model: Chile Security Help

No SQLite schema changes. Content is **static configuration** in the frontend.

## Entities

### NormEntry

| Field | Type | Rules |
|-------|------|--------|
| `id` | string | Stable key: `ley-21663`, `anci-csirt`, `ley-19628`, `ley-21719` |
| `name` | string | Official/recognizable Spanish name |
| `description` | string | 1–2 sentences; no certification claims about Faro |

**Minimum set (FR-005):** all four ids above MUST exist.

### AlignmentBullet

| Field | Type | Rules |
|-------|------|--------|
| `text` | string | Verifiable product behavior (constitution-aligned) |

**Minimum themes (FR-006):** secrets/paths only; user-configured endpoints only; no third-party telemetry of credentials/logs; K8s v1 read-only; local prefs without full log dumps.

### SecurityDialogModel

| Field | Meaning |
|-------|---------|
| `title` | e.g. Seguridad y marco normativo (Chile) |
| `intro` | 2–4 sentences + org responsibility |
| `norms` | `NormEntry[]` |
| `alignment` | `AlignmentBullet[]` / `string[]` |
| `closeLabel` | e.g. Entendido |

## UI state

```text
securityDialogOpen: boolean  (MainShell or AppMenubar parent)
  false ──Ayuda/Seguridad──► true
  true  ──Entendido/Escape──► false
```

Independent of `activeId` / live connection (FR-008).

## Validation rules

1. Rendered body MUST include substrings `21.663` and (`21.719` OR `19.628`).
2. Rendered body MUST NOT include forbidden certification phrases (see contract).
3. No persistence when opening/closing the dialog.
