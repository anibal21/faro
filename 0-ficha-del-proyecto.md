# 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Aníbal Edinson Rodríguez Carrasco

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

Aplicación de **escritorio** (Windows, macOS y Linux) para monitorear artefactos en **Amazon EKS** sin SSH manual al bastión.

Cada usuario define **instancias de conexión** por ambiente: bastión SSH (host, puerto, user), ruta `.pem`, ruta a archivo de **credenciales IAM**, `region_name` y `cluster_name`. Al abrir, un **splash branded** compacto (**576×324**, centrado, fijo) prepara la app (purge de sesión/logs efímeros; **conserva** ambientes; dwell ≥5s) y luego abre la ventana principal (**900×600**, centrada). Explora **Pods** (por Deployment) y **ConfigMaps** (catálogo cacheado por conexión). Los logs de un Deployment se abren en **una ventanilla** (réplicas agregadas, follow en vivo) con dos modos: **Structured** (por defecto; agrupa por escritura; click en error/stacktrace → motor de reglas) y **Raw** (botón; volcado tipo terminal sin manipulación). Tema claro/oscuro (Should). El análisis Spring Boot muestra severidad, explicación simple y recomendación. **Sin** export de logs ni botón Analizar de buffer en el MVP. Secretos IAM/PEM no se guardan en la app — solo rutas. Alcance base: **10 historias atómicas** (US1–US10) + incrementos UI **HU11–HU15** (002–007).

**Tagline:** *Ilumina los logs. Gobierna el cluster.*

**Spec Kit (activo):** [`specs/007-compact-fixed-windows/`](specs/007-compact-fixed-windows/) · previos: [`006`](specs/006-branded-splash-icons/) · [`001`](specs/001-eks-log-monitor/)  
**Tickets AI4Devs:** [`6-tickets-de-trabajo.md`](6-tickets-de-trabajo.md) (1 ticket / HU)  
**Arquitectura (draw.io):** [`docs/architecture/`](docs/architecture/) (contexto, componentes, secuencia, ER SQLite, **IPC commands/events**)  
**IPC (comandos/eventos):** [`4-comandos-y-eventos-ipc.md`](4-comandos-y-eventos-ipc.md)  
**Constitución:** [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.1.0+)

### **0.4. URL del proyecto:**

<!-- Completar cuando exista el repo remoto -->

### **0.5. URL o archivo comprimido del repositorio:**

<!-- Completar -->

---

**Semilla interna:** [`docs/SPEC.md`](docs/SPEC.md)  
**Índice de entrega:** [`readme.md`](readme.md)
