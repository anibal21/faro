# Quickstart: Professional workspace chrome (004)

## Prerequisites

- `npm run tauri dev`
- Tailwind + shadcn initialized per [research.md](./research.md)
- Prefer env-tree behavior from 003 available (or implemented in same train)

## Validate chrome

1. Window top shows **Ambientes** and **Temas** only (no bulky brand/status/selector header).
2. **Temas** → Claro / Oscuro persists after restart.
3. **Ambientes** → Nuevo opens configure dialog.

## Validate tree

1. Click **label text** selects env; clicking empty row padding does not select.
2. Right-click env root → Conectar/Desconectar + **Editar configuración**.
3. Edit saves; tree label updates; no secrets shown.

## Validate log workspace

1. Left tree fixed; logs fill remaining width (no right findings column).
2. Open analysis drawer below logs; drag splitter; close drawer; logs reclaim height.
3. Trigger analyze on a write-group → findings appear in the drawer (drawer opens if closed).

## Density smoke

1. Compare to pre-004 screenshots: smaller type, less empty padding on primary surfaces.

## Automated

```bash
npm test
npm run build
```

## Contracts

- [ui-ia.md](./contracts/ui-ia.md)
- [ui-components.md](./contracts/ui-components.md)
- [data-model.md](./data-model.md)
