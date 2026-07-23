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

0. **Splash / preparando** — ventana mínima al abrir (`01-splash-preparing.svg`): título **Faro**, **imagen de fondo** (faro) a full-bleed dentro de la ventana — *asset diferido a implementación* (el wireframe solo muestra el slot), texto *Herramienta de monitoreo infraestructura para ambiente AWS*, *…preparando aplicación*. Mientras se muestra, Faro ejecuta purge de residuos **efímeros de sesión/logs** (nunca borra ambientes ni prefs durables). Al terminar → abre ventana principal.

Formulario **nuevo ambiente** (`03-new-environment-modal.svg`): nombre, Host bastión, Puerto SSH, Username SSH, Namespace (opc.), PEM path, **IAM credentials path**, `region_name`, `cluster_name`.

1. **Empty workspace** — no active/loaded env; empty state + CTA (`02-empty-workspace.svg`).
2. **New environment modal** — full connect form above (`03-new-environment-modal.svg`).
3. **Environment loaded** — Deployments/Pods/ConfigMaps + tabs (`04-environment-loaded.svg`).
4. **ConfigMaps Raw** — (`05-configmaps-raw-tabs.svg`).
5. **Structured finding** — (`06-structured-finding-detail.svg`).

## Interaction rules

- App launch always shows splash first; main chrome only after `session_purge_ephemeral` completes.
- Opening logs starts in **Structured**.
- **Raw** is a chrome button, not a separate menu.
- No buffer-wide **Analyze** control.
- No **Export** control in MVP chrome.
- Theme applies app chrome; Raw panel may keep dark terminal contrast for readability.
- Loading multiple environments populates the sidebar; only **active** drives cluster ops.

## Traceability

| Screen | Primary US | Key FR |
|--------|------------|--------|
| Splash | US-005 | FR-023, FR-024 |
| Empty | US-001 | FR-001 |
| Loaded | US-002 | FR-004, FR-005 |
| Structured | US-003, US-004 | FR-019–022, FR-012–013 |
| Raw | US-003 | FR-018, FR-021 |
