# Contract: Packs catalog (MVP volumes)

| id | displayName | Target rule count | Must cover |
|----|-------------|-------------------|------------|
| `springboot` | Spring Boot / JVM | 25–40 | NPE, OOM, BeanCreation, DataSource/Hikari/SQL, Security 401/403, WebClient/Feign/timeouts, validation, Kafka (if cheap), Actuator-ish; generic ERROR info-only |
| `liquibase` | Liquibase | 8–12 | changelog lock, checksum validation failed, migration failed, DATABASECHANGELOG* signals |
| `nodejs` | Node.js | 15–20 | UnhandledRejection, TypeError, ENOENT/ECONN*, Express/Nest commons, node:internal stacks |
| `react` | React | 8–12 | ChunkLoadError, hydration mismatch, Minified React error, Invalid hook call, failed to fetch chunk |
| `python` | Python | 15–20 | Traceback, ModuleNotFound/ImportError, KeyError/TypeError/AttributeError, Django/Flask/FastAPI, SQLAlchemy/psycopg |

## Paths

```text
rules/<id>/default.json
```

Embedded at compile time; register all five in engine + `RULE_PACKS` in UI.

## Quality bar

Spanish ops tone; no “mutate cluster from Faro” steps; specific before generic.
