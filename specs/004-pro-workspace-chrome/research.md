# Research: Professional workspace chrome (004)

## 1. UI kit: shadcn/ui on Vite + Tauri

**Decision**: Initialize **shadcn/ui** with the **Vite + React** preset, **Tailwind CSS**, and copy primitives into `src/components/ui`.

**Rationale**: Matches user/spec Assumptions; composable Radix accessibility; no heavy design-system runtime; works in Tauri WebView.

**Setup outline** (implement phase):
- Add Tailwind (+ `@tailwindcss/vite` or PostCSS per current shadcn docs)
- `npx shadcn@latest init` → `components.json`, CSS variables
- Add components as needed: `menubar`, `dropdown-menu`, `context-menu`, `dialog`, `button`, `input`, `scroll-area`, `separator`, `resizable`, `tabs`, `badge`, `tooltip`

**Alternatives considered**:
| Option | Why not |
|--------|---------|
| Mantine / Ant Design | Larger footprint; fights “lightweight + dense” |
| Keep hand-rolled CSS only | No cohesive system (FR-004 fail) |
| MUI | Heavy; default density too spacious |

**Density**: Override shadcn theme tokens — smaller `--radius`, compact padding utilities (`px-2 py-1`, `text-xs` default for chrome). Avoid large empty `p-8` layouts.

---

## 2. Application menu: Ambientes | Temas

**Decision**: Use shadcn **Menubar** at the top of `MainShell` (native-app feel). Remove brand/status/selector header strip.

**Ambientes** (minimum): Nuevo…, Editar… (selected), Eliminar…, separator, Conectar/Desconectar selected (optional shortcuts consistent with tree), keep Load only if still useful after “all saved in tree”.

**Temas**: Claro / Oscuro → existing `useTheme` / `prefs_set`.

**Connection status**: Only on tree status dots (FR-013); optional tiny footer later — out of scope unless needed.

**Alternatives**: OS-native Tauri menu — deferred; web Menubar is enough for cross-platform demo and matches shadcn.

---

## 3. Tree: label-only hit target + context menu Edit

**Decision**: Prefer a **controlled tree built with shadcn Collapsible + ContextMenu** (or thin wrapper) so the **clickable select target is only the text label** (`span`/`button` around name+cluster), while chevron and status dot are separate controls. Full-row `Button`/`div` hit areas are forbidden for select.

If `react-complex-tree` from 003 plan is already integrated, configure custom renderers so only title text receives select; otherwise **do not block 004 on RCT** — custom tree is acceptable and often clearer for label-only hits.

**Context menu on environment root**:
1. Conectar **or** Desconectar (stateful single primary, or both disabled appropriately)
2. **Editar configuración** → open `NewEnvironmentModal` / edit dialog with that instance

**Alternatives**: Full-row select — rejected by FR-005.

---

## 4. Log workspace layout

**Decision**: Horizontal: `[ fixed EnvTree | main ]`. Main vertical: `[ tabs + toolbar ][ logs ScrollArea flex-1 full width ][ ResizableHandle ][ AnalysisDrawer ]` with drawer **collapsible to height 0 / unmounted**.

**Analysis**: Move `FindingPanel` into `AnalysisDrawer`. Opening drawer: manual toggle + **auto-open when user triggers analyze** on a write-group (recommended UX default).

**Resizable**: shadcn `ResizablePanelGroup` direction `vertical`.

**Alternatives**: Analysis on the right — rejected by clarification. Bottom sheet without resize — rejected by FR-010.

---

## 5. Sequencing vs feature 003

**Decision**: Treat **003 + 004 as one delivery train for UI**:
- If multi-session IPC/runtime from 003 is not landed, implement it per `specs/003-env-tree-nav/plan.md` alongside this chrome.
- If AccordionNav still present, replace with EnvTreeNav under shadcn chrome in this feature’s tasks.

**Rationale**: 004’s FRs assume fixed env tree, status dots, connect context menu; shipping Menubar alone on old accordion contradicts the clarified product.

---

## 6. Theme persistence

**Decision**: Keep existing prefs IPC; Temas menu calls `setTheme`. Map `data-theme` / `class="dark"` to shadcn CSS variables.

---

## 7. Soft defaults (non-blocking)

| Topic | Default |
|-------|---------|
| Drawer initial state | Closed |
| Drawer on analyze click | Open |
| Min drawer height when open | ~120px |
| Left tree width | ~240–280px, optionally resizable later (out of scope unless easy) |
