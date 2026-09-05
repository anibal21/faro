# 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Aníbal Edinson Rodríguez Carrasco

### **0.2. Nombre del proyecto:**

Faro — monitoreo de logs EKS vía bastión

### **0.3. Descripción breve del proyecto:**

Aplicación de **escritorio** (Windows, macOS y Linux) para monitorear artefactos en **Amazon EKS** sin SSH manual al bastión.

Cada usuario define **instancias de conexión** por ambiente (bastión SSH, ruta `.pem`, región, cluster, namespace). Al abrir, un **splash branded** prepara la app (purge de sesión efímera; conserva ambientes) y abre la ventana principal. Explora **Deployments, Pods, Services y ConfigMaps** (catálogo por ambiente conectado). Los logs de un Deployment se abren en pestañas con vistas **Structured** / **Raw**, análisis local por reglas al click, keep-alive opcional, multi-ambiente (hasta 2 sesiones). Incluye **fixtures demo** para probar sin cluster real. Secretos: solo **rutas** locales (nunca PEM/IAM en SQLite). Empaquetado multi-OS y auto-updater vía GitHub Releases.

**Tagline:** *Ilumina los logs. Gobierna el cluster.*

**Versión estable de entrega:** **1.3.0** (`v1.3.0`)

**Guía de prueba sin AWS:** [`DEMO.md`](DEMO.md)  
**Spec Kit (cierre documental):** [`specs/030-final-delivery-docs/`](specs/030-final-delivery-docs/) · producto histórico: [`001`](specs/001-eks-log-monitor/) … [`029`](specs/029-demo-fixtures-repair/)  
**Tickets AI4Devs:** [`6-tickets-de-trabajo.md`](6-tickets-de-trabajo.md)  
**Arquitectura (draw.io):** [`docs/architecture/`](docs/architecture/)  
**IPC:** [`4-comandos-y-eventos-ipc.md`](4-comandos-y-eventos-ipc.md)  
**Constitución:** [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

### **0.4. URL del proyecto:**

**Versión final / instaladores (Releases):**  
https://github.com/anibal21/faro/releases  

> Descarga **Faro 1.3.0** (o la última publicada): Windows (`*-setup.exe`), macOS (`.dmg` / updater), Linux (`.AppImage` / `.deb`). **No** uses el zip “Source code” como instalador.

### **0.5. URL o archivo comprimido del repositorio:**

https://github.com/anibal21/faro  

---

**Semilla interna:** [`docs/SPEC.md`](docs/SPEC.md)  
**Índice de entrega:** [`README.md`](README.md)  
**Pull requests:** [`7-pull-requests.md`](7-pull-requests.md)
