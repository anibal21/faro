# Research: 016-rich-rules-catalog

## Decision: Extend 015 engine — do not replace matcher

**Rationale**: `match_contains` OR + `match_all_contains` AND already supports specificity; false positives drop with AND needles. Full regex adds review cost without changing product story.

**Alternatives considered**: Regex-per-rule engine — deferred. LLM summarization — forbidden by constitution.

## Decision: Rich rule fields with legacy fallback

**Rationale**: Spec requires title/summary/why/whatToLookFor/recommendations. Existing packs use `explanation` + `recommendation` string. On load:
- `summary` ← `summary` or `explanation` or `""`
- `recommendation` ← string or list → normalized `Vec<String>` / `string[]`
- Missing `title` ← derive short from `id` last segment or first 60 chars of summary
- Missing `why` / `whatToLookFor` / `tags` ← empty defaults

**Alternatives considered**: Big-bang rewrite of all JSON without fallback — breaks mid-migration tests.

## Decision: `recommendation` accepts string | string[]

**Rationale**: Authoring lists is clearer for ops steps; serde custom deserialize (or untagged) normalizes to list in Rust and TS.

## Decision: Signal snippet = literal extract, separate module

**Rationale**: Deterministic heuristics:
1. Prefer first line matching `Caused by:`, `Exception`, `Error:`, `TypeError:`, `Traceback`, `Minified React error`, `UnhandledPromise…`
2. Collect up to 2 following/nearby frames: `\tat `, `at Object.`, `File "…", line N`
3. Cap total snippet length (~2 KiB); if nothing found → `null`

**Alternatives considered**: Always show first 5 lines — noisier. LLM rewrite — forbidden.

## Decision: History stores light summaries only

**Rationale**: Constitution + existing table: persist `summary` (or joined) into `explanation_summary` and first/joined recommendations into `recommendation_summary`. Do **not** persist `signalSnippet` or full write-group text.

## Decision: Five packs embedded; UI `RULE_PACKS` mirrors engine

**Rationale**: Offline reliability. Ids: `springboot`, `liquibase`, `nodejs`, `react`, `python`.

## Decision: Auto-hint = max score among five; tie → springboot

**Rationale**: Spec FR-012. Marker sets (lowercase haystack):

| Pack | Example markers |
|------|-----------------|
| springboot | `java.lang`, `nullpointerexception`, `\tat `, `org.springframework`, `caused by:` |
| liquibase | `liquibase`, `changelog lock`, `databasechangelog`, `checksum validation` |
| nodejs | `unhandledpromiserejection`, `node:internal`, `at object.`, `enoent`, `express` |
| react | `minified react error`, `chunkloaderror`, `hydrat`, `invalid hook call`, `react-dom` |
| python | `traceback (most recent call last)`, `modulenotfounderror`, `django.`, `fastapi`, `sqlalchemy`, `file "` |

Liquibase markers outrank generic JVM when both present (score liquibase separately; if liquibase_score > 0 and ≥ springboot contribution from liquibase-ish lines, prefer liquibase — implement as independent pack scores, highest wins).

**Alternatives considered**: Always require UI pick — worse UX. ML classifier — out of scope.

## Decision: Incremental delivery phases match spec Assumptions

1. Schema + UI + signal  
2. springboot + liquibase catalogs  
3. nodejs + react + python + hint  

## Decision: Copy language Spanish; no cluster mutate advice

**Rationale**: Spec FR-015 / Principle III. Recommendations say “revisa / confirma fuera de Faro”, never “kubectl delete…”.
