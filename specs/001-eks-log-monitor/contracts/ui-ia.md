# Contracts: UI information architecture

**Feature**: 001-eks-log-monitor  
**Wireframes**: [../wireframes/](../wireframes/)

## Window chrome

| Menu | Items |
|------|--------|
| **Ambiente** | Configurar nuevo ambiente… · Cargar ambiente configurado… · Cargar varios ambientes… · Desconectar |
| **Ver** | Modo claro · Modo oscuro |
| **Ayuda** | (placeholder for later: about / quickstart) |

## Screens (MVP mockups)

Formulario **nuevo ambiente** (`02-new-environment-modal.svg`): nombre, Host bastión, Puerto SSH, Username SSH, Namespace (opc.), PEM path, **IAM credentials path**, `region_name`, `cluster_name`.

1. **Empty workspace** — no active/loaded env; empty state + CTA (`01-empty-workspace.svg`).
2. **New environment modal** — full connect form above (`02-new-environment-modal.svg`).
3. **Environment loaded** — Deployments/Pods/ConfigMaps + tabs (`03-environment-loaded.svg`).
4. **ConfigMaps Raw** — (`04-configmaps-raw-tabs.svg`).
5. **Structured finding** — (`05-structured-finding-detail.svg`).

## Interaction rules

- Opening logs starts in **Structured**.
- **Raw** is a chrome button, not a separate menu.
- No buffer-wide **Analyze** control.
- No **Export** control in MVP chrome.
- Theme applies app chrome; Raw panel may keep dark terminal contrast for readability.
- Loading multiple environments populates the sidebar; only **active** drives cluster ops.

## Traceability

| Screen | Primary US | Key FR |
|--------|------------|--------|
| Empty | US-001 | FR-001 |
| Loaded | US-002 | FR-004, FR-005 |
| Structured | US-003, US-004 | FR-019–022, FR-012–013 |
| Raw | US-003 | FR-018, FR-021 |
