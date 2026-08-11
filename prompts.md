> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

### Convención de registro (obligatoria)

Al documentar un prompt, skill o acción en este archivo:

1. Pegar el **texto completo** de la **primera consulta** de esa acción/skill (sin resumir ni omitir).
2. No hace falta encadenar follow-ups (respuestas a preguntas, “sí hazlo”, etc.): eso va, si aplica, solo en la nota de guía.
3. Si la llamada fue un skill (`/speckit-…`), incluir el comando **y** el cuerpo de ese primer mensaje.
4. Hasta **3 prompts clave** por sección; conversaciones largas → archivo aparte.
5. Añadir una nota breve de **cómo se guió** al asistente (ajustes humanos).

### Conversación completa (solo consultas del usuario)

**→ [`prompts-conversacion-inicial.md`](prompts-conversacion-inicial.md)**

### Flujo de trabajo Spec Kit + readme

**→ [`prompts-flujo-trabajo-speckit.md`](prompts-flujo-trabajo-speckit.md)**

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Comandos y eventos IPC](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1: Requisitos del máster AI4Devs**
*Contexto: alinear el producto Faro con la entrega académica*

```
Necesito que me ayudes a desarrollar un proyecto completo de software como si fuera un producto real, desde la idea inicial hasta dejarlo desplegado y funcionando. Es un proyecto para un máster, así que quiero que me ayudes en todas las etapas, utilizando IA como apoyo, pero procurando que las decisiones tengan sentido y que el resultado sea de buena calidad.

Quiero desarrollar un MVP, con las siguientes instrucciones que me da el master.

Lo primero será definir un flujo principal de negocio que pueda implementarse de principio a fin. A partir de ese flujo quiero identificar entre 3 y 5 historias de usuario imprescindibles (Must Have) y, si corresponde, agregar 1 o 2 funcionalidades secundarias (Should Have).

Durante el proyecto necesito ir generando toda la documentación técnica y funcional. Esto incluye la descripción del producto, sus objetivos, características y funcionalidades; las historias de usuario con sus criterios de aceptación y los tickets de trabajo relacionados; la arquitectura de la solución; el modelo de datos; el diseño de la API; el backend con acceso a base de datos; un frontend funcional que permita ejecutar el flujo principal; pruebas unitarias, de integración y al menos una prueba end-to-end; además de la infraestructura necesaria para desplegar la aplicación, incluyendo un pipeline básico de CI/CD, manejo de secretos y una URL pública donde pueda accederse al sistema.

También necesito dejar documentado cómo se utilizó la IA durante el desarrollo. Me gustaría registrar los prompts más importantes, las herramientas utilizadas, las mejoras que se obtuvieron gracias a la IA y las decisiones o correcciones que hice manualmente para mejorar el resultado.

Toda esta información debe quedar organizada en un repositorio de Git. El archivo README debe contener la descripción del proyecto, la arquitectura, el modelo de datos, la API, las historias de usuario, los tickets de trabajo y los pull requests siguiendo una estructura clara y ordenada. Además, quiero un archivo prompts.md donde se documenten, para cada etapa importante del proyecto (producto, arquitectura, modelo de datos, API, etc.), hasta tres prompts representativos y una breve explicación de cómo fueron utilizados para guiar al asistente de IA. Si aporta valor, también se puede incluir una referencia a las conversaciones completas.

Puedes proponer el stack tecnológico que consideres más adecuado, aunque prefiero utilizar tecnologías que sean ampliamente utilizadas, mantenibles y fáciles de desplegar. El resultado final debe ser un proyecto completamente ejecutable, bien documentado y organizado como si fuera un desarrollo profesional.
```

**Cómo se guió al asistente:** se incorporó el marco al `docs/SPEC.md`; se aclaró que la URL pública no es estricta si se ve funcionar; se adoptó el formato Example1 para la documentación de entrega.

---

**Prompt 2: Definición de producto Faro (`/speckit-checklist`)**
*Contexto: formalizar alcance del MVP antes de `/speckit-specify`*

```
/speckit-checklist El producto Faro, se debe especificar cómo una aplicación de escritorio con exportables ejecutables para Windows, MacOS y Linux. Esta aplicación tiene como principal objetivo facilitar el monitoreo de logs de los artefactos que se encuentren en EKS, cómo los pods, configuraciones, colas, eventos, etc de AWS, que se puedan acceder dentro de una organización mediante un acceso mediante un servidor web bastión (bastión host). En una compañía grande se permite acceder a varios ambientes, cada uno tiene un host, y para acceder se hace mediante SSH y un archivo .pem. La idea es que cada usuario cargue su configuración y archivo pem al programa, agregando una instancia de conexión, pudiendo agregar cuantas instancias desee y tenga acceso. Dentro de este programa debe poder elegir que tipo de componente visualizar, por ejemplo, para nuestro caso partiremos con los pods. y cuando seleccione pods, podrá ver todos los pods del cluster que tiene acceso el bastión, pudiendo listar todos los logs que desee por artefacto, sin importar cuantas réplicas este tenga. Por otro lado, contará el sistema con un motor de reglas por tipo de tecnología (Springboot, Flask, NestJS, etc), pero partiremos con Springboot donde se identifiquen los errores, con severidad, explicación simple y acción recomendada. Podremos exportar archivos de textos de los logs de cualquier artefacto que deseemos. Cada uno de estos artefactos que habramos una instancia de logs, deben estar actualizándose a medida que se escriba log en esos pods.
```

**Cómo se guió al asistente:** tras preguntas de alcance (Pods+ConfigMaps; ventanilla por Deployment; export fuera de MVP) se ejecutó `/speckit-specify` → `specs/001-eks-log-monitor/spec.md` y sync AI4Devs.

---

**Prompt 3: Constitución — no exfiltración de credenciales / datos de usuario**
*Skill: `/speckit-constitution` (enmienda v1.1.0)*

```
/speckit-constitution Esta herramienta de trabajo como producto, Faro. Tiene prohibido como regla inquebrantable enviar datos de credenciales brindadas por el usuario fuera de la aplicación. Los datos utilizados son estrictamente de dominio del usuario que las carga. La única información que puede salir desde esta aplicación es información sobre la misma herramienta, como datos de versión.
```

**Cómo se guió al asistente:** quedó el principio VI en `.specify/memory/constitution.md` (no waivable); sync en plan-template, `2-arquitectura`, `docs/SPEC.md`.

*(Primera ratificación de constitution: mensaje `/speckit-constitution` sin cuerpo adicional, usando `docs/SPEC.md` como semilla → v1.0.0.)*

---

## 2. Arquitectura del sistema

**Prompt 1: Stack Tauri 2 + React**
*Contexto: validar tecnología de escritorio (conversación inicial)*

```
Tauri 2 + react es la mejor tecnología para mi caso ?
```

**Cómo se guió al asistente:** se confirmó Tauri (no Electron) y multiplataforma; decisión registrada en el plan/semilla.

---

**Prompt 2: `/speckit-plan` + mockups wireframe**
*Skill: `/speckit-plan` — plan técnico + pantallas MVP*

```
/speckit-plan quiero avanzar con las vistas de mockups autogeneradas, actúa como un experto UX/UI, quiero generar las vistas de las siguientes vistas al menos:
1- Programa inicial sin configuraciones cargadas: Debe aparecer la ventana vacía con un menú de ventana simple. Genera una primera propuesta. 
2- Programa con ambiente cargado
3- Programa con ambiente cargado y logs de artefactos abiertos con vista estructurada
4- PRograma con ambiente cargado y logs de artefactos abiertos con vista nativa.
Partamos con eso.
Por otro lado, los menús del programa deben considerar las siguientes opciones:
1- Configurar un nuevo ambiente
2- Cargar un ambiente ya configurado
3- Cargar más de un ambiente a a la vez
4- Cambiar modo oscuro / modo blanco
Debes hacer los mockups con la herramienta que trae SpecKit
```

**Cómo se guió al asistente:** se generó `plan.md` / `research.md` / `data-model.md` / `contracts/` / `quickstart.md` y wireframes SVG; iteraciones UX posteriores (solo desktop, rail Deployments/Pods/ConfigMaps, modal ambiente, hallazgo) quedaron en `wireframes/` y sync AI4Devs docs `2`/`3`/`4`. Follow-ups del plan: splash `01` + renumeración 02–06; BG image diferida a implement; fix draw.io `04-sqlite-er`.

---

**Prompt 3: Conexión Faro = PEM + SSH + ruta IAM + region + cluster**
*Skill: `/speckit-plan` — auth standalone para ops*

```
/speckit-plan Quiero establecer que la conexión de Faro a AWS tendrá el siguiente formato: PEM + datos SSH de la conexión + ruta IAM + región_name + cluster_name, todo esto se pedirá en el formulario para crear un nuevo ambiente. Así que actualiza esto en todos lados, incluyendo los diagramas de arquitectura, y el wireframe 02.
```

**Cómo se guió al asistente:** se sustituyó “AWS profile name” por **ruta a archivo IAM** (keys leídas al conectar, no en SQLite); formulario/wireframe `02`; `data-model` / contracts / spec FR-002–003; diagramas `docs/architecture/` (contexto redibujado en 3 columnas). Diagramas draw.io iniciales se habían generado antes con `/speckit-plan Quiero que generes el diagrama de arquitectura en draw.io del sistema.`

---

## 3. Modelo de datos

**Prompt 1: Persistencia en Tauri**
*Contexto: BD interna (conversación inicial)*

```
Quiero que la aplicación pueda contar con una persistencia de datos que pueda recuperar cada vez que se utilice, cómo podemos lograr eso? existe alguna base de datos interna para Tauri ?
```

**Cómo se guió al asistente:** se eligió SQLite (`tauri-plugin-sql`) y persistencia local de instancias (sin dumps de logs).

---

**Prompt 2: Modelo físico en `/speckit-plan` (auth IAM file path)**
*Mismo primer mensaje que Arquitectura Prompt 3 (`PEM + SSH + ruta IAM + region_name + cluster_name`).*

**Cómo se guió al asistente:** `ConnectionInstance` con `pem_path`, `iam_credentials_path`, `region_name`, `cluster_name`, campos SSH; sync a [`3-modelo-de-datos.md`](3-modelo-de-datos.md).

---

**Prompt 3: ER SQLite durable + session cache + splash purge**
*Skill: `/speckit-plan` — modelo entidad-relación interno*

```
/speckit-plan Desarrolla un modelo entidad relación de la base de datos interna de sql-lite. Debe guardar las configuraciones de los ambientes al menos. Guardar los componentes que se traen de AWS para no ir a bucarlos siempre, y de este modo generar más rapidez en la plataforma, los artefactos y configuraciones que se traigan de aws deben cargarse una vez por conexión al ambiente (POr ejemplo si o si deberían regenerarse al cerrar la aplicación). Además modela en ese diagrama UML todos los otros campos que piensas persistir.
```

**Cómo se guió al asistente:** dos capas SQLite (durable vs `«session»`); ER en `data-model.md` + `docs/architecture/04-sqlite-er.drawio`; purge en splash conserva ambientes; sync [`3-modelo-de-datos.md`](3-modelo-de-datos.md). Follow-up splash como wireframe 01 y BG image slot diferido.

---

## 4. Especificación de la API

> Sync AI4Devs post-plan (2026-07-23): splash, SQLite tiers, **IPC = comandos/eventos** (`4-comandos-y-eventos-ipc.md`, diagrama 05).

**Prompt 1: Contratos IPC + auth IAM file path**
*Mismo primer mensaje que Arquitectura Prompt 3 (`PEM + SSH + ruta IAM + region_name + cluster_name`).*

**Cómo se guió al asistente:** `env_upsert` / `env_connect` leen `iam_credentials_path` al conectar; sync a doc 4. Follow-up: `session_purge_ephemeral`, `catalog_refresh`.

---

**Prompt 2: Renombrar API → Comandos y eventos + mapa IPC visual**
*Skill: `/speckit-plan`*

```
/speckit-plan Entonces cambia las documentaciones de APIs a Comandos y eventos. y mapealos en la documentación. Necesito visualizar las comunicaciones IPC.
```

**Cómo se guió al asistente:** contrato canónico `ipc-commands-events.md`; AI4Devs `4-comandos-y-eventos-ipc.md`; diagrama `05-ipc-commands-events`; se eliminó el doc legado `4-especificaciones-de-la-api.md`.

## 5. Historias de usuario

Las HU formales salen del **Prompt 2** de la sección 1 (specify) y refinamientos de clarify. Resumen: [`5-historias-de-usuario.md`](5-historias-de-usuario.md).

**Prompt 1: `/speckit-clarify` — vistas Raw y Structured en logs**

```
/speckit-clarify Algunos detalles extras de la aplicación desktop es que cuando se habra una instancia de logs tendrá dos tipos de vistauan vista simple rápida y simple que sería como una vista raw muy clonada de como se vería en la terminal viendo como va avanzando el log, y otra donde los logs van a apareciendo pero en un formato estructurado el cuál te muestra la información con severidad, detalle y si se detecta como error se podrá hacer click para visualizar el motor de reglas hacer su trabajo y mostrarnos un apartado con la severidad, explicación simple y recomendación.
```

**Cómo se guió al asistente:** se integró en `spec.md` (vistas Raw/Structured, FR-018–022); clarify cerró default Structured, detección ligera + click; sync AI4Devs post-clarify. Plan 2026-07-23: desglose a **10 US atómicas** en `spec.md` + [`5-historias-de-usuario.md`](5-historias-de-usuario.md).

**Prompt 2: Sync AI4Devs tras 10 HU atómicas**

```
sync AI4Devs
```

**Cómo se guió al asistente:** alineó `0`/`1`/`README`/`6`/`docs/SPEC.md`/`ui-ia.md` con US1–US10 + FR-025.

---

## 6. Tickets de trabajo

**Prompt 1: `/speckit-tasks` — tickets + tasks desde HU atómicas**

```
/speckit-tasks genera los tickets de las historias de usuario, y todas las últimas desiciones
```

**Cómo se guió al asistente:** `tasks.md` T001–T085 por US1–US10 (setup, foundation, polish, tests constitution); sync AI4Devs `6-tickets-de-trabajo.md` (1 ticket/HU + tabla capas BD/BE/FE); README actualizado.

**Prompt 2: Sync AI4Devs post-tasks**

```
sync AI4Devs
```

**Cómo se guió al asistente:** enlaces tasks/tickets en `0`/`1`/`2`/`5`; `docs/SPEC.md` (wireframes 01–06 + tasks hechos); estados README; trazabilidad cruzada.

---

## 7. Pull requests

**Prompt 1: Documentar PR1 entrega 1 en AI4Devs**

```
Puedes documentar el 1er pull request de la entrega en el readme, necesario para AI4Devs
```

**Cómo se guió al asistente:** se registró [PR #1](https://github.com/anibal21/faro/pull/1) (`feature-entrega1-AERC` → `develop`) en [`7-pull-requests.md`](7-pull-requests.md) y resumen en `README.md` §7; alcance documental/Spec Kit sin implementación.

**Prompt 2: `/speckit-implement` US1**

```
/speckit-implement Ejecutra la historia de usuario 1
```

**Cómo se guió al asistente:** checklist product PASS; scaffold Tauri 2 + React; SQLite rusqlite (durable/session); `session_purge_ephemeral` + SplashView → MainShell; Vitest US1 OK; `cargo test` OK con MSVC.

**Prompt 3: `/speckit-implement` US2**

```
/speckit-implement implementa la historia de usuario 2
```

**Cómo se guió al asistente:** `env_list`/`env_upsert`/`env_delete` + repo `connection_instance`; modal + menú Ambiente; Vitest CRUD + cargo validation (paths only, reject PEM body).

**Prompt 4: `/speckit-implement` US3**

```
/speckit-implement implementa la historia de usuario 3
```

**Cómo se guió al asistente:** `env_load`/`env_set_active`/`env_workspace_get` + prefs loaded/active/liveGeneration; selector + diálogos cargar; hook `useActiveEnvironment`.

---

## Sync UI 006/007 (2026-07-27)

**Prompt: Sync AI4Devs post-implement splash + ventanas**

```
sync AI4Devs
```

**Cómo se guió al asistente:** docs `0`/`1`/`2`/`5`/`6` + README: HU14 (006 splash branded + icons), HU15 (007 geometría 576×324 → 900×600); tickets y arranque en arquitectura.

---
