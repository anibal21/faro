# 1. Descripción general del producto

> Sincronizado con Spec Kit `specs/001-eks-log-monitor/` (spec + plan + wireframes + auth IAM file path, 2026-07-23).

## 1.1. Objetivo

**Propósito:** facilitar el monitoreo de logs y configuración en EKS cuando el acceso corporativo pasa por un **bastión SSH** con `.pem`, sin depender de terminal manual ni de AWS CLI instalado.

**Valor:** instancias por ambiente (PEM + SSH + ruta IAM + región + cluster) → Pods/ConfigMaps → ventanilla de logs por Deployment (vivo) en vista **Structured** (o **Raw**) → click en error/stacktrace → explicación Spring Boot en lenguaje simple.

**Para quién:** desarrollo, ops y perfiles menos técnicos.

## 1.2. Características y funcionalidades principales

| # | Funcionalidad | Prioridad |
|---|---------------|-----------|
| 1 | Instancias de conexión (N ambientes: bastión SSH, PEM path, IAM credentials path, `region_name`, `cluster_name`) | Must-Have (P1) |
| 2 | Conexión vía bastión sin SSH manual; token EKS desde archivo IAM (ruta) | Must-Have (P1) |
| 3 | Explorador **Pods** (por Deployment) + **ConfigMaps** (solo lectura) | Must-Have (P1) |
| 4 | Una ventanilla de logs por Deployment; réplicas agregadas; follow en vivo; multi-ventana; búsqueda | Must-Have (P1) |
| 5 | Vista **Structured** por defecto (grupo = cada escritura al log; stacktrace suele ser una escritura) | Must-Have (P1) |
| 6 | Vista **Raw** opcional (botón): volcado tipo terminal **sin manipulación** | Must-Have (P1) |
| 7 | Click en error/stacktrace (Structured) → motor de reglas Spring Boot (severidad + explicación simple + acción) | Must-Have (P2) |
| 8 | Empaquetado desktop Windows / macOS / Linux | Must-Have (P3) |

**Fuera de alcance MVP:** exportar logs a archivo; botón Analizar de todo el buffer; colas/eventos/otros componentes; reglas Flask/NestJS; mutar el cluster; IA generativa en la app; guardar Access Key/Secret dentro de SQLite.

## 1.3. Diseño y experiencia de usuario

1. Chrome **Ambiente** / **Ver** + selector de ambiente (arriba-derecha)  
2. Modal configurar ambiente: nombre, Host, Puerto SSH, Username, Namespace, PEM, **Credenciales IAM**, `region_name`, `cluster_name`  
3. Rail: **Deployments** + acordeones **Pods** (réplicas) / **ConfigMaps**  
4. Pestañas de vista (hasta 4): Pods → **Structured** (default) + **Raw**; ConfigMaps → **solo Raw**  
5. Click en ERROR (Structured) → panel derecho: qué pasó / qué significa / qué hacer  

**Wireframes (SVG):** [`specs/001-eks-log-monitor/wireframes/`](specs/001-eks-log-monitor/wireframes/)

| # | Archivo | Pantalla |
|---|---------|----------|
| 01 | `01-empty-workspace.svg` | Workspace vacío + selector Ambiente |
| 02 | `02-new-environment-modal.svg` | Modal nuevo ambiente (PEM + SSH + IAM + región + cluster) |
| 03 | `03-environment-loaded.svg` | Ambiente cargado, Pods, pestañas Structured |
| 04 | `04-configmaps-raw-tabs.svg` | ConfigMaps abiertos, vista Raw |
| 05 | `05-structured-finding-detail.svg` | Detalle de hallazgo al click en ERROR |

> Sign-off formal (`/speckit-wireframe-review` → `## UI Mockup` en `spec.md`) pendiente. Spec: US1–US5 + Clarifications.

## 1.4. Instrucciones de instalación

> Pendientes tras scaffold. Requisitos de usuario: red al bastión, `.pem`, credenciales cloud fuera de Faro.

Ver [`readme.md`](readme.md) y `QUICK-START.md` (cuando exista).

## Trazabilidad

- Spec: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md)  
- HU: [`5-historias-de-usuario.md`](5-historias-de-usuario.md)  
- Checklist: `specs/001-eks-log-monitor/checklists/requirements.md`
