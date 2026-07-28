# Research: Environment tree navigation (003)

## 1. Lightweight React tree library

**Decision**: Use **`react-complex-tree`** as the left-nav tree control.

**Rationale**:
- Focused tree widget (not a full design system) — matches FR-007 “lightweight”.
- Strong keyboard/accessibility story (tree roles, expand/collapse, focus).
- Supports controlled items, custom renderers (status icon beside name), and context-menu integration patterns for right-click Conectar/Desconectar.
- Works with React 18/19 + Vite without requiring MUI/Ant/Chakra.

**Alternatives considered**:
| Option | Why not |
|--------|---------|
| `react-arborist` | Excellent DX; weaker built-in a11y/context-menu story than RCT for our menu requirement |
| Mantine / Ant Design Tree | Pulls large design-system surface area for one panel |
| Fluent UI React Tree | Heavier Fluent dependency footprint |
| Fully custom `role="tree"` | Smallest bundle but more a11y/keyboard debt; defer unless RCT conflicts with Tauri/jsdom tests |

**Implementation notes**:
- Custom `renderItem` for name + cluster + `EnvTreeStatusDot`.
- Suppress default browser menu; open Faro context menu on environment **root** items only (not on Pods/ConfigMaps section nodes or leaves).
- Chevron/expand uses library expand interaction; primary click on title selects environment (FR-003/009).

---

## 2. Multi-environment concurrent connections

**Decision**: Replace single `connected_instance_id: Option<String>` with **`sessions: HashMap<String, EnvSession>`** in `RuntimeInner`. Connecting B MUST NOT remove A.

**Rationale**: Spec FR-013 / SC-009; clarified explicitly.

**EnvSession (runtime, ephemeral)**:
- `status`: `disconnected | connecting | connected | error`
- `catalog_epoch: Option<String>`
- `tunnel: Option<TunnelHandle>` (demo may be stub)
- Catalog rows for that instance live in session cache keyed by instance id (extend existing session tables or in-memory maps)

**IPC**:
- `env_connect { instanceId }` — upsert session; do **not** drain peer sessions
- `env_disconnect { instanceId }` — tear down **only** that session + its log follows for that instance
- Catalog/logs/workload commands take **`instanceId`** (required when multi-connected)
- Optional `env_connection_states` → `[{ instanceId, status }]` for tree dots (or derive from connect events)

**Alternatives considered**:
- Soft max of N connections with hard block — rejected; spec forbids forced single-session. Soft **advisory toast** if ≥5 concurrent is OK in polish, non-blocking.
- Keep global “active” connect and fake multi green UI — rejected; violates FR-013.

**Demo strategy**: Offline fixtures continue; each connect hydrates that instance’s catalog independently (may reuse same demo seed data tagged by instance id).

---

## 3. All saved environments in the tree

**Decision**: Tree roots = `env_list` (all durable instances). Deprecate **navigation** dependence on `loadedIds` / `EnvironmentSelector`.

**Rationale**: Clarification B + FR-002/006.

**Implications**:
- Remove `EnvironmentSelector` from `MainShell`.
- `Ambiente → Cargar…` MAY remain for bulk “pin” if still useful, but is **not required** to see an env in the tree; plan tasks should remove or demote load-as-gate UX.
- `selectedId` (label click) remains for focus; distinct from connected set.

---

## 4. Tab / catalog scoping with multi-connect

**Decision**: Extend `navKey` to include environment id:

- Deployment: `deployment:{instanceId}:{namespace}/{name}`
- ConfigMap: `configmap:{instanceId}:{namespace}/{name}`

Tab chrome SHOULD show environment name (or short id) when ≥2 connected or when tabs from multiple envs coexist.

**Rationale**: FR-014 — no silent cross-mix.

**On disconnect(instanceId)**: Close tabs belonging to that instance; cancel its log follows; leave other envs’ tabs running.

---

## 5. Status icon colors

**Decision**: CSS tokens — green `#16a34a` connected, yellow `#ca8a04` connecting, red `#dc2626` disconnected (align with existing `ConnectionStatus` dots). Icon is **non-interactive** status; connect via context menu only.

**Alternatives**: Click-icon-to-toggle — rejected by clarification (right-click menu).

---

## 6. Relation to feature 002 accordion

**Decision**: **Replace** `AccordionNav` with `EnvTreeNav`. Keep LogWindow / WorkloadSummaryStrip / fan-in / ConfigMapTab behaviors; re-parent open actions under env-scoped leaves.

---

## 7. Soft resource guidance (non-blocking)

**Decision**: No hard cap in v1 of this feature. Optional polish: if concurrent connected count ≥ 5, show a non-blocking hint (“Muchas conexiones pueden consumir recursos”). Never auto-disconnect to enforce the hint.
