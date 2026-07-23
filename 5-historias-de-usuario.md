# 5. Historias de usuario

> Spec Kit: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md) (post-clarify + plan: splash FR-023/024, session cache).

---

## Historia de Usuario 0 — Arranque splash y purge de sesión (P1)

**Como** usuario de Faro  
**Quiero** ver una ventana mínima de preparación al abrir la app y que se limpien residuos de sesión/logs de un cierre anterior  
**Para** arrancar limpio sin perder mis ambientes guardados.

### Criterios de aceptación
- [ ] Al launch: splash con título **Faro**, imagen de fondo (asset en implement), tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, *…preparando aplicación* (FR-023).
- [ ] Durante splash: `session_purge_ephemeral` borra solo datos efímeros de sesión/logs (FR-024).
- [ ] Ambientes (`connection_instance`), prefs e historial ligero **persisten** tras el purge y tras reinicio (SC-006).
- [ ] Tras purge → ventana principal (workspace vacío o según prefs).

---

## Historia de Usuario 1 — Instancias de conexión (P1)

**Como** ingeniero/ops  
**Quiero** guardar varias instancias (bastión SSH + ruta PEM + ruta archivo IAM + `region_name` + `cluster_name`)  
**Para** entrar a distintos entornos sin repetir configuración ni depender de AWS CLI.

### Criterios de aceptación
- [ ] Crear, editar, eliminar y seleccionar N instancias.
- [ ] Persisten al reiniciar la app (no afectadas por splash purge).
- [ ] Solo rutas e identificadores; nunca contenido del `.pem` ni Access Key/Secret en SQLite (se leen del archivo IAM al conectar).

---

## Historia de Usuario 2 — Explorar Pods y ConfigMaps (P1)

**Como** ingeniero/ops  
**Quiero** conectarme vía bastión y elegir tipo de componente (Pods / ConfigMaps)  
**Para** encontrar artefactos sin SSH/kubectl manual.

### Criterios de aceptación
- [ ] Conexión exitosa muestra selector de tipo de componente.
- [ ] Pods se listan agrupados por Deployment/workload (catálogo hydrate 1× por connect; UI lee cache de sesión).
- [ ] ConfigMaps listables en vista de solo lectura.
- [ ] Filtro por nombre y errores claros si falla bastión/credenciales/RBAC.
- [ ] Disconnect / cierre / splash regeneran catálogo efímero; no pierden ambientes durables.

---

## Historia de Usuario 3 — Logs en vivo: Structured y Raw (P1)

**Como** ingeniero/ops  
**Quiero** una ventanilla de logs por Deployment (réplicas agregadas, en vivo) con vista Structured (default) y Raw (botón)  
**Para** monitorear en formato útil o como terminal pura.

### Criterios de aceptación
- [ ] Una ventana por Deployment; follow en vivo; multi-ventana; búsqueda.
- [ ] Al abrir: **Structured** por defecto.
- [ ] **Raw** vía botón: volcado tipo terminal **sin manipulación**.
- [ ] **Structured:** un ítem por **escritura** al log (un stacktrace suele ser una escritura); severidad/detalle; errores clickables.
- [ ] Buffers de logs en memoria; no dumps completos en SQLite.

---

## Historia de Usuario 4 — Análisis Spring Boot al click (P2)

**Como** colega técnico o no técnico  
**Quiero** hacer click en un error/stacktrace (escritura) en Structured y ver el motor de reglas  
**Para** obtener severidad, explicación simple y acción recomendada.

### Criterios de aceptación
- [ ] Detección ligera en vivo marca errores; click ejecuta el motor completo Spring Boot.
- [ ] Panel: severidad + explicación plain-language + acción.
- [ ] Sin coincidencias → vacío explícito.
- [ ] Sin botón Analizar de buffer en MVP.
- [ ] Análisis local; sin enviar logs/credenciales a terceros.

---

## Historia de Usuario 5 — Desktop multi-OS (P3)

**Como** evaluador/colega  
**Quiero** instalar o ejecutar Faro en Windows, macOS o Linux  
**Para** demostrar el producto sin URL pública obligatoria.

### Criterios de aceptación
- [ ] Paquetes/runnables para Win/macOS/Linux alcanzan al menos el splash / pantalla de conexión.

---

## Fuera de alcance (MVP)

- Exportar logs a archivo.
- Botón Analizar de todo el buffer.
- Colas, eventos y otros tipos de componente.
- Reglas Flask/NestJS (solo Spring Boot).
- Mutar el cluster; IA generativa en la app.
