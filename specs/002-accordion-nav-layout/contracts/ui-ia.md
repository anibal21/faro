# Contracts: UI information architecture — accordion layout

**Feature**: 002-accordion-nav-layout  
**Spec**: [../spec.md](../spec.md)

## Window chrome (unchanged)

| Menu | Items |
|------|--------|
| **Ambiente** | Configurar… · Cargar… · Cargar varios… · Conectar · Desconectar |
| **Ver** | Modo claro · Modo oscuro |

## Connected workspace layout

```text
┌──────────────────────────────────────────────────────────┐
│ Faro │ Ambiente │ Ver │  status  │        env selector   │
├────────────┬─────────────────────────────────────────────┤
│ Accordion  │  Tab strip  [workload A] [cm B] [×] …       │
│ ▾ Pods     │  Summary strip (replicas · RAM · CPU · up)  │
│   pay-api  │  Structured | Raw | search-in-logs          │
│   worker   │  Log / ConfigMap body                       │
│ ▸ ConfigMaps│  Finding panel (on analyze click)          │
└────────────┴─────────────────────────────────────────────┘
```

## Interaction rules

- Accordion sections: **Pods**, **ConfigMaps** — independently expandable.
- **No** name filter / buscador in the accordion.
- **No** “Abrir logs” / “Ver logs” button.
- Click **Deployment** under Pods → open/focus tab with **combined replica logs** + summary strip.
- Click **ConfigMap** → open/focus tab with RO keys/values (no summary strip required).
- Tabs: dedupe by identity; all stay open until user closes; log tabs keep follow in background.
- Main area ≥ ~70% width on ≥1280px windows.

## Traceability

| Surface | US | FR |
|---------|----|----|
| Accordion | US1, US4 | FR-001–003, FR-008, FR-011–012 |
| Click open logs | US2 | FR-004, FR-006, FR-013–017 |
| Click open CM | US3 | FR-005, FR-013–014 |
| Summary strip | US2 | FR-016, SC-010 |
