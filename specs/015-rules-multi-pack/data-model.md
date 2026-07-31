# Data Model: 015-rules-multi-pack

## Entities

### RulePack (asset)

| Field | Notes |
|-------|--------|
| `id` | e.g. `springboot`, `nodejs` |
| `displayName` | UI label |
| `rules` | Rule[] |

### Rule

| Field | Notes |
|-------|--------|
| `id` | Stable id, e.g. `springboot.npe` |
| `severity` | `critical` \| `warn` \| `info` |
| `match_contains` | OR needles (any hit) |
| `match_all_contains` | Optional AND needles (all must hit) |
| `explanation` | Operator-facing |
| `recommendation` | Operator-facing |

**Validation**: Non-empty id; at least one of match_contains / match_all_contains non-empty; severity in enum.

### StackHint (ephemeral)

| Field | Notes |
|-------|--------|
| `packId` | Resolved pack |
| `reason` | Optional short code for tests/UI (`jvm_markers`, `node_markers`, `default`) |

### AnalysisResult (IPC)

| Field | Notes |
|-------|--------|
| `findings` | AnalysisFinding[] |
| `packId` | Pack actually applied |
| `packDisplayName` | For UI |

### AnalysisFinding (unchanged fields)

severity, ruleId, explanation, recommendation — plus client may show pack from parent result.

## Relationships

```text
WriteGroup.text + optional rulePack + sourceHint
  --> auto_hint? --> packId
  --> RulePack.rules --> match --> findings[]
  --> AnalysisResult
```

## Lifecycle

- Packs: compile-time assets; no CRUD in app.
- Hint: computed per analyze call.
- Override: UI stores preferred `rulePack` in component/tab state (not required in SQLite for MVP).
