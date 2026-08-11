# Contract: Auto-hint

## Inputs

- `text` (possibly truncated)
- optional `sourceHint` string

## Output

`packId` ∈ { `springboot`, `nodejs` } + internal `reason`.

## Algorithm (normative)

1. Lowercase copies of text and sourceHint for marker scans (matching rules remain as defined per pack).
2. Accumulate scores:
   - JVM markers (examples): `java.lang`, `nullpointerexception`, `\tat `, `org.springframework`, `.exception`, `caused by:`
   - Node markers (examples): `unhandledpromiserejection`, `node:internal`, `at object.`, `typeerror:`, `enoent`, `express`
3. If JVM score > Node score → `springboot` (`jvm_markers`).
4. If Node score > JVM score → `nodejs` (`node_markers`).
5. Else → `springboot` (`default`).

## Non-goals

- No network.
- No reading cluster labels in MVP (sourceHint text only if already provided by UI).
