# Data Model: 016-rich-rules-catalog

## Entities

### RulePack (asset)

| Field | Notes |
|-------|--------|
| `id` | `springboot` \| `liquibase` \| `nodejs` \| `react` \| `python` |
| `displayName` | UI label |
| `rules` | Rule[] |

### Rule

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Stable, e.g. `springboot.npe` |
| `severity` | yes | `critical` \| `warn` \| `info` |
| `match_contains` | OR needles | Empty only if `match_all_contains` non-empty |
| `match_all_contains` | optional | All must hit |
| `title` | preferred | Short UI title |
| `summary` | preferred | Qué pasó (1–2 frases) |
| `explanation` | legacy | Maps to `summary` if summary absent |
| `why` | optional | Por qué suele ocurrir |
| `whatToLookFor` | optional | string[] señales |
| `recommendation` | yes* | string **or** string[] → normalized list |
| `tags` | optional | e.g. `db`, `auth`, `migration`, `network` |

\*At least one recommendation string after normalization (may fall back to empty list only for broken assets — tests should reject empty for shipped rules).

**Validation**: Non-empty `id`; severity enum; at least one match needle set non-empty.

### AnalysisFinding (IPC)

| Field | Notes |
|-------|--------|
| `severity`, `ruleId` | unchanged |
| `title` | string (may be `""`) |
| `summary` | string |
| `why` | string |
| `whatToLookFor` | string[] |
| `recommendation` | string[] (always array on wire) |
| `tags` | string[] optional |
| `explanation` | **deprecated on wire** — omit or mirror `summary` for one release if needed |

### AnalyzeResult (IPC)

| Field | Notes |
|-------|--------|
| `findings` | AnalysisFinding[] |
| `packId`, `packDisplayName` | as 015 |
| `signalSnippet` | string \| null — literal extract |

### StackHint (ephemeral)

| Field | Notes |
|-------|--------|
| `packId` | Winner among five packs |
| `reason` | `*_markers` or `default` |

### SignalSnippet (ephemeral)

Literal multi-line string derived from truncated write-group text; not persisted in SQLite.

## Relationships

```text
WriteGroup.text + optional rulePack + sourceHint
  → truncate 64KiB
  → resolve pack (explicit | auto_hint)
  → match RulePack.rules → findings[] (rich)
  → extract signalSnippet
  → AnalyzeResult
  → optional light history (summary + recommendations joined)
```

## Lifecycle

- Packs: compile-time assets; no in-app CRUD.
- Hint/snippet: per analyze call.
- Override: UI tab/component state (015), unchanged.
