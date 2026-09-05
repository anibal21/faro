# FARO

**Monitoreo de logs EKS vía bastión** — *Ilumina los logs. Gobierna el cluster.*

> App de escritorio (Windows, macOS, Linux). Conexión vía bastión SSH, catálogo multi-ambiente, logs Structured/Raw, reglas locales, keep-alive, fixtures demo y releases multiplataforma. **Proyecto final AI4Devs.**

**Versión estable:** [Faro 1.3.0 en GitHub Releases](https://github.com/anibal21/faro/releases)  
**Probar sin AWS:** [`DEMO.md`](DEMO.md) — guía paso a paso con fixtures demo  
**Repositorio:** [https://github.com/anibal21/faro](https://github.com/anibal21/faro)

---

## Proyecto final

Faro cierra el ciclo del máster **AI4Devs** como producto de escritorio **demostrable e instalable**, no solo documentación.

### Qué se entrega

| Entregable | Dónde |
|------------|--------|
| App multi-OS (Win / macOS / Linux) | [Releases](https://github.com/anibal21/faro/releases) — **1.3.0** |
| Documentación AI4Devs (`0`–`7`) | Raíz del repo |
| Guía de evaluación offline | [`DEMO.md`](DEMO.md) |
| Spec Kit (producto + cierre) | `specs/001` … `specs/030` |
| Diagramas | [`docs/architecture/`](docs/architecture/) |
| Tests | [`TESTING.md`](TESTING.md) |

### Tres entregas formales

1. **Entrega 1** — especificación y plan ([PR #1](https://github.com/anibal21/faro/pull/1))  
2. **Entrega 2** — aplicación operativa ([PR #2](https://github.com/anibal21/faro/pull/2))  
3. **Entrega 3** — documentación final, Releases y `DEMO.md` (PR desde `finalproject-AERC`; ver [`7-pull-requests.md`](7-pull-requests.md))

Detalle de PRs (incl. nota sobre PRs históricos #3–#5): [`7-pull-requests.md`](7-pull-requests.md).

### Cómo demostrar (evaluador)

1. Descarga Faro desde [Releases](https://github.com/anibal21/faro/releases) (**no** el zip Source code).  
2. Sigue [`DEMO.md`](DEMO.md): **Usar fixtures demo** → conectar → catálogo `payments-*` → logs → segundo ambiente → límite de 2 sesiones.  
3. Opcional: cluster live con PEM/bastión reales (no requerido para aprobar la demo documentada).

### Fuera de alcance relevante (v1)

Mutar el cluster; guardar secretos IAM/PEM en SQLite; IA generativa dentro del producto para análisis; telemetría de datos de usuario a terceros (constitución VI).

### Spec Kit de este cierre

[`specs/030-final-delivery-docs/`](specs/030-final-delivery-docs/)

---

## Primera vez? Quick start

### Evaluar con instalador + demo (sin AWS)

1. [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases) → Faro **1.3.0**  
2. Instala el asset de tu SO  
3. Abre [`DEMO.md`](DEMO.md) y sigue los pasos (**Usar fixtures demo / restaurar demo**)

### Desarrollo local

```bash
# Requisitos: Node.js 20+, Rust (stable)
# Live opcional: acceso SSH al bastión + PEM real

cd faro
npm install
npm run tauri dev
```

### Build instaladores

```bash
npm run tauri build
# Artefactos: src-tauri/target/release/bundle/ (nsis / dmg / appimage)
# Publicados también en GitHub Releases vía CI
```

Demo offline: en el modal de ambiente usa **Usar fixtures demo** (`fixtures/demo.pem`). Guía completa: **[`DEMO.md`](DEMO.md)**.

Validación: [`TESTING.md`](TESTING.md) · [`DEMO.md`](DEMO.md) · [`specs/029-demo-fixtures-repair/quickstart.md`](specs/029-demo-fixtures-repair/quickstart.md)

> Spec Kit (cierre): [`specs/030-final-delivery-docs/`](specs/030-final-delivery-docs/)  
> Spec producto base: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md)  
> Constitución: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)  
> Referencia entrega: [AI4Devs-finalproject-Example1](https://github.com/LIDR-academy/AI4Devs-finalproject-Example1)

---

## Documentación del Proyecto

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**DEMO.md**](DEMO.md) | Guía paso a paso con fixtures (evaluación sin AWS) | **Entrega final** |
| [**0-ficha-del-proyecto.md**](0-ficha-del-proyecto.md) | Información general y URLs | Actualizado (Releases 1.3.0) |
| [**1-descripcion-general-del-producto.md**](1-descripcion-general-del-producto.md) | Objetivos, funcionalidades y UX | Actualizado (install + DEMO) |
| [**2-arquitectura-del-sistema.md**](2-arquitectura-del-sistema.md) | Diagramas, componentes y decisiones técnicas | Actualizado |
| [**3-modelo-de-datos.md**](3-modelo-de-datos.md) | Entidades + Mermaid + ER SQLite | Actualizado |
| [**4-comandos-y-eventos-ipc.md**](4-comandos-y-eventos-ipc.md) | Comandos + eventos IPC | Actualizado |
| [**5-historias-de-usuario.md**](5-historias-de-usuario.md) | HU con criterios de aceptación | Actualizado |
| [**6-tickets-de-trabajo.md**](6-tickets-de-trabajo.md) | Tickets (1 por HU + capas) | Actualizado |
| [**7-pull-requests.md**](7-pull-requests.md) | PRs — Entregas 1, 2 y 3 | **Entrega final** |
| [**TESTING.md**](TESTING.md) | Tests automatizados + notas por feature | Actualizado (+ enlace DEMO) |
| [**prompts.md**](prompts.md) | Registro de uso de IA | Actualizado |
| [**specs/030-final-delivery-docs/**](specs/030-final-delivery-docs/) | Spec Kit — cierre documental | Delivered |
| [**specs/001-eks-log-monitor/**](specs/001-eks-log-monitor/) | Spec Kit — producto base | Completo |
| [**docs/architecture/**](docs/architecture/) | Diagramas draw.io + SVG | Completo (01–05) |

## Índice

1. [Proyecto final](#proyecto-final)
2. [Ficha del proyecto](#0-ficha-del-proyecto)
3. [Descripción general del producto](#1-descripción-general-del-producto)
4. [Arquitectura del sistema](#2-arquitectura-del-sistema)
5. [Modelo de datos](#3-modelo-de-datos)
6. [Comandos y eventos IPC](#4-comandos-y-eventos-ipc)
7. [Historias de usuario](#5-historias-de-usuario)
8. [Tickets de trabajo](#6-tickets-de-trabajo)
9. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Aníbal Edinson Rodríguez Carrasco

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

App de escritorio multi-OS: splash, ambientes (PEM path + SSH + región + cluster), catálogo Deployments/Pods/Services/ConfigMaps, logs Structured/Raw, reglas locales, multi-ambiente, fixtures demo, keep-alive, releases Win/macOS/Linux.

### **0.4. URL del proyecto:**

https://github.com/anibal21/faro/releases — versión estable **1.3.0**

### **0.5. URL o archivo comprimido del repositorio:**

https://github.com/anibal21/faro

> Detalle: [0-ficha-del-proyecto.md](0-ficha-del-proyecto.md) · Guía demo: [DEMO.md](DEMO.md)

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Reducir fricción al monitorear EKS detrás de bastión SSH; valor para perfiles técnicos y no técnicos (explicaciones simples). Demo evaluable sin cloud vía fixtures.

### **1.2. Características y funcionalidades principales:**

- Splash + purge sesión; CRUD ambientes; connect vía bastión o **Demo fixtures**
- Catálogo por ambiente: Deployments/Pods/Services/ConfigMaps
- Logs Structured/Raw; análisis al click; keep-alive; hasta 2 sesiones
- Tema claro/oscuro; empaquetado Win/macOS/Linux + updater
- **No** secretos IAM/PEM en SQLite; **no** mutar el cluster (v1)

### **1.3. Diseño y experiencia de usuario:**

> Splash → Monitor (árbol) → conectar → catálogo → pestañas de logs → hallazgo. Wireframes base en `specs/001-eks-log-monitor/wireframes/`.

### **1.4. Instrucciones de instalación:**

> [Releases](https://github.com/anibal21/faro/releases) o `npm run tauri dev`. Evaluación: [`DEMO.md`](DEMO.md).

**Documentación completa:** [1-descripcion-general-del-producto.md](1-descripcion-general-del-producto.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

App de escritorio **Tauri 2**: splash → UI React → commands Rust → SQLite (durable + session) / reglas locales / túnel SSH (PEM **path**) → token EKS vía bastión → Pods/ConfigMaps (solo lectura). Modo Demo hidrata catálogo/logs locales. Constitution VI: sin egress de credenciales ni datos de dominio a terceros.

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
| UI | React + TS + Vite | Splash, Monitor, catálogo, Structured/Raw, hallazgo |
| Shell | Tauri 2 | Ventanas, IPC, empaquetado Win/macOS/Linux |
| Commands / Events | Rust + Tauri IPC | `invoke` + `emit` (logs_*) |
| SSH / EKS | Túnel + auth vía bastión | Live; PEM solo por ruta |
| Demo | Fixtures embebidos | Catálogo/logs sin cluster |
| BD | SQLite | Durable + session (purge splash) |
| Reglas | Motor local | Hallazgos al click; sin IA generativa in-app |

### **2.3–2.6.** Ver [2-arquitectura-del-sistema.md](2-arquitectura-del-sistema.md) · [docs/architecture/](docs/architecture/)

---

## 3. Modelo de Datos

> Mermaid + ER en [3-modelo-de-datos.md](3-modelo-de-datos.md) y [`04-sqlite-er`](docs/architecture/04-sqlite-er.drawio).

---

## 4. Comandos y eventos IPC

> Faro **no** usa HTTP REST. Contrato = **Tauri IPC**.

**Documentación completa:** [4-comandos-y-eventos-ipc.md](4-comandos-y-eventos-ipc.md)

---

## 5. Historias de Usuario

**Documentación completa:** [5-historias-de-usuario.md](5-historias-de-usuario.md) · Spec Kit: [specs/001-eks-log-monitor/spec.md](specs/001-eks-log-monitor/spec.md)

---

## 6. Tickets de Trabajo

**Documentación completa:** [6-tickets-de-trabajo.md](6-tickets-de-trabajo.md)

---

## 7. Pull Requests

> ≥3 entregas formales documentadas.

**Entrega 1 / PR #1:** [Especificación + Spec Kit](https://github.com/anibal21/faro/pull/1)  
**Entrega 2 / PR #2:** [App Tauri operativa](https://github.com/anibal21/faro/pull/2)  
**Entrega 3:** Documentación final + Releases + [`DEMO.md`](DEMO.md) — ver detalle y URL al publicar en [7-pull-requests.md](7-pull-requests.md)

**Documentación completa:** [7-pull-requests.md](7-pull-requests.md)

---

## Estructura del Proyecto

```
faro/
├── README.md
├── DEMO.md                     # guía evaluación fixtures
├── TESTING.md
├── 0-ficha-del-proyecto.md … 7-pull-requests.md
├── docs/architecture/          # draw.io + SVG
├── .specify/                   # Spec Kit
├── specs/001-…030-             # features
├── fixtures/                   # demo.pem (placeholder)
├── src/                        # React + Vite
└── src-tauri/                  # Rust / Tauri
```

---

## Testing y Calidad

- Unitarios (Rust + TS) e integración — ver [`TESTING.md`](TESTING.md)
- Evaluación manual sin cluster — [`DEMO.md`](DEMO.md)
- E2E / smoke de empaquetado según notas en TESTING

---

## Registro de uso de IA

Ver [prompts.md](prompts.md).

---

## Licencia / Académico

Proyecto parte del programa **AI4Devs** (proyecto final), con fines educativos. Producto bajo licencia **MIT**.

**Producto:** Faro · **Stack:** Tauri 2 · React · TypeScript · SQLite · Spec Kit  
**Proceso:** Spec-Driven Development + documentación formato AI4Devs Example1
