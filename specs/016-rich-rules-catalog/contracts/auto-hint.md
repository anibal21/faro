# Contract: Auto-hint (five packs)

## Inputs

- `text` (possibly truncated)
- optional `sourceHint`

## Output

`packId` ∈ { `springboot`, `liquibase`, `nodejs`, `react`, `python` } + `reason`.

## Algorithm

1. Lowercase haystack = text + ` ` + sourceHint.
2. Score each pack by count of its markers present (see [research.md](../research.md)).
3. Highest score wins.
4. Tie or all zero → `springboot` (`default`).
5. Explicit known `rulePack` bypasses hint; unknown → `springboot`.

## Tests (required)

| Fixture theme | Expected pack |
|---------------|---------------|
| JVM NPE / Spring | springboot |
| Liquibase lock | liquibase |
| UnhandledPromiseRejection | nodejs |
| ChunkLoadError / Minified React | react |
| Python Traceback | python |
| `INFO something fine` | springboot (default) |
