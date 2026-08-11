# Contract: Rule schema (JSON assets)

## Pack file

```json
{
  "id": "springboot",
  "displayName": "Spring Boot / JVM",
  "rules": [ /* Rule */ ]
}
```

## Rule

```json
{
  "id": "springboot.npe",
  "severity": "critical",
  "match_contains": ["NullPointerException"],
  "match_all_contains": [],
  "title": "NullPointerException",
  "summary": "…",
  "why": "…",
  "whatToLookFor": ["Cannot invoke", "at com…"],
  "recommendation": ["Revisa el stacktrace…", "Valida entradas nulas…"],
  "tags": ["jvm"]
}
```

## Matching (unchanged semantics)

Hit if: (any `match_contains` **or** `match_contains` empty) **and** all `match_all_contains` present; at least one needle list non-empty.

## Legacy

- `explanation` accepted → maps to `summary` when `summary` missing.
- `recommendation` as string → single-element list.
- Generic ERROR/Exception rules: severity `info` only; prefer specific rules with AND needles.
