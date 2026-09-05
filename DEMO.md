# DEMO — Probar Faro con fixtures (sin cluster EKS)

Guía paso a paso para **evaluar Faro sin bastión ni Amazon EKS reales**, usando los **fixtures demo** incluidos en el producto.

> **Fixtures ≠ credenciales reales.** `fixtures/demo.pem` y archivos asociados son **placeholders** para modo Demo. No sirven para SSH a un bastión corporativo.

**Versión recomendada:** Faro **1.3.0**  
**Instaladores:** [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases)  
**Repositorio:** [https://github.com/anibal21/faro](https://github.com/anibal21/faro)

---

## 1. Objetivo

Validar el flujo principal:

**splash → ambiente demo → conectar → catálogo → logs → análisis → segundo ambiente → límite de sesiones → ayuda/tema**

sin infraestructura cloud.

---

## 2. Obtener Faro

### Opción A — Instalador (recomendada para evaluación)

1. Abre [Releases](https://github.com/anibal21/faro/releases).
2. Entra en **Faro 1.3.0** (o la última release).
3. Descarga el asset de tu SO:
   - **Windows:** `Faro_1.3.0_x64-setup.exe`
   - **macOS:** `Faro_1.3.0_x64.dmg` (updater: `Faro.app.tar.gz`)
   - **Linux:** `Faro_1.3.0_amd64.AppImage` o `.deb`
4. Instala / ejecuta el binario.

**No uses** los archivos “Source code (zip/tar.gz)” como instalador de la app.

### Opción B — Desarrollo local

```bash
git clone https://github.com/anibal21/faro.git
cd faro
npm install
npm run tauri dev
```

Requisitos habituales: Node.js 20+, Rust stable. En modo dev, los fixtures viven en `fixtures/` del repo.

---

## 3. Prerrequisitos

- SO soportado (Windows / macOS / Linux).
- No hace falta AWS CLI, PEM real ni acceso a bastión **para esta guía**.
- Conexión a Internet solo si descargas el instalador o clonas el repo (la demo offline no llama a EKS).

---

## 4. Pasos de prueba

### Paso 1 — Arranque / splash

1. Abre Faro (instalado o `tauri dev`).
2. Observa el splash branded breve y luego la ventana principal.

**Resultado esperado:** Ventana principal con rail **Monitor**, menubar (Ambientes / Temas / Ayuda). Sin error bloqueante de arranque.

---

### Paso 2 — Crear o editar un ambiente

1. Menú **Ambientes → Nuevo…** (o editar un ambiente existente).
2. Se abre el modal de configuración.

**Resultado esperado:** Formulario con campos de nombre, host/SSH, PEM, región, cluster, namespace, etc.

---

### Paso 3 — Precargar fixtures demo

1. En el modal, pulsa **Usar fixtures demo / restaurar demo**.
2. Revisa el campo de ruta PEM.

**Resultado esperado:** El PEM (y datos demo asociados) se rellenan **sin** mensaje de error tipo *demo fixtures not found*. Si el ambiente builtin se había eliminado, se puede restaurar.

---

### Paso 4 — Guardar el ambiente

1. Asigna un nombre claro (p. ej. `Demo A`).
2. Guarda / confirma el ambiente.

**Resultado esperado:** El ambiente aparece en el árbol **Monitor** (badge demo si aplica).

---

### Paso 5 — Conectar

1. Clic derecho en el ambiente → **Conectar** (o la acción de conexión del UI).
2. Espera el estado conectado.

**Resultado esperado:** Indicador de sesión conectada (p. ej. “Conectado”); el árbol permite expandir secciones de catálogo. Modo **Demo** (no túnel SSH real).

---

### Paso 6 — Explorar Deployments

1. Expande el ambiente si está colapsado.
2. Abre la sección **Deployments**.

**Resultado esperado:** Al menos:

- `payments-api` con réplicas **2/2**
- `payments-worker` con réplicas **2/2**

---

### Paso 7 — Explorar Pods, Services y ConfigMaps

1. Sección **Pods:** agrupa réplicas por deployment (p. ej. `payments-api (2)`).
2. Sección **Services:** al menos 2 entradas.
3. Sección **ConfigMaps:** p. ej. `payments-config`, `payments-secrets`.

**Resultado esperado:** Catálogo “rico” usable para capturas; no listas vacías tras un connect demo correcto.

---

### Paso 8 — Abrir logs (Structured)

1. Abre logs del deployment `payments-api` (clic en el deployment o en el grupo de pods, según UI).
2. Confirma vista **Structured** (por defecto).

**Resultado esperado:** Pestaña de logs con líneas en vivo (demo). En pocos segundos deberían aparecer líneas asociadas a **al menos dos pods** distintos (fan-in demo, p. ej. sufijos `-aaa` / `-bbb`).

---

### Paso 9 — Análisis al click (hallazgo)

1. En Structured, localiza una línea de error / stacktrace si el stream demo la muestra.
2. Haz click para abrir el panel / drawer de análisis.

**Resultado esperado:** Panel de hallazgo con severidad, explicación y/o recomendación del motor de **reglas locales** (no IA generativa in-app). Si en ese momento no hay ERROR clicable, anota el stream y continúa; el resto de la guía sigue siendo válida.

---

### Paso 10 — Vista Raw y “Pegar al final”

1. Cambia a vista **Raw**.
2. Activa / desactiva **Pegar al final** (stick-to-bottom).

**Resultado esperado:** Raw muestra volcado continuo; el checkbox de pegar al final controla si la vista sigue el final del buffer.

---

### Paso 11 — Segundo ambiente fixture (multi-catálogo)

1. Crea **Demo B** con **Usar fixtures demo** de nuevo (o duplica el flujo de precarga).
2. Conecta **Demo B** sin desconectar **Demo A**.
3. Expande ambos en el Monitor.

**Resultado esperado (crítico en 1.3.0):** Ambos ambientes **conservan** su catálogo (deployments/pods/services/configmaps). Conectar el segundo **no** vacía el primero. Las pestañas de logs pueden mostrar colores de ambiente distintos.

---

### Paso 12 — Límite de dos conexiones

1. Intenta conectar un **tercer** ambiente distinto.

**Resultado esperado:** Mensaje / bloqueo de límite de **2 sesiones** concurrentes. No se abre una tercera conexión viva.

---

### Paso 13 — Keep-alive

1. Con un ambiente conectado, menú contextual → **Mantener conexión viva** / **No mantener conexión viva**.

**Resultado esperado:** El texto de estado refleja Keep-alive ON u OFF. En demo el pulso es simulado/local; lo importante es que el toggle sea usable y coherente.

---

### Paso 14 — Ayuda y tema

1. **Ayuda → Seguridad:** lee el marco (Chile / alineación Faro; sin falsa certificación).
2. **Ayuda → Acerca de Faro:** licencia MIT / autor.
3. **Temas → Claro / Oscuro.**

**Resultado esperado:** Diálogos abren; el tema cambia la UI; no hay crash.

---

### Paso 15 — (Opcional) Restaurar demo tras eliminar

1. Elimina un ambiente demo.
2. Usa de nuevo **Usar fixtures demo / restaurar demo**.

**Resultado esperado:** Se puede recuperar el flujo demo sin reinstalar Faro.

---

## 5. Resumen de lo que debes haber visto

| Área | Qué validar |
|------|-------------|
| Arranque | Splash → main |
| Fixtures | Precarga sin error |
| Catálogo | `payments-*`, 2/2, services, configmaps |
| Logs | Structured + Raw + fan-in 2 pods |
| Multi-env | 2 conectados, catálogos intactos |
| Límite | 3.ª conexión rechazada |
| Chrome | Keep-alive, Seguridad, Acerca, tema |

---

## 6. Problemas frecuentes

| Síntoma | Qué hacer |
|---------|-----------|
| *demo fixtures not found* | En instalador: reinstala release 1.3.0+. En dev: verifica `fixtures/demo.pem` en el repo. |
| Catálogo vacío al conectar el 2.º env | Asegúrate de usar **≥ 1.3.0** (fix multi-catálogo). |
| “No tengo AWS” | Correcto para esta guía: usa solo fixtures. |
| Descargué Source code zip | No es el instalador; vuelve a [Releases](https://github.com/anibal21/faro/releases). |
| Quiero probar cluster real | Fuera de esta guía: PEM real + bastión + región/cluster; ver README / docs de connect live. |

---

## 7. Referencias

- Automatizado / notas por feature: [`TESTING.md`](TESTING.md) (sección 029)
- Quickstart técnico fixtures: [`specs/029-demo-fixtures-repair/quickstart.md`](specs/029-demo-fixtures-repair/quickstart.md)
- Cierre documental: [`specs/030-final-delivery-docs/`](specs/030-final-delivery-docs/)
- Ficha: [`0-ficha-del-proyecto.md`](0-ficha-del-proyecto.md)
