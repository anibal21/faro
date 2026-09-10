# 1. Descripción general del producto

> Sincronizado con Spec Kit `001` + UI `002`–`007` (splash branded, geometría 576×324 → 900×600, chrome polish). Base: **10 HU** + **HU11–HU15** (2026-07-27).

## 1.1. Objetivo

**Propósito:** facilitar el monitoreo de logs y configuración en EKS cuando el acceso corporativo pasa por un **bastión SSH** con `.pem`, sin depender de terminal manual ni de AWS CLI instalado.

**Valor:** instancias por ambiente (PEM + SSH + ruta IAM + región + cluster) → Pods/ConfigMaps → ventanilla de logs por Deployment (vivo) en vista **Structured** (o **Raw**) → click en error/stacktrace → explicación Spring Boot en lenguaje simple.

**Para quién:** desarrollo, ops y perfiles menos técnicos.

## 1.2. Características y funcionalidades principales

| # | Funcionalidad | Prioridad |
|---|---------------|-----------|
| 1 | Splash + purge sesión | Must-Have (P1) |
| 2 | CRUD ambientes (PEM+SSH+IAM+región+cluster) | Must-Have (P1) |
| 3 | Cargar uno/varios + un activo | Must-Have (P1) |
| 4 | Conectar / desconectar bastión | Must-Have (P1) |
| 5 | Explorar Deployments/Pods (cache) | Must-Have (P1) |
| 6 | Explorar ConfigMaps RO | Must-Have (P1) |
| 7 | Logs Structured + Raw | Must-Have (P1) |
| 8 | Análisis Spring Boot al click | Must-Have (P1) |
| 9 | Tema claro/oscuro | Should-Have (P2) |
| 10 | Empaquetado Win/macOS/Linux | Must-Have (P3) |

**Fuera de alcance MVP:** exportar logs a archivo; botón Analizar de todo el buffer; colas/eventos/otros componentes; reglas Flask/NestJS; mutar el cluster; IA generativa en la app; guardar Access Key/Secret dentro de SQLite; dumps de logs en BD.

## 1.3. Diseño y experiencia de usuario

0. Splash / preparando: ventana compacta **576×324** centrada/fija con **imagen branded** lighthouse (sin título overlay; status/error solo abajo-derecha u image-only) + purge sesión (`session_purge_ephemeral`; dwell ≥5s) → principal **900×600** centrada  
1. Chrome profesional: TitleBar + menubar **Ambientes** / **Temas**; rail **Monitor** (árbol de ambientes)  
2. Modal configurar ambiente: nombre, Host, Puerto SSH, Username, Namespace, PEM, **Credenciales IAM**, `region_name`, `cluster_name`  
3. Rail: ambientes → **Pods** / **ConfigMaps** (acordeón)  
4. Pestañas de vista: Pods → **Structured** (default) + **Raw**; ConfigMaps → **solo Raw**  
5. Click en ERROR (Structured) → AnalysisDrawer: qué pasó / qué significa / qué hacer  

**Wireframes (SVG):** [`specs/001-eks-log-monitor/wireframes/`](specs/001-eks-log-monitor/wireframes/)

| # | Archivo | Pantalla |
|---|---------|----------|
| 01 | `01-splash-preparing.svg` | Splash / preparando (BG image slot diferido; purge sesión; conserva conexiones) |
| 02 | `02-empty-workspace.svg` | Workspace vacío + selector Ambiente |
| 03 | `03-new-environment-modal.svg` | Modal nuevo ambiente (PEM + SSH + IAM + región + cluster) |
| 04 | `04-environment-loaded.svg` | Ambiente cargado, Pods, pestañas Structured |
| 05 | `05-configmaps-raw-tabs.svg` | ConfigMaps abiertos, vista Raw |
| 06 | `06-structured-finding-detail.svg` | Detalle de hallazgo al click en ERROR |

> Sign-off formal (`/speckit-wireframe-review` → `## UI Mockup` en `spec.md`) pendiente. Spec: **US1–US10** + FR-023–025 (tema = Should).

## 1.4. Instrucciones de instalación

### Evaluadores / demostración (recomendado)

1. Descarga instaladores desde **[GitHub Releases](https://github.com/anibal21/faro/releases)** (versión estable **1.3.0** u otra publicada).
2. Usa el asset de tu plataforma (`*-setup.exe`, `.dmg`, `.AppImage` / `.deb`). **No** uses el zip “Source code” como instalador.
3. Para probar **sin cluster EKS**, sigue la guía completa: [`DEMO.md`](DEMO.md) (**Usar fixtures demo**).

### Desarrollo local

```bash
npm install
npm run tauri dev
```

Requisitos live (opcional, fuera de la demo): red al bastión, `.pem` real, región/cluster configurados. Credenciales cloud **no** se guardan dentro de Faro (solo rutas).

Ver también [`README.md`](README.md) y [`TESTING.md`](TESTING.md).

## Trazabilidad

- Spec cierre documental: [`specs/030-final-delivery-docs/spec.md`](specs/030-final-delivery-docs/spec.md)  
- Spec producto base: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md)  
- Plan: [`specs/001-eks-log-monitor/plan.md`](specs/001-eks-log-monitor/plan.md)  
- Tasks: [`specs/001-eks-log-monitor/tasks.md`](specs/001-eks-log-monitor/tasks.md) (T001–T085)  
- Tickets: [`6-tickets-de-trabajo.md`](6-tickets-de-trabajo.md) (HU1–HU10)  
- IPC: [`4-comandos-y-eventos-ipc.md`](4-comandos-y-eventos-ipc.md) · [`ipc-commands-events.md`](specs/001-eks-log-monitor/contracts/ipc-commands-events.md)  
- HU: [`5-historias-de-usuario.md`](5-historias-de-usuario.md)  
- Demo: [`DEMO.md`](DEMO.md)
