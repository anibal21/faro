# Data Model: Live logs workspace UX

No durable schema changes. Log content remains **ephemeral session memory only** (never full dumps in SQLite).

## Durable (unchanged)

Environment / connection rows and catalog caches as in prior features. This feature does not add columns for stick-to-bottom or log buffers.

## Ephemeral entities

### DeploymentLogTabSession

| Attribute | Type | Rules |
|-----------|------|-------|
| `windowId` / tab key | string | Stable while tab open |
| `deploymentName` | string | Catalog identity |
| `viewMode` | `structured` \| `raw` | Existing |
| `stickToBottom` | boolean | Default **true** on open; auto **false** on scroll up; manual toggle |
| `chunks` | ordered list of log chunks | In-memory; may bound (e.g. max ~2000); pod attribution on chunks |
| `historyDepthByPod` | map podName → number | Starts ~500 after initial follow tail; +~500 per successful load-older |
| `exhaustedPods` | set of pod names | Pods that returned no additional older prefix |
| `loadOlderStatus` | idle \| loading \| exhausted \| error | Tab-level UX for the control |
| follow handle | opaque | Cancelled on tab close / disconnect |

### LogChunk (existing shape, conceptual)

| Attribute | Type | Rules |
|-----------|------|-------|
| `podName` | string | Fan-in attribution |
| `text` / lines | string | Ephemeral |
| `seq` / arrival | order key | Arrival order for Raw; Structured builds write-groups from chunks |

### WriteGroup (UI-derived, existing)

| Attribute | Type | Rules |
|-----------|------|-------|
| lines | string[] | Entry + stack continuations |
| severity / error mark | derived | Click → local rules analysis |
| Not persisted | — | Recomputed from chunks |

### ConfigMapTabSession

| Attribute | Type | Rules |
|-----------|------|-------|
| ConfigMap identity + keys/values | existing | Read-only |
| layout | — | Full main-pane height; **no** analysis drawer entity |

### LiveSession (existing)

Bastion tunnel + kube client using bastion-minted bearer token for API calls used by follow and load-older.

## State transitions

### Stick-to-bottom

```text
[on]  --scroll up away from bottom--> [off]
[off] --operator toggles on--> [on] + scroll to newest
[on]  --new chunks--> viewport stays at newest
[off] --new chunks--> viewport unchanged
```

### History paging

```text
open tab --> follow with tail≈500/pod; historyDepth=500
idle --Load older--> loading --prepend unique older lines--> idle (depth+=500)
loading --no new older for all pods--> exhausted (control disabled/clear copy)
loading --error--> error (actionable; no secrets) --> idle/retry
tab close / disconnect --> cancel follow; drop session buffers
```

## Relationships

- `DeploymentLogTabSession` 1—* `LogChunk` (fan-in)
- Chunks → derived `WriteGroup`s in Structured view
- `LiveSession` enables follow + load-older kube reads
- `ConfigMapTabSession` independent of analysis drawer / stick-to-bottom
