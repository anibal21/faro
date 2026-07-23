# FARO

**Monitoreo de logs EKS vía bastión** — *Ilumina los logs. Gobierna el cluster.*

> App de escritorio (Windows, macOS, Linux): splash de arranque, instancias por ambiente, **Pods/Deployments** + **ConfigMaps**, logs en vivo con vista **Structured** (default) y **Raw** (terminal sin manipulación), click en stacktrace → reglas Spring Boot. Sin SSH manual. Proyecto final AI4Devs.

---

## Primera vez? Quick start

```bash
# Requisitos: Node.js 20+, Rust (stable), AWS CLI/credenciales, acceso SSH al bastión
# (detalle en QUICK-START.md cuando esté disponible)

# Clonar e instalar (tras scaffold Spec Kit / Tauri)
cd faro
npm install
npm run tauri dev
```

> Spec Kit (producto): [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md)  
> Semilla / plan interno: [`docs/SPEC.md`](docs/SPEC.md)  
> Constitución: [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.1.0)  
> Referencia entrega: [AI4Devs-finalproject-Example1](https://github.com/LIDR-academy/AI4Devs-finalproject-Example1)

---

## Documentación del Proyecto

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**0-ficha-del-proyecto.md**](0-ficha-del-proyecto.md) | Información general y datos del proyecto | Actualizado (splash + ER) |
| [**1-descripcion-general-del-producto.md**](1-descripcion-general-del-producto.md) | Objetivos, funcionalidades y UX | Actualizado (splash + wireframes 01–06) |
| [**2-arquitectura-del-sistema.md**](2-arquitectura-del-sistema.md) | Diagramas, componentes y decisiones técnicas | Actualizado (draw.io 01–04 + splash) |
| [**3-modelo-de-datos.md**](3-modelo-de-datos.md) | Entidades + Mermaid + ER SQLite | Actualizado (durable + session + splash purge) |
| [**4-especificaciones-de-la-api.md**](4-especificaciones-de-la-api.md) | Contratos commands / IPC | Actualizado (`session_purge_ephemeral`, catalog cache) |
| [**5-historias-de-usuario.md**](5-historias-de-usuario.md) | HU con criterios de aceptación | Actualizado (HU0 splash + HU5 desktop) |
| [**6-tickets-de-trabajo.md**](6-tickets-de-trabajo.md) | Tickets (backend / frontend / BD) | Pendiente (`/speckit-tasks`) |
| [**7-pull-requests.md**](7-pull-requests.md) | PRs del desarrollo | Pendiente |
| [**prompts.md**](prompts.md) | Registro de uso de IA (≤3 prompts/sección) | En progreso |
| [**prompts-conversacion-inicial.md**](prompts-conversacion-inicial.md) | Consultas 1ª conversación (sin respuestas) | Completo |
| [**prompts-flujo-trabajo-speckit.md**](prompts-flujo-trabajo-speckit.md) | Flujo Spec Kit + sync readme | Completo |
| [**specs/001-eks-log-monitor/spec.md**](specs/001-eks-log-monitor/spec.md) | Spec Kit — especificación formal | Draft (specify + clarify + plan; FR-023/024) |
| [**specs/001-eks-log-monitor/plan.md**](specs/001-eks-log-monitor/plan.md) | Spec Kit — plan técnico | Completo (splash + SQLite tiers) |
| [**specs/001-eks-log-monitor/wireframes/**](specs/001-eks-log-monitor/wireframes/) | Mockups SVG (6 pantallas, 01=splash) | En revisión (pre sign-off) |
| [**docs/architecture/**](docs/architecture/) | Diagramas draw.io + SVG | Completo (contexto, componentes, secuencia, ER SQLite) |

## Índice

1. [Ficha del proyecto](#0-ficha-del-proyecto)
2. [Descripción general del producto](#1-descripción-general-del-producto)
3. [Arquitectura del sistema](#2-arquitectura-del-sistema)
4. [Modelo de datos](#3-modelo-de-datos)
5. [Especificación de la API](#4-especificación-de-la-api)
6. [Historias de usuario](#5-historias-de-usuario)
7. [Tickets de trabajo](#6-tickets-de-trabajo)
8. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

<!-- Completar -->

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

App de escritorio multi-OS: instancias por ambiente (**PEM + SSH + ruta IAM + region + cluster**), **Pods/Deployments** + **ConfigMaps**, logs en vivo (**Structured** default / **Raw** botón), click en stacktrace → reglas Spring Boot. Sin export ni Analizar de buffer en MVP.

### **0.4. URL del proyecto:**

<!-- Completar cuando exista el repo remoto -->

### **0.5. URL o archivo comprimido del repositorio:**

<!-- Completar -->

> Detalle: [0-ficha-del-proyecto.md](0-ficha-del-proyecto.md)

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Reducir fricción al monitorear EKS detrás de bastión SSH; valor para perfiles técnicos y no técnicos (explicaciones simples).

### **1.2. Características y funcionalidades principales:**

- Splash de arranque (BG image diferida) + purge sesión/logs efímeros; **conserva** ambientes
- Instancias de conexión (N ambientes: PEM + SSH + ruta IAM + `region_name` + `cluster_name`)
- Pods por Deployment + ConfigMaps (solo lectura); catálogo cacheado 1× por conexión
- Logs en vivo: **Structured** (default, por escritura) + **Raw** (botón, sin manipulación)
- Click en error/stacktrace → motor Spring Boot (explicación simple)
- Empaquetado Windows / macOS / Linux  
- **No** export de logs ni Analizar de buffer; **no** secretos IAM/PEM en SQLite (MVP)

### **1.3. Diseño y experiencia de usuario:**

> Splash → Ambiente/Ver + selector; modal PEM+SSH+IAM+región+cluster; rail Deployments/Pods/ConfigMaps; pestañas Structured/Raw; panel hallazgo. Wireframes `01`–`06` en `specs/001-eks-log-monitor/wireframes/`.

### **1.4. Instrucciones de instalación:**

> Tras scaffold. Requisitos: bastión, `.pem`, credenciales cloud fuera de Faro.

**Documentación completa:** [1-descripcion-general-del-producto.md](1-descripcion-general-del-producto.md) · [spec.md](specs/001-eks-log-monitor/spec.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

App de escritorio **Tauri 2**: splash → UI React → commands Rust → SQLite (durable + session) / reglas locales / túnel SSH (PEM **path**) + archivo IAM (**path**) → token EKS (`region_name` + `cluster_name`) → bastión → EKS → Pods/ConfigMaps (solo lectura). Constitution VI: sin egress de credenciales ni datos de dominio a terceros.

| # | Diagrama | SVG | Editable |
|---|----------|-----|----------|
| 1 | Contexto del sistema | [01-system-context.svg](docs/architecture/01-system-context.svg) | [01-system-context.drawio](docs/architecture/01-system-context.drawio) |
| 2 | Componentes internos | [02-components.svg](docs/architecture/02-components.svg) | [02-components.drawio](docs/architecture/02-components.drawio) |
| 3 | Secuencia conectar → logs → hallazgo | [03-connection-sequence.svg](docs/architecture/03-connection-sequence.svg) | [03-connection-sequence.drawio](docs/architecture/03-connection-sequence.drawio) |
| 4 | ER SQLite (durable + session) | [04-sqlite-er.svg](docs/architecture/04-sqlite-er.svg) | [04-sqlite-er.drawio](docs/architecture/04-sqlite-er.drawio) |

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Rol |
|------------|------------|-----|
| UI | React + TS + Vite | Splash, Ambiente/Ver, catálogo, Structured/Raw, panel hallazgo |
| Shell | Tauri 2 | Ventana mínima + principal, IPC, empaquetado Win/macOS/Linux |
| Commands | Rust | Ambientes, session_purge, túnel, token EKS, kube RO, logs, analyze |
| SSH | russh (o ssh sistema) | Port-forward; PEM solo por ruta |
| AWS | aws-sdk-rust | Lee archivo IAM (ruta) → token EKS; region_name + cluster_name |
| K8s | kube-rs | List/get RO; hydrate catálogo 1× por connect; follow logs |
| BD | SQLite (`tauri-plugin-sql`) | Durable (ambientes/prefs) + session cache (purge splash) |
| Reglas | Motor local | Spring Boot al click; sin IA generativa en producto |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Ver [Estructura del Proyecto](#estructura-del-proyecto) y [2-arquitectura-del-sistema.md](2-arquitectura-del-sistema.md). Plan: [specs/001-eks-log-monitor/plan.md](specs/001-eks-log-monitor/plan.md).

### **2.4. Infraestructura y despliegue**

App de escritorio multiplataforma; demo local/en vivo (URL pública no estricta). CI básico build+tests (Vitest, `cargo test`, ≥1 E2E).

### **2.5. Seguridad**

PEM e IAM solo por **ruta** local; `region_name` + `cluster_name`; TLS con CA del cluster; RBAC de solo lectura en v1; **no** telemetría/LLM con datos de usuario (constitution VI).

### **2.6. Tests**

Unitarios + integración + ≥1 E2E del flujo principal (ambiente → conectar → logs → hallazgo).

**Documentación completa:** [2-arquitectura-del-sistema.md](2-arquitectura-del-sistema.md) · [docs/architecture/](docs/architecture/)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Mermaid + ER draw.io en [3-modelo-de-datos.md](3-modelo-de-datos.md) y [`04-sqlite-er`](docs/architecture/04-sqlite-er.drawio): **durable** (`ConnectionInstance`, prefs, historial ligero) + **session** (catálogo/cache; purge en splash).

### **3.2. Descripción de entidades principales:**

Ver documento detallado.

**Documentación completa:** [3-modelo-de-datos.md](3-modelo-de-datos.md)

---

## 4. Especificación de la API

> Faro no expone REST HTTP al usuario: **Tauri commands** + events (`env_*`, `session_purge_ephemeral`, `k8s_*`, `catalog_refresh`, `logs_*`, `analyze_write_group`, `prefs_*`). Detalle en [4-especificaciones-de-la-api.md](4-especificaciones-de-la-api.md) y `contracts/tauri-commands.md`.

**Documentación completa:** [4-especificaciones-de-la-api.md](4-especificaciones-de-la-api.md)

---

## 5. Historias de Usuario

> Documentar ≥3 historias principales con criterios de aceptación.

**Historia de Usuario 0:** Splash + purge de sesión (conserva ambientes)  
**Historia de Usuario 1:** Instancias de conexión (PEM + SSH + ruta IAM + región + cluster)  
**Historia de Usuario 2:** Explorar Pods y ConfigMaps (cache 1× por connect)  
**Historia de Usuario 3:** Logs Structured / Raw  
**Historia de Usuario 4:** Análisis Spring Boot al click (stacktrace)  
**Historia de Usuario 5:** Desktop multi-OS  

**Documentación completa:** [5-historias-de-usuario.md](5-historias-de-usuario.md) · Spec Kit: [specs/001-eks-log-monitor/spec.md](specs/001-eks-log-monitor/spec.md)

---

## 6. Tickets de Trabajo

> ≥3 tickets: uno backend (Rust/Tauri), uno frontend (React), uno de base de datos (SQLite).

**Ticket 1:** Backend — túnel SSH + cliente EKS/kube  
**Ticket 2:** Frontend — visor de logs + Analizar  
**Ticket 3:** Base de datos — esquema SQLite y persistencia de perfiles  

**Documentación completa:** [6-tickets-de-trabajo.md](6-tickets-de-trabajo.md)

---

## 7. Pull Requests

> Documentar ≥3 Pull Requests del desarrollo.

**Pull Request 1:** \[Pendiente\]  
**Pull Request 2:** \[Pendiente\]  
**Pull Request 3:** \[Pendiente\]  

**Documentación completa:** [7-pull-requests.md](7-pull-requests.md)

---

## Estructura del Proyecto

```
faro/
├── readme.md
├── prompts.md
├── prompts-conversacion-inicial.md
├── prompts-flujo-trabajo-speckit.md
├── 0-ficha-del-proyecto.md … 7-pull-requests.md
├── docs/
│   ├── SPEC.md
│   └── architecture/           # draw.io + SVG (contexto, componentes, secuencia, ER)
│       ├── 01-system-context.drawio / .svg
│       ├── 02-components.drawio / .svg
│       ├── 03-connection-sequence.drawio / .svg
│       └── 04-sqlite-er.drawio / .svg
├── .specify/                   # Spec Kit
├── specs/001-eks-log-monitor/  # spec, plan, data-model, contracts, wireframes (01-06)
├── src/                        # React + Vite (tras scaffold)
└── src-tauri/                  # Rust / Tauri (tras scaffold)
```

---

## Testing y Calidad

- Unitarios (Rust + TS)
- Integración (commands + SQLite)
- E2E del flujo principal (splash → perfil → conectar → logs → analizar)

**Detalles:** `TESTING.md` (pendiente)

---

## Registro de uso de IA

Ver [prompts.md](prompts.md) — hasta 3 prompts clave por sección del ciclo de vida, con notas de guía humana.

Consultas íntegras de la primera conversación (solo usuario): [prompts-conversacion-inicial.md](prompts-conversacion-inicial.md).

Flujo de trabajo Spec Kit + documentación: [prompts-flujo-trabajo-speckit.md](prompts-flujo-trabajo-speckit.md).

---

## Licencia / Académico

Proyecto parte del programa **AI4Devs** (proyecto final), con fines educativos.

**Producto:** Faro  
**Stack:** Tauri 2 · React · TypeScript · SQLite · Spec Kit  
**Proceso:** Spec-Driven Development + documentación de entrega formato AI4Devs Example1
