# UI Contract: Chrome polish (005)

## Top menubar — Ambientes

| Item | Visible | Behavior |
|------|---------|----------|
| Nuevo… | yes | Opens new environment modal |
| Desconectar todo | yes | Always confirmation → disconnect all + close workspace tabs |
| Editar / Eliminar / Cargar / Conectar / Desconectar (single) | **no** | Removed from top menu only |

## Top menubar — Temas

Unchanged (Claro / Oscuro).

## TitleBar (custom)

| Element | Behavior |
|---------|----------|
| Drag region | Moves window (`data-tauri-drag-region`) |
| Title | Product name (e.g. Faro) |
| Minimize / Maximize / Close | Window controls; themed |
| Theme | Background/foreground follow `data-theme` / `.dark` |

Window config: `decorations: false`.

## Monitor rail (left)

| Element | Behavior |
|---------|----------|
| Title | **Monitor** (not Ambientes) |
| Tree expanders | lucide Plus (collapsed) / Minus (expanded) |
| Context menu | **Unchanged** from current product (Conectar / Desconectar / Editar configuración) |
| Footer | App version `v{x.y.z}` or fallback |

## Typography

| Surface | Target |
|---------|--------|
| Base UI | ~13px (VS Code workbench default) |
| Fonts | Existing families retained |
