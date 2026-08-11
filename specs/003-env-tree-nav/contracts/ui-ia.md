# UI IA Contract: Environment tree (003)

## Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Faro │ Ambiente │ Ver │ (optional global hints)              │
├──────────────┬──────────────────────────────────────────────┤
│ Env tree     │ Main tabs (env-scoped)                       │
│              │                                              │
│ ▼ EnvA ●green│ [EnvA/payments-api] [EnvB/cm:…]              │
│   ▶ Pods     │ summary / Structured|Raw / ConfigMap body    │
│   ▶ ConfigMaps│                                             │
│ ▶ EnvB ●red  │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- **No** right-side `EnvironmentSelector`.
- **No** standalone Pods/ConfigMaps accordion outside the tree.
- Status ● = green connected / yellow connecting / red disconnected (display only).

## Tree interactions

| Target | Primary click | Expand control | Right-click |
|--------|---------------|----------------|-------------|
| Environment root | Select | Expand/collapse children | Context menu: Conectar **or** Desconectar (one item) |
| Section Pods/ConfigMaps | Expand/collapse (or no-op select) | Expand/collapse | No connect menu |
| Catalog leaf | Open/focus tab (002 behavior) | N/A | No connect menu |

## Empty / disconnected

- No saved envs: left empty-state CTA to configure environment.
- Env disconnected: Pods/ConfigMaps children empty + connect hint.
- Multi-connect: multiple greens allowed.

## Accessibility

- Tree keyboard navigation via `react-complex-tree`.
- Context-menu action also available via keyboard (Context Menu key / Shift+F10 or documented equivalent).
- Status icon has accessible name including state (e.g. “conectado”).

## Out of scope (this contract)

- Drag-and-drop reorder of environments.
- Search/filter inside the tree.
- Icon-click toggle connect.
