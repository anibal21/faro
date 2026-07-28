# FARO

**Monitoreo de logs EKS vía bastión** — *Ilumina los logs. Gobierna el cluster.*

> App de escritorio (Windows, macOS, Linux): splash branded compacto, instancias por ambiente, **Pods/Deployments** + **ConfigMaps**, logs en vivo con vista **Structured** (default) y **Raw**, click en stacktrace → reglas Spring Boot. Sin SSH manual. **HU1–HU15** (base + UI 002–007). Proyecto final AI4Devs.

---

## Primera vez? Quick start

```bash
# Requisitos: Node.js 20+, Rust (stable), AWS CLI/credenciales, acceso SSH al bastión

cd faro
npm install
npm run tauri dev
```

### Build instaladores (US10)

```bash
npm run tauri build
# Artefactos: src-tauri/target/release/bundle/ (nsis / dmg / appimage)
```

Demo offline: en el modal de ambiente usa **Usar fixtures demo** (`fixtures/demo.pem` + `fixtures/demo-iam-credentials`).

Validación: [`TESTING.md`](TESTING.md) · [`specs/001-eks-log-monitor/quickstart.md`](specs/001-eks-log-monitor/quickstart.md)

> Spec Kit (producto): [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md)  
> Semilla / plan interno: [`docs/SPEC.md`](docs/SPEC.md)  
> Constitución: [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.1.0)  
> Referencia entrega: [AI4Devs-finalproject-Example1](https://github.com/LIDR-academy/AI4Devs-finalproject-Example1)

---

## Documentación del Proyecto

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**0-ficha-del-proyecto.md**](0-ficha-del-proyecto.md) | Información general y datos del proyecto | Actualizado (HU1–HU15 + splash 576×324) |
| [**1-descripcion-general-del-producto.md**](1-descripcion-general-del-producto.md) | Objetivos, funcionalidades y UX | Actualizado (UX chrome + splash branded) |
| [**2-arquitectura-del-sistema.md**](2-arquitectura-del-sistema.md) | Diagramas, componentes y decisiones técnicas | Actualizado (arranque geometría 007) |
| [**3-modelo-de-datos.md**](3-modelo-de-datos.md) | Entidades + Mermaid + ER SQLite | Actualizado (durable + session + splash purge) |
| [**4-comandos-y-eventos-ipc.md**](4-comandos-y-eventos-ipc.md) | Comandos + eventos IPC (mapa + secuencias) | Actualizado (IPC map + diagrama 05) |
| [**5-historias-de-usuario.md**](5-historias-de-usuario.md) | HU con criterios de aceptación | Actualizado (**HU1–HU15**; 006/007) |
| [**6-tickets-de-trabajo.md**](6-tickets-de-trabajo.md) | Tickets (1 por HU + capas BD/BE/FE) | Actualizado (tickets HU14–HU15) |
| [**7-pull-requests.md**](7-pull-requests.md) | PRs del desarrollo | Actualizado (**PR #1** entrega 1) |
| [**prompts.md**](prompts.md) | Registro de uso de IA (≤3 prompts/sección) | Actualizado (sync 006/007) |
| [**prompts-conversacion-inicial.md**](prompts-conversacion-inicial.md) | Consultas 1ª conversación (sin respuestas) | Completo |
| [**prompts-flujo-trabajo-speckit.md**](prompts-flujo-trabajo-speckit.md) | Flujo Spec Kit + sync readme | Completo |
| [**specs/001-eks-log-monitor/spec.md**](specs/001-eks-log-monitor/spec.md) | Spec Kit — especificación formal | Draft (10 US atómicas + FR-023–025) |
| [**specs/001-eks-log-monitor/plan.md**](specs/001-eks-log-monitor/plan.md) | Spec Kit — plan técnico | Completo (10 US + splash + SQLite + IPC) |
| [**specs/001-eks-log-monitor/tasks.md**](specs/001-eks-log-monitor/tasks.md) | Spec Kit — tasks T001–T085 | Generado (`/speckit-tasks`) |
| [**specs/001-eks-log-monitor/wireframes/**](specs/001-eks-log-monitor/wireframes/) | Mockups SVG (6 pantallas, 01=splash) | En revisión (pre sign-off) |
| [**docs/architecture/**](docs/architecture/) | Diagramas draw.io + SVG | Completo (01–05: contexto … ER … IPC) |

## Índice

1. [Ficha del proyecto](#0-ficha-del-proyecto)
2. [Descripción general del producto](#1-descripción-general-del-producto)
3. [Arquitectura del sistema](#2-arquitectura-del-sistema)
4. [Modelo de datos](#3-modelo-de-datos)
5. [Comandos y eventos IPC](#4-comandos-y-eventos-ipc)
6. [Historias de usuario](#5-historias-de-usuario)
7. [Tickets de trabajo](#6-tickets-de-trabajo)
8. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Aníbal Edinson Rodríguez Carrasco

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

App de escritorio multi-OS: splash, instancias por ambiente (**PEM + SSH + ruta IAM + region + cluster**), **Pods/Deployments** + **ConfigMaps**, logs en vivo (**Structured** / **Raw**), click en stacktrace → reglas Spring Boot, tema claro/oscuro (Should). UI↔Rust vía **Tauri IPC**. Desarrollo con **10 HU atómicas**. Sin export ni Analizar de buffer en MVP.

### **0.4. URL del proyecto:**

URL de releases quedará disponible al final del proyecto

### **0.5. URL o archivo comprimido del repositorio:**

Aún no disponible

> Detalle: [0-ficha-del-proyecto.md](0-ficha-del-proyecto.md)

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Reducir fricción al monitorear EKS detrás de bastión SSH; valor para perfiles técnicos y no técnicos (explicaciones simples).

### **1.2. Características y funcionalidades principales:**

- Splash + purge sesión (HU1); CRUD + cargar/activo + connect (HU2–HU4)
- Pods/ConfigMaps cacheados (HU5–HU6); logs Structured/Raw (HU7); análisis al click (HU8)
- Tema claro/oscuro (HU9 Should); empaquetado Win/macOS/Linux (HU10)
- **No** export ni Analizar de buffer; **no** secretos IAM/PEM en SQLite (MVP)

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
| 5 | IPC commands vs events | [05-ipc-commands-events.svg](docs/architecture/05-ipc-commands-events.svg) | [05-ipc-commands-events.drawio](docs/architecture/05-ipc-commands-events.drawio) |

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Rol |
|------------|------------|-----|
| UI | React + TS + Vite | Splash, Ambiente/Ver, catálogo, Structured/Raw, panel hallazgo |
| Shell | Tauri 2 | Ventana mínima + principal, IPC, empaquetado Win/macOS/Linux |
| Commands / Events | Rust + Tauri IPC | `invoke` (CRUD, connect…) + `emit` (logs_*) |
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

Unitarios + integración + ≥1 E2E (splash → ambiente → conectar → logs → hallazgo).

**Documentación completa:** [2-arquitectura-del-sistema.md](2-arquitectura-del-sistema.md) · [docs/architecture/](docs/architecture/)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Mermaid + ER draw.io en [3-modelo-de-datos.md](3-modelo-de-datos.md) y [`04-sqlite-er`](docs/architecture/04-sqlite-er.drawio): **durable** (`ConnectionInstance`, prefs, historial ligero) + **session** (catálogo/cache; purge en splash).

### **3.2. Descripción de entidades principales:**

Ver documento detallado.

**Documentación completa:** [3-modelo-de-datos.md](3-modelo-de-datos.md)

---

## 4. Comandos y eventos IPC

> Faro **no** usa HTTP REST. Contrato = **Tauri IPC**: commands (`invoke`) + events (`emit`). CRUD de ambientes = commands. Stream de logs = events (`logs_chunk`, `logs_status`).

**Documentación completa:** [4-comandos-y-eventos-ipc.md](4-comandos-y-eventos-ipc.md) · Contrato: [`ipc-commands-events.md`](specs/001-eks-log-monitor/contracts/ipc-commands-events.md) · Diagrama: [`05-ipc-commands-events`](docs/architecture/05-ipc-commands-events.drawio)

---

## 5. Historias de Usuario

> Documentar ≥3 historias principales con criterios de aceptación.

**Historia de Usuario 1:** Splash + purge de sesión  
**Historia de Usuario 2:** CRUD ambientes (PEM + SSH + IAM path + región + cluster)  
**Historia de Usuario 3:** Cargar uno/varios + un activo  
**Historia de Usuario 4:** Conectar / desconectar vía bastión  
**Historia de Usuario 5:** Explorar Deployments/Pods (cache)  
**Historia de Usuario 6:** Explorar ConfigMaps  
**Historia de Usuario 7:** Logs Structured / Raw  
**Historia de Usuario 8:** Análisis Spring Boot al click  
**Historia de Usuario 9:** Tema claro / oscuro (Should)  
**Historia de Usuario 10:** Desktop multi-OS  

**Documentación completa:** [5-historias-de-usuario.md](5-historias-de-usuario.md) · Spec Kit: [specs/001-eks-log-monitor/spec.md](specs/001-eks-log-monitor/spec.md)

---

## 6. Tickets de Trabajo

> 10 tickets (1 por HU atómica) + mapeo a capas BD/Backend/Frontend. Tasks Spec Kit: T001–T085.

**Ticket HU1:** Splash + purge  
**Ticket HU2:** CRUD ambientes  
**Ticket HU3:** Cargar / activo  
**Ticket HU4:** Connect / disconnect  
**Ticket HU5:** Pods cache  
**Ticket HU6:** ConfigMaps  
**Ticket HU7:** Logs Structured/Raw  
**Ticket HU8:** Análisis al click  
**Ticket HU9:** Tema (Should)  
**Ticket HU10:** Packages multi-OS  

**Documentación completa:** [6-tickets-de-trabajo.md](6-tickets-de-trabajo.md) · Spec Kit: [tasks.md](specs/001-eks-log-monitor/tasks.md)

---

## 7. Pull Requests

> Documentar ≥3 Pull Requests del desarrollo.

**Pull Request 1:** [feat: Se hace entrega número 1 proyecto AI4Devs](https://github.com/anibal21/faro/pull/1) — especificación + Spec Kit + docs AI4Devs (sin código app)  
**Pull Request 2:** \[Pendiente — implementación\]  
**Pull Request 3:** \[Pendiente — implementación\]  

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
├── 4-comandos-y-eventos-ipc.md   # sección 4 entrega (IPC; no REST)
├── docs/
│   ├── SPEC.md
│   └── architecture/           # draw.io + SVG (contexto … ER … IPC)
│       ├── 01-system-context.drawio / .svg
│       ├── 02-components.drawio / .svg
│       ├── 03-connection-sequence.drawio / .svg
│       ├── 04-sqlite-er.drawio / .svg
│       └── 05-ipc-commands-events.drawio / .svg
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
