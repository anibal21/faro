# UI Components Contract: shadcn adoption (004)

## Stack

| Piece | Choice |
|-------|--------|
| Styling | Tailwind CSS |
| Components | shadcn/ui under `src/components/ui/*` |
| Icons | Prefer `lucide-react` (shadcn default) sparingly |

## Required primitives (minimum set)

| Primitive | Used for |
|-----------|----------|
| `Menubar` | Ambientes / Temas |
| `ContextMenu` | Env root actions |
| `Dialog` | New/Edit environment |
| `Button` | Compact actions |
| `Input` / `Label` | Forms |
| `Tabs` | Log Structured/Raw (optional replace) |
| `ScrollArea` | Logs + drawer |
| `Resizable` | Logs / analysis drawer split |
| `Separator` | Menus |
| `DropdownMenu` | Fallback if Menubar limited |

## Theming

- Light/dark via CSS variables compatible with shadcn.
- Bridge existing `data-theme` or migrate to `class="dark"` on root — pick one in implement and update `useTheme`.

## Non-goals

- No remote font CDN required for MVP (system stack OK for density/professional look).
- No analytics or shadcn cloud services.
- Do not import entire unused shadcn catalog — add components as needed.

## IPC

No new backend commands required for chrome alone. Edit/connect reuse existing env IPC. Multi-session commands per 003 contracts if not yet present.
