# 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

<!-- Completar -->

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

Aplicación de **escritorio** (Windows, macOS y Linux) para monitorear artefactos en **Amazon EKS** sin SSH manual al bastión.

Cada usuario define **instancias de conexión** por ambiente: bastión SSH (host, puerto, user), ruta `.pem`, ruta a archivo de **credenciales IAM**, `region_name` y `cluster_name`. Al abrir, un **splash** prepara la app (purge de sesión/logs efímeros; **conserva** ambientes). Explora **Pods** (por Deployment) y **ConfigMaps** (catálogo cacheado por conexión). Los logs de un Deployment se abren en **una ventanilla** (réplicas agregadas, follow en vivo) con dos modos: **Structured** (por defecto; agrupa por escritura; click en error/stacktrace → motor de reglas) y **Raw** (botón; volcado tipo terminal sin manipulación). El análisis Spring Boot muestra severidad, explicación simple y recomendación. **Sin** export de logs ni botón Analizar de buffer en el MVP. Secretos IAM/PEM no se guardan en la app — solo rutas.

**Tagline:** *Ilumina los logs. Gobierna el cluster.*

**Spec Kit:** [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md) · [plan.md](specs/001-eks-log-monitor/plan.md)  
**Arquitectura (draw.io):** [`docs/architecture/`](docs/architecture/) (contexto, componentes, secuencia, **ER SQLite**)  
**Constitución:** [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.1.0+)

### **0.4. URL del proyecto:**

<!-- Completar cuando exista el repo remoto -->

### **0.5. URL o archivo comprimido del repositorio:**

<!-- Completar -->

---

**Semilla interna:** [`docs/SPEC.md`](docs/SPEC.md)  
**Índice de entrega:** [`readme.md`](readme.md)
