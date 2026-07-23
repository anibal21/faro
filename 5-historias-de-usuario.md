# 5. Historias de usuario

> Spec Kit: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md) (post-clarify).

---

## Historia de Usuario 1 — Instancias de conexión (P1)

**Como** ingeniero/ops  
**Quiero** guardar varias instancias (bastión SSH + ruta PEM + ruta archivo IAM + `region_name` + `cluster_name`)  
**Para** entrar a distintos entornos sin repetir configuración ni depender de AWS CLI.

### Criterios de aceptación
- [ ] Crear, editar, eliminar y seleccionar N instancias.
- [ ] Persisten al reiniciar la app.
- [ ] Solo rutas e identificadores; nunca contenido del `.pem` ni Access Key/Secret en SQLite (se leen del archivo IAM al conectar).

---

## Historia de Usuario 2 — Explorar Pods y ConfigMaps (P1)

**Como** ingeniero/ops  
**Quiero** conectarme vía bastión y elegir tipo de componente (Pods / ConfigMaps)  
**Para** encontrar artefactos sin SSH/kubectl manual.

### Criterios de aceptación
- [ ] Conexión exitosa muestra selector de tipo de componente.
- [ ] Pods se listan agrupados por Deployment/workload.
- [ ] ConfigMaps listables en vista de solo lectura.
- [ ] Filtro por nombre y errores claros si falla bastión/credenciales/RBAC.

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

## Fuera de alcance (MVP)

- Exportar logs a archivo.
- Botón Analizar de todo el buffer.
- Colas, eventos y otros tipos de componente.
- Reglas Flask/NestJS (solo Spring Boot).
