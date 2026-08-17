# Research: Demo Fixtures Repair & Rich Catalog

## R1 — Root cause of broken preload

**Decision**: La regresión se debió a **`fixtures/demo.pem` ausente del repo** combinado con **`.gitignore` `*.pem`**, que impedía versionar el archivo aunque existiera localmente. `demo_fixture_paths` fallaba con *"demo fixtures not found"*.

**Rationale**: El botón **Usar fixtures demo** llama IPC `demo_fixture_paths`; sin archivo en disco la precarga nunca completa (FR-001).

**Alternatives considered**: Generar PEM en build script (más frágil, no visible en clone). Hardcodear path sintético sin archivo (rompe validación de existencia de PEM en upsert).

## R2 — Versionar placeholder sin filtrar secretos reales

**Decision**: Añadir `fixtures/demo.pem` con contenido **claramente fake** y excepción gitignore `!fixtures/demo.pem`. Perfil durable sigue guardando solo la ruta absoluta/canónica.

**Rationale**: Constitution II — no PEM reales en repo; el placeholder existe para resolución de path y demos offline.

**Alternatives considered**: Renombrar a `.demo.pem` fuera del glob (confuso). Usar sentinel `'offline'` como `faro-demo` para todos (pierde detección multi-env custom).

## R3 — Tauri bundle resources layout

**Decision**: En `tauri.conf.json` usar mapa de recursos:

```json
"resources": {
  "../fixtures/": "fixtures/"
}
```

Clave = origen relativo a `src-tauri/`; valor = destino bajo `$RESOURCE`. Runtime busca `resource_dir()/fixtures/demo.pem` vía `app.path().resource_dir()`.

**Rationale**: Formato mapa invertido (`dest: src`) provocó error de build *"resource path fixtures\demo.pem doesn't exist"*. Copiar carpeta completa preserva `demo.pem` + `demo-iam-credentials`.

**Alternatives considered**: Array `["../fixtures/demo.pem"]` (termina bajo `_up_/fixtures/` — requiere paths extra en resolver). Embed en binario (overkill).

## R4 — Runtime path resolution order

**Decision**: `resolve_demo_fixture_paths` prueba en orden:

1. `app.path().resource_dir()/fixtures` (instalador)
2. `CARGO_MANIFEST_DIR/../fixtures` (dev/tests desde `src-tauri`)
3. CWD y parent `fixtures/`
4. `./fixtures` y `../fixtures`

**Rationale**: Cubre `tauri dev`, `cargo test`, clone fresco y NSIS/DMG sin depender solo de CWD.

**Alternatives considered**: Solo CWD (fallaba en packaged app). Variable de entorno `FARO_FIXTURES_DIR` (no pedida).

## R5 — Catálogo demo “fotogénico”

**Decision**: `hydrate_demo_catalog` seed:

| Sección | Recursos |
|---------|----------|
| Deployments | `payments-api`, `payments-worker` — cada uno **2/2** réplicas |
| Pods | 2 bajo api, 2 bajo worker |
| Services | `payments-api`, `payments-worker` |
| ConfigMaps | `payments-config` (2 entries), `payments-secrets` (2 entries) |

`demo_deployment_yaml` usa `replicas: 2` para ambos.

**Rationale**: Spec FR-004 / SC-002 — árbol poblado para capturas y logs combinados de 2 réplicas.

**Alternatives considered**: Renombrar a `agenda-api` (fuera de scope). 3 réplicas (conflictúa con clarificación “dos hijos”).

## R6 — Demo logs fan-in

**Decision**: `start_demo_follow` y `load_older_demo` generan solo `{deployment}-aaa` y `{deployment}-bbb` cuando no hay `pod_name` explícito.

**Rationale**: FR-005 / SC-003 — alinear stream con catálogo 2-pod; evitar tercer pod fantasma `-ccc`.

**Alternatives considered**: Leer réplicas del catálogo en runtime (más acoplamiento; defer unless needed).

## R7 — Multi-env fixture (sin cambios de arquitectura)

**Decision**: Reutilizar 024: `is_fixture_backed` (path contains `fixtures/demo.pem` o builtin demo) → `ConnectMode::Demo` + `hydrate_demo_catalog(instance_id)`. Límite 2 sesiones de 023 sin cambios.

**Rationale**: FR-006 / SC-004 ya soportado; esta feature solo restaura datos y enriquece seed.

**Alternatives considered**: Columna `is_test_fixture` en DB (rechazada en spec assumptions).
