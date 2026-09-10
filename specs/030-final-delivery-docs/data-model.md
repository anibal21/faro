# Data Model: 030-final-delivery-docs

Modelo conceptual de **artefactos de entrega** (no entidades SQLite de producto).

## Entities

### DeliveryPullRequest

Registro en `7-pull-requests.md` para una entrega formal AI4Devs.

| Field | Description | Validation |
|-------|-------------|------------|
| deliveryIndex | 1, 2 o 3 | Obligatorio; mapea plantilla |
| title | Título del PR | No vacío |
| url | URL GitHub del PR | URL https; para entrega 3 puede completarse al abrir el PR |
| state | Open / Merged / etc. | Texto |
| branch | Rama origen → destino | Texto |
| scopeSummary | Qué entrega | ≥1 párrafo |
| ticketsOrSpecs | HU / specs cubiertos | Lista o rango |
| reviewNotes | Ajustes humanos | Puede ser breve |

**Relationships**: Delivery 1 → GH #1; Delivery 2 → GH #2; Delivery 3 → PR de cierre documental (nuevo).

### ProjectFichaUrls

Campos 0.4 / 0.5 (y eco en README).

| Field | Description | Validation |
|-------|-------------|------------|
| releasesUrl | Versión / instaladores | MUST = `https://github.com/anibal21/faro/releases` |
| repoUrl | Código fuente | `https://github.com/anibal21/faro` |
| stableVersionLabel | Etiqueta humana | p. ej. `1.3.0` / `v1.3.0` |

### DemoGuide

Documento `DEMO.md`.

| Field | Description | Validation |
|-------|-------------|------------|
| path | Ruta repo | `DEMO.md` en raíz |
| readmeLink | Enlace desde README | Visible (tabla y/o quick start) |
| steps | Pasos numerados | ≥10 con resultado esperado |
| fixtureDisclaimer | Fixtures no son secretos reales | Obligatorio |
| releasesPointer | Cómo obtener binario | Enlace Releases |

### FinalProjectSection

Bloque narrativo de cierre.

| Field | Description | Validation |
|-------|-------------|------------|
| location | README (y/o doc enlazado) | Al menos README |
| contents | Alcance, entregables, demo, releases, PRs, fuera de alcance | Cubre US4 |

## State transitions

```text
[Docs incompletas]
    → actualizar ficha URLs
    → completar PR2
    → redactar DEMO.md
    → sección proyecto final + README
    → documentar PR3 (URL al abrir)
    → [Listo para PR de entrega final]
```

## Validation rules (from spec)

- Sin placeholders “Pendiente” / “<!-- completar -->” en campos obligatorios de ficha y PR1–PR2.
- PR3: si URL pendiente, instrucción explícita de completar en el mismo PR de cierre.
- DEMO no exige cluster EKS real.
