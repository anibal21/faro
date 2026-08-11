# Data Model: Professional workspace chrome (004)

## UI state entities

### AppMenubar

| Field | Notes |
|-------|--------|
| menus | `ambientes`, `temas` only |
| ambientes actions | new, edit(selected), delete(selected), optional connect/disconnect shortcuts |
| temas actions | `light`, `dark` (extend later) |

### EnvTreeSelection

| Field | Notes |
|-------|--------|
| selectedInstanceId | From label click only |
| hitTarget | Label text bounds — not full row |

### EnvContextMenu

| Action | Notes |
|--------|--------|
| connect / disconnect | Per 003 |
| editConfiguration | Opens edit dialog for `instanceId` |

### LogWorkspaceLayout

| Field | Notes |
|-------|--------|
| leftNavFixed | boolean true |
| logWidth | 100% of main column |
| analysisDrawerOpen | boolean |
| analysisDrawerHeightPx | number when open |
| findings | existing AnalysisFinding[] shown in drawer |

### ThemePreference

Existing durable pref; no schema change required unless adding new theme keys.

## Optional persistence

| Key | Store | Notes |
|-----|--------|--------|
| `analysis_drawer_height` | ui_preferences or session | Optional polish |
| `analysis_drawer_open` | session only | Prefer not durable |

## Relationships

```text
AppMenubar.temas --> ThemePreference
EnvTreeSelection --> EnvironmentNode (003)
EnvContextMenu.edit --> ConnectionInstance (durable)
LogWorkspace --> tabs (002/003) + AnalysisDrawer(findings)
```

## Validation

- Menubar MUST NOT include Ver or environment selector control.
- Select events only from label activation.
- Drawer closed ⇒ findings UI not taking horizontal log width.
