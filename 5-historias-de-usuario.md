# 5. Historias de usuario

> Spec Kit: base [`specs/001-eks-log-monitor/`](specs/001-eks-log-monitor/) — **10 HU** atómicas + incrementos **HU11–HU20** (002–012).  
> IPC: [`4-comandos-y-eventos-ipc.md`](4-comandos-y-eventos-ipc.md).  
> Tickets / tasks: [`6-tickets-de-trabajo.md`](6-tickets-de-trabajo.md).

---

## HU1 — Splash y purge de sesión (P1 / Must)

**Como** usuario de Faro  
**Quiero** un splash al abrir que limpie residuos de sesión/logs  
**Para** arrancar limpio sin perder ambientes guardados.

### Criterios de aceptación
- [x] Splash: imagen branded full-bleed (lighthouse); sin título/tagline overlay centrado; status/error solo abajo-derecha u image-only (FR-001–003, 006).
- [ ] `session_purge_ephemeral` solo borra `«session»` (FR-024).
- [ ] Ambientes/prefs/historial ligero persisten (SC-006).
- [ ] Tras purge → ventana principal.
- [x] Ventana: splash **576×324** fija centrada; principal **900×600** centrada (007); iconos desde `src-tauri/icons/`.

---

## HU2 — CRUD de ambientes (P1 / Must)

**Como** ingeniero/ops  
**Quiero** crear/editar/eliminar instancias (PEM+SSH+IAM path+region+cluster)  
**Para** no repetir configuración frágil.

### Criterios de aceptación
- [ ] CRUD completo de instancias.
- [ ] Persisten al reiniciar.
- [ ] Solo paths e identificadores; sin secretos en SQLite (FR-001–003).

---

## HU3 — Cargar uno/varios; un activo (P1 / Must)

**Como** ingeniero/ops  
**Quiero** cargar uno o varios ambientes y marcar uno activo  
**Para** trabajar con varios perfiles sin túneles concurrentes.

### Criterios de aceptación
- [ ] Menú Ambiente: cargar / cargar varios.
- [ ] Solo el activo alimenta connect/catálogo.
- [ ] Cambio de activo invalida ventanas live previas.

---

## HU4 — Conectar / desconectar (P1 / Must)

**Como** ingeniero/ops  
**Quiero** conectar vía bastión y desconectar  
**Para** operar el cluster sin SSH manual.

### Criterios de aceptación
- [ ] Connect: túnel + IAM file → token; hydrate catálogo 1× (FR-004).
- [ ] Disconnect limpia session cache del ambiente.
- [ ] Errores claros sin secretos (FR-016).

---

## HU5 — Explorar Deployments/Pods (cache) (P1 / Must)

**Como** ingeniero/ops  
**Quiero** listar Deployments/Pods con catálogo cacheado  
**Para** encontrar workloads rápido sin re-listar siempre.

### Criterios de aceptación
- [ ] Lista de workloads accesibles; filtro por nombre (FR-005–006).
- [ ] UI puede leer cache de sesión tras hydrate.
- [ ] `catalog_refresh` regenera epoch.

---

## HU6 — Explorar ConfigMaps (P1 / Must)

**Como** ingeniero/ops  
**Quiero** listar y abrir ConfigMaps en solo lectura  
**Para** ver configuración sin kubectl.

### Criterios de aceptación
- [ ] Lista de ConfigMaps accesibles (FR-011).
- [ ] Vista keys/values read-only (estilo Raw).
- [ ] Valores grandes/binarios truncados de forma segura.

---

## HU7 — Logs Structured + Raw (P1 / Must)

**Como** ingeniero/ops  
**Quiero** logs agregados en vivo con Structured (default) y Raw  
**Para** monitorear sin terminal.

### Criterios de aceptación
- [ ] Una ventana por Deployment; multi-ventana; follow; búsqueda (FR-007–010).
- [ ] Structured default; Raw sin manipulación (FR-018–022).
- [ ] Buffers en RAM; no dumps en SQLite.

---

## HU8 — Análisis Spring Boot al click (P1 / Must)

**Como** colega técnico o no técnico  
**Quiero** click en un error/stacktrace Structured  
**Para** ver severidad, explicación simple y acción.

### Criterios de aceptación
- [ ] Detección ligera + click → motor completo (FR-012–014, FR-020).
- [ ] Vacío explícito si no hay match.
- [ ] Sin Analizar-todo / sin Export en MVP.

---

## HU9 — Tema claro / oscuro (P2 / Should)

**Como** usuario  
**Quiero** cambiar modo claro/oscuro en **Ver**  
**Para** comodidad visual; que persista al reiniciar.

### Criterios de aceptación
- [ ] Ver → Modo claro / Modo oscuro (FR-025).
- [ ] Preferencia en `ui_preferences` sobrevive restart.
- [ ] Chrome sigue el tema (Raw puede mantener contraste terminal).

---

## HU10 — Desktop Win / macOS / Linux (P3 / Must)

**Como** evaluador/colega  
**Quiero** instalar o ejecutar Faro en los tres SO  
**Para** demostrar sin URL pública.

### Criterios de aceptación
- [ ] Paquetes alcanzan splash o UI de conexión (FR-015, SC-007).
- [ ] Demo local/grabación aceptable sin URL pública.

---

## Fuera de alcance (MVP)

- Exportar logs; Analizar buffer completo; colas/eventos; reglas no-Spring Boot; mutar cluster; IA generativa.

---

## HU11 — Navegación acordeón (002 / P1)

> Spec Kit: [`specs/002-accordion-nav-layout/spec.md`](specs/002-accordion-nav-layout/spec.md) · tasks T001–T037.

**Como** ingeniero/ops  
**Quiero** un acordeón izquierdo (Pods / ConfigMaps) y área principal amplia  
**Para** maximizar espacio de logs sin rails laterales ni “Abrir logs”.

### Criterios de aceptación
- [x] Accordion Pods/ConfigMaps; click abre pestaña (sin buscador ni CTA Abrir logs).
- [x] Logs multi-réplica combinados + follow en background; summary réplicas/RAM/CPU/uptime o N/D.
- [x] ConfigMaps en la misma tira de pestañas; dedupe por navKey.
- [x] Collapse/empty/disconnect limpia pestañas.

---

## HU12 — Chrome profesional (004 / P1)

> Spec Kit: [`specs/004-pro-workspace-chrome/spec.md`](specs/004-pro-workspace-chrome/spec.md) · tasks T001–T036.

**Como** ingeniero/ops  
**Quiero** menubar Ambientes|Temas, árbol de ambientes fijo, logs a ancho completo y panel de análisis plegable  
**Para** una UI densa y profesional (shadcn/Tailwind) sin header voluminoso.

### Criterios de aceptación
- [x] Solo menubar Ambientes|Temas; sin brand/status/selector en header.
- [x] Árbol: todos los ambientes; select solo en label; menú contextual Conectar/Desconectar/Editar.
- [x] Logs full-width; AnalysisDrawer debajo (cerrar/redimensionar); multi-sesión runtime.
- [x] Tests US1–US3 + outline E2E `pro_chrome_primary_flow`.

---

## HU13 — UI chrome polish (005 / P1)

> Spec Kit: [`specs/005-ui-chrome-polish/spec.md`](specs/005-ui-chrome-polish/spec.md) · tasks T001–T034.

**Como** ingeniero/ops  
**Quiero** tipografía legible, iconos +/−, menú Ambientes mínimo, rail Monitor con versión, chrome tematizado y splash ≥5s  
**Para** una experiencia de escritorio más profesional y clara.

### Criterios de aceptación
- [x] Texto ~escala VS Code; Plus/Minus lucide.
- [x] Ambientes: Nuevo… / Desconectar todo (confirm siempre); rail Monitor + versión.
- [x] TitleBar custom + Temas; splash mínimo 5s.
- [x] Tests T007–T030 verdes.

---

## HU14 — Splash branded e iconos (006 / P1)

> Spec Kit: [`specs/006-branded-splash-icons/spec.md`](specs/006-branded-splash-icons/spec.md) · tasks T001–T019.

**Como** usuario de Faro  
**Quiero** ver la imagen branded de carga (faro) sin título duplicado, e iconos de app actualizados  
**Para** una primera impresión coherente con la marca.

### Criterios de aceptación
- [x] Splash full-bleed con artwork; sin brand/tagline overlay centrado.
- [x] Status/error solo abajo-derecha (o image-only en boot sano).
- [x] Bundle icons apuntan a `src-tauri/icons/` actualizados.
- [x] Tests splash visual + icons verdes.

---

## HU15 — Ventanas compactas fijas (007 / P1)

> Spec Kit: [`specs/007-compact-fixed-windows/spec.md`](specs/007-compact-fixed-windows/spec.md) · tasks T001–T014.

**Como** usuario de Faro  
**Quiero** una ventana de carga pequeña fija centrada y una principal de tamaño fijo que quepa en pantalla  
**Para** un arranque como apps de escritorio profesionales (no una ventana gigante).

### Criterios de aceptación
- [x] Splash **576×324**, fija, centrada.
- [x] Principal **900×600**, centrada (clamp si work area es menor); redimensionable tras ready.
- [x] Dwell ≥5s y artwork branded se mantienen.
- [x] Tests geometry + clamp + outline E2E verdes.

---

## HU16 — Conexión live + demo builtin (008 / P1)

> Spec Kit: [`specs/008-live-cluster-connect/spec.md`](specs/008-live-cluster-connect/spec.md) · tasks T001–T041.

**Como** ingeniero/ops  
**Quiero** un ambiente **demo** fijo y que todos los ambientes que agregue usen conexión real (túnel + EKS + catálogo/logs)  
**Para** ver pods/configmaps reales y seguir pudiendo demostrar Faro offline.

### Criterios de aceptación
- [x] **demo** primero en el árbol; no editar/eliminar; desconectado al inicio; solo Conectar/Desconectar.
- [x] Ambientes agregados = live (namespace obligatorio); sin seed demo en fallos.
- [x] Multi-connect aislado; funciones existentes usan datos live en sesión live.
- [x] Tests 008 verdes (`cargo test` + Vitest).

---

## HU17 — Examinar rutas PEM/IAM (009 / P1)

> Spec Kit: [`specs/009-connection-file-browse/spec.md`](specs/009-connection-file-browse/spec.md) · tasks T001–T030.

**Como** ingeniero/ops  
**Quiero** buscar archivos PEM e IAM con un selector nativo en el formulario de ambiente  
**Para** no tener que escribir a mano rutas largas y evitar errores tipográficos.

### Criterios de aceptación
- [x] Botón **Examinar** en PEM e IAM; selección rellena la ruta absoluta (solo path, sin contenido).
- [x] Cancelar el selector no cambia el campo; tipeo/fixtures siguen válidos si Browse está sano.
- [x] Si el selector falla, **Guardar** queda bloqueado hasta que Examinar funcione de nuevo.
- [x] Tests 009 verdes (unit `fileBrowse` + integration `env_file_browse`).

---

## HU18 — Live logs workspace UX (010 / P1)

> Spec Kit: [`specs/010-live-logs-workspace/spec.md`](specs/010-live-logs-workspace/spec.md) · tasks T001–T040.

**Como** ingeniero/ops  
**Quiero** follow continuo de logs live, historial paginado, auto-scroll controlado y ConfigMaps a altura completa  
**Para** investigar en el cluster sin dumps de una sola toma ni paneles vacíos.

### Criterios de aceptación
- [x] Follow live ~500 líneas/pod + fan-in; **Cargar 500 anteriores** por pod hasta el inicio.
- [x] Switch **Pegar al final** (default on; scroll arriba lo apaga).
- [x] Structured write-groups Spring; ConfigMap sin panel de análisis vacío.
- [x] Token kube vía identidad del bastion (documentado/verificado).
- [x] Tests 010 (scroll, load-older, stick, ConfigMap layout + structured existentes).

---

## HU19 — Workspace catalog & UI polish (011 / P1)

> Spec Kit: [`specs/011-workspace-catalog-ux/spec.md`](specs/011-workspace-catalog-ux/spec.md) · tasks T001–T041.

**Como** ingeniero/ops  
**Quiero** métricas de summary correctas, catálogo en 4 secciones, export a texto y chrome UI pulido  
**Para** navegar el cluster y compartir evidencia sin perder contexto visual.

### Criterios de aceptación
- [x] Summary: Replicas + RAM/CPU provisionados (`request / limit`, un pod) + Uptime; N/D solo si falta dato.
- [x] Stick checkbox agrupado; scrollbars finos temáticos; hijos del catálogo indentados.
- [x] Catálogo: Deployments → Pods → Services → ConfigMaps; Service detail RO; logs por pod.
- [x] Export Raw log + ConfigMap a `.txt` (cancel no escribe); status follow en español.
- [x] Tests 011 (summary, stick, scrollbars, export, catalog order, service detail, ES status).

---

## HU20 — Deployment YAML, Pod fan-in & full export (012 / P1)

> Spec Kit: [`specs/012-deployment-yaml-full-export/spec.md`](specs/012-deployment-yaml-full-export/spec.md) · tasks T001–T031.

**Como** ingeniero/ops  
**Quiero** ver el YAML del Deployment, logs fan-in desde Pods, export del historial completo y chrome sin “iniciando”  
**Para** separar configuración de logs y compartir evidencia completa.

### Criterios de aceptación
- [x] Deployments → YAML solo lectura (sin follow).
- [x] Pods (con owner) → fan-in de todas las réplicas; huérfanos → un pod.
- [x] Summary RAM/CPU desde template del Deployment; export pagina hasta agotar historial.
- [x] Sin status “iniciando” en toolbar; tests 012.

---

## HU21 — Pods menú: logs combinados por Deployment (013 / P1)

> Spec Kit: [`specs/013-pods-combined-replicas/spec.md`](specs/013-pods-combined-replicas/spec.md) · tasks T001–T018.

**Como** ingeniero/ops  
**Quiero** ver en Pods una fila agrupada por Deployment (`nombre (N)`) que abre el follow combinado de todas las réplicas  
**Para** no saltar entre réplicas peer y exportar evidencia de todo el Deployment.

### Criterios de aceptación
- [x] Pods: una fila por Deployment con conteo; huérfanos individuales; sin peers por réplica.
- [x] Click grupo → fan-in activo (`logs_open` sin filtro de pod); pestaña = nombre del Deployment.
- [x] Export Raw incluye todas las réplicas del scope fan-in (exhaust 012).
- [x] Tests 013 verdes.

---

## HU22 — Live connect solo PEM (014 / P1)

> Spec Kit: [`specs/014-pem-only-live-connect/spec.md`](specs/014-pem-only-live-connect/spec.md) · tasks T001–T022.

**Como** operador sin conocimiento AWS  
**Quiero** configurar y conectar un ambiente solo con PEM + datos del formulario (sin archivo credentials IAM)  
**Para** acceder vía la identidad del bastion sin renovar STS en el laptop.

### Criterios de aceptación
- [x] Formulario sin campo IAM; upsert acepta IAM vacío.
- [x] Connect live: describe-cluster + get-token vía bastion; sin leer IAM local.
- [x] Demo y filas legacy con path IAM siguen funcionando (path ignorado).
- [x] Tests 014 verdes.

---

## HU23 — Motor de reglas multi-pack (015 / P1)

> Spec Kit: [`specs/015-rules-multi-pack/spec.md`](specs/015-rules-multi-pack/spec.md) · tasks T001–T027.

**Como** operador técnico  
**Quiero** análisis local con packs Spring Boot/JVM y Node.js, auto-hint del stack y override de paquete en el panel  
**Para** obtener hallazgos útiles al click en write-groups Structured sin IA generativa.

### Criterios de aceptación
- [x] Pack `springboot` enriquecido (NPE/SQL/timeout/OOM/auth; ERROR gated).
- [x] Pack `nodejs` embebido; `rulePack` explícito honrado; desconocido → springboot.
- [x] Auto-hint JVM vs Node; ambiguo → springboot.
- [x] Respuesta `{ findings, packId, packDisplayName }`; UI muestra pack y permite override.
- [x] Tests 015 verdes (cargo + Vitest).

---

## HU24 — Catálogo de reglas descriptivo multi-tecnología (016 / P1)

> Spec Kit: [`specs/016-rich-rules-catalog/spec.md`](specs/016-rich-rules-catalog/spec.md) · tasks T001–T036.

**Como** operador técnico o no técnico  
**Quiero** hallazgos con título, qué/por qué/qué mirar/recomendaciones, señal del log, y packs Spring/Liquibase/Node/React/Python  
**Para** entender errores en write-groups Structured sin IA generativa.

### Criterios de aceptación
- [x] Schema rico + “Señal en el log” en el panel.
- [x] Packs springboot, liquibase, nodejs, react, python con volúmenes orientativos.
- [x] Auto-hint a 5 packs; override de pack con UI rica.
- [x] Tests 016 verdes (cargo + Vitest).

## HU25 — Mantener conexión viva (017 / P1) + polish 018/019/020

> Spec Kit: [`017`](specs/017-session-keep-alive/) · [`018`](specs/018-keepalive-toggle-chrome/) · [`019`](specs/019-fix-keepalive-off/) · [`020`](specs/020-keepalive-off-works/)

**Como** operador  
**Quiero** activar “Mantener conexión viva” por ambiente live, ver estado (conectado/degradado/desconectado), y reconectar sin rellenar el formulario  
**Para** no perder la sesión en silencio mientras investigo logs.

### Criterios de aceptación
- [x] Toggle per-env; heartbeat remoto 60s (no localhost como primary).
- [x] **018**: default ON al conectar live (si no hay pref OFF); menú = acción (**No mantener…** / **Mantener…**).
- [x] **019/020**: apagar keep-alive deja OFF estable (IPC plano + resultado de comando + UI); sin “Último pulso”; chrome `Keep-alive: ON|OFF`.
- [x] 3 fallos consecutivos → desconectado + cleanup; UI española + Reconectar.
- [x] Demo sin keep-alive; pref `keepalive.<id>`; SSH ServerAlive complementario.
- [x] **018**: sin tirón/pull-to-refresh de la shell (overscroll desactivado).
- [x] Tests 017–020 verdes (cargo + Vitest incl. FR-007 disable).

## HU26 — Ayuda → Seguridad (marco Chile) (022 / P1)

> Spec Kit: [`022-chile-security-help`](specs/022-chile-security-help/)

**Como** operador  
**Quiero** abrir **Ayuda → Seguridad** y ver el marco normativo chileno relevante y cómo Faro se alinea  
**Para** entender que Faro facilita higiene de seguridad/privacidad sin confundirlo con certificación ANCI ni con el SGSI de mi organización.

### Criterios de aceptación
- [x] Menú **Ayuda** con primera opción **Seguridad**; diálogo modal interno.
- [x] Lista: Ley 21.663, ANCI/CSIRT, Ley 19.628, Ley 21.719 + sección **Cómo Faro se alinea**.
- [x] Disclaimer: facilita cumplimiento; SGSI/OIV es responsabilidad organizacional; sin claims de certificación.
- [x] Sin IPC/red al abrir; usable sin sesión live.
- [x] Tests Vitest `chile_security_help.spec.tsx` verdes.

## HU27 — Entrega workspace multiambiente (023 / P1)

> Spec Kit: [`023-workspace-delivery`](specs/023-workspace-delivery/)

**Como** operador de varios ambientes  
**Quiero** mantener dos sesiones simultáneas con pestañas, colores y configuración independientes  
**Para** comparar recursos sin perder contexto y distribuir Faro como aplicación Windows.

### Criterios de aceptación
- [x] Ventana mínima 900×600 y panel de ambientes redimensionable 200–360 px.
- [x] Pestañas identificadas por ambiente y cierre aislado al desconectar/eliminar.
- [x] Máximo dos conexiones activas y diez configuraciones, con mensajes en español.
- [x] Demo eliminable/restaurable y fixtures de catálogo/logs/YAML.
- [x] Instalador NSIS en español con identidad Faro y licencia MIT.
