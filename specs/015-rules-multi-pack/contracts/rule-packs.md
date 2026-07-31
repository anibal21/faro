# Contract: Rule packs

## Shipped packs (MVP)

| id | displayName | Path |
|----|-------------|------|
| `springboot` | Spring Boot / JVM | `rules/springboot/default.json` |
| `nodejs` | Node.js | `rules/nodejs/default.json` |

## JSON shape

```json
{
  "id": "springboot",
  "displayName": "Spring Boot / JVM",
  "rules": [
    {
      "id": "springboot.npe",
      "severity": "critical",
      "match_contains": ["NullPointerException"],
      "match_all_contains": [],
      "explanation": "...",
      "recommendation": "..."
    }
  ]
}
```

## Matching

- Hit if: any `match_contains` needle ⊆ text (case-sensitive as today unless pack says otherwise — keep case-sensitive for JVM type names; Node needles chosen accordingly), **and** if `match_all_contains` non-empty then all those needles present.
- `springboot.generic_error`: only if text has `ERROR` or `Exception` / `EXCEPTION` (avoid INFO false criticals). Prefer severity `info`.

## Spring pack enrichment

Must still match demo NPE; add/keep SQL, timeout, OOM, auth needles; tighten generic ERROR gating.
