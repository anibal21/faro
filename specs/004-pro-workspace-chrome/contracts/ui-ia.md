# UI IA Contract: Professional workspace chrome (004)

## Window chrome

```text
┌─ Ambientes ▾ │ Temas ▾ ─────────────────────────────────────┐
├────────────────┬────────────────────────────────────────────┤
│ Env tree       │ Tabs                                        │
│ (fixed)        │ Structured | Raw | …                        │
│ label-click    │ ┌──────────────────────────────────────────┐│
│ status dots    │ │ LOGS (full remaining width)              ││
│ ctx: Connect/  │ │                                          ││
│  Disconnect/   │ └──────────────────────────────────────────┘│
│  Edit config   │ ═══ splitter (when drawer open) ═══════════ │
│                │ │ Analysis drawer (foldable, closable)    ││
└────────────────┴────────────────────────────────────────────┘
```

## Removed

- Wide header: Faro brand strip + ConnectionStatus + EnvironmentSelector row as primary chrome.
- Permanent right-hand FindingPanel column beside logs.
- Full-row rectangular select hit targets on env tree.

## Interactions

| Control | Behavior |
|---------|----------|
| Ambientes | Program menu for lifecycle |
| Temas | Light / Dark |
| Tree label | Select only |
| Tree chevron | Expand/collapse only |
| Tree status dot | Display only |
| Root context menu | Connect/Disconnect + Editar configuración |
| Analysis drawer | Open/close; vertical resize; holds findings/inspector |

## Density

- Prefer compact control heights (~28–32px), `text-xs`/`text-sm`.
- Avoid large empty padded regions in main and drawer.
