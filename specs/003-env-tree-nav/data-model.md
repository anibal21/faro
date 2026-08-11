# Data Model: Environment tree navigation (003)

## Entities (UI / runtime)

### EnvironmentNode (tree root)

| Field | Notes |
|-------|--------|
| `instanceId` | Durable PK from `connection_instance` |
| `name` | Display |
| `clusterName` | Display beside name |
| `regionName` | Optional secondary disambiguation |
| `connectionStatus` | `disconnected` \| `connecting` \| `connected` \| `error` |
| `selected` | UI focus (one at a time) |
| `expanded` | Tree expand state (UI) |

### SectionNode

| Field | Notes |
|-------|--------|
| `kind` | `pods` \| `configmaps` |
| `parentInstanceId` | Owner environment |
| `expanded` | UI |

### CatalogLeaf

| Field | Notes |
|-------|--------|
| `kind` | `deployment` \| `configmap` |
| `instanceId` | Scope |
| `namespace` | |
| `name` | |
| `id` | Stable id within env catalog |

### ConnectedSet

Zero or more `instanceId` with `connectionStatus === connected` (or connecting). Independent of `selected`.

### WorkspaceTab (extends 002)

| Field | Notes |
|-------|--------|
| `navKey` | Includes `instanceId` (see research) |
| `instanceId` | Required |
| `kind` | `deployment` \| `configmap` |
| … | Existing chunks/summary/detail fields |

## Runtime (Rust)

### EnvSession

| Field | Notes |
|-------|--------|
| `instance_id` | Key |
| `status` | connecting / connected / error |
| `catalog_epoch` | Optional |
| `tunnel` | Optional handle |
| Log cancel tokens | Per `window_id`, attributable to `instance_id` |

### RuntimeInner (evolution)

```text
sessions: HashMap<instance_id, EnvSession>
log_cancels: HashMap<window_id, Cancel>  // window → instance mapping retained
```

Remove sole reliance on `connected_instance_id: Option<String>`.

## Durable (unchanged core)

- `connection_instance` rows remain path-only secrets model.
- No new secret columns.
- Session catalog tables SHOULD be keyed by `instance_id` if not already (extend as needed for multi hydrate).

## State transitions

```text
Environment connection:
  disconnected --context menu Conectar--> connecting
  connecting --success--> connected
  connecting --fail--> disconnected (+ error message)
  connected --context menu Desconectar--> disconnected
  (peer environments unaffected)

Selection:
  any --label click--> selected (previous unselected)
  independent of connection transitions

Disconnect environment:
  → cancel logs/tabs for that instanceId only
```

## Validation rules

- Tree roots = all saved instances (empty store → empty-state copy).
- Catalog leaves only populated when that instance is connected (else empty/hint).
- Status icon colors: green/yellow/red per FR-011; error may share red + message.
- Context menu only on environment roots (single action).
