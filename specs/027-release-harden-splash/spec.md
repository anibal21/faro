# Feature Specification: Release Harden & Splash Cold Start

**Feature Branch**: `027-release-harden-splash`

**Created**: 2026-08-12

**Status**: Delivered

**Input**: User description: "Actualizar Speckit con lo realizado tras 026: endurecer CI de release (NSIS flaky, macOS updater tar, firma base64), splash sin flash blanco, y entrega Faro 1.0.0. Documentar SmartScreen (Authenticode fuera de alcance) y fallos de describe-cluster por nombre/región."

## Clarifications

### Session 2026-08-12 (delivery retrospective)

- Q: ¿SmartScreen / firma Authenticode Windows en este corte? → A: **Fuera de alcance**. Documentar workaround para el equipo; Authenticode OV/EV queda para un corte posterior.
- Q: ¿`ResourceNotFoundException` en `describe-cluster` (p. ej. `sagcom-web`)? → A: **Operativo / configuración** — no es bug de producto; el operador debe alinear nombre de cluster + región + bastion/cuenta AWS.
- Q: ¿Versión de producto tras el endurecimiento? → A: Publicar **1.0.0** como release estable multiplataforma.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Release CI confiable en Windows/macOS/Linux (Priority: P1)

Como mantenedor, al publicar un release el pipeline construye e incluye instaladores firmados (updater) sin fallar por descargas NSIS intermitentes, por falta del `.app.tar.gz` de macOS, o por newlines en la clave base64 de firma.

**Why this priority**: Sin esto, 026 no es operable en la práctica (jobs rojos tras compile OK).

**Independent Test**: Publicar un tag; los tres jobs de build llegan a artifacts con NSIS(+sig), DMG + `.app.tar.gz`(+sig), AppImage(+sig) + `.deb`; `publish` sube `latest.json`.

**Acceptance Scenarios**:

1. **Given** un runner Windows fresco, **When** el job descarga/usa NSIS, **Then** el job tolera cortes de red (reintentos y/o cache de toolchain) y produce el setup NSIS + `.sig`.
2. **Given** el job macOS, **When** termina el build, **Then** existen DMG y updater `.app.tar.gz` (+ `.sig`) — no solo el DMG.
3. **Given** el secret de firma Tauri en base64 con whitespace/newline, **When** CI prepara el entorno de firma, **Then** la firma de artifacts updater completa sin `Invalid symbol 10`.

---

### User Story 2 - Arranque sin pantalla blanca (Priority: P1)

Como operador en un PC nuevo, al abrir Faro veo de inmediato (o tras un instante sin ventana) el splash branded — **no** un flash blanco antes de la carga.

**Why this priority**: Primera impresión en entrega 1.0.0 al equipo; el edge case de 006 ya lo pedía.

**Independent Test**: Cold start en Windows release build → no flash blanco perceptible; splash `#0a192f` / imagen branded.

**Acceptance Scenarios**:

1. **Given** cold start de Faro empaquetado, **When** aparece la ventana, **Then** el primer frame visible es el splash oscuro/branded (no blanco del WebView vacío).
2. **Given** carga lenta de la imagen splash, **When** la ventana se muestra, **Then** el fondo ya coincide con el color de respaldo del splash.

---

### User Story 3 - Entrega 1.0.0 al equipo (Priority: P2)

Como mantenedor, corto **v1.0.0** con versiones alineadas y assets multiplataforma en GitHub Releases para el equipo.

**Why this priority**: Cierra el ciclo de producto interno tras 026 + endurecimiento.

**Independent Test**: Release `v1.0.0` en GitHub con paquetes obligatorios + `latest.json`; versiones en `package.json` / Tauri / Cargo = `1.0.0`.

**Acceptance Scenarios**:

1. **Given** versiones alineadas a 1.0.0, **When** se publica el release, **Then** el workflow multiplataforma termina verde y los assets listos están en la página del release.
2. **Given** un miembro del equipo, **When** descarga el instalador de su SO, **Then** puede instalar/abrir Faro siguiendo `docs/RELEASE.md` (incl. Gatekeeper / SmartScreen workaround).

---

### Edge Cases

- NSIS `Peer disconnected` tras compile OK → reintento/cache; no marcar release listo si agota reintentos.
- macOS `--bundles dmg` solo → falta updater tar → MUST usar `app,dmg` (o equivalente que emita `.app.tar.gz`).
- Clave firma con LF en offset N → MUST normalizar whitespace en CI antes de `tauri build`.
- SmartScreen “aplicación desconocida” → esperado sin Authenticode; Más información → Ejecutar de todas formas (equipo interno).
- Bastion `No cluster found for name: …` → corregir ambiente (nombre/región/cuenta), no cambiar código.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El job Windows de release MUST cachear la toolchain NSIS de Tauri y MUST reintentar el build de bundle ante fallos transitorios de descarga.
- **FR-002**: El job macOS de release MUST producir DMG **y** el artefacto updater `.app.tar.gz` (+ `.sig`) para el feed `darwin-x86_64`.
- **FR-003**: CI MUST preparar `TAURI_SIGNING_PRIVATE_KEY` de forma que claves base64 sin/con whitespace accidental firmen correctamente (sin fallar por newline ASCII 10).
- **FR-004**: La documentación de release MUST listar fallos comunes de CI (NSIS peer disconnect, macOS tar ausente, symbol 10, dead_code warnings inocuos).
- **FR-005**: En cold start, la ventana principal MUST no mostrarse con fondo blanco vacío antes del splash; MUST usar fondo nativo alineado al splash y/o aparecer solo cuando el splash esté listo para pintar.
- **FR-006**: El producto MUST poder versionarse y publicarse como **1.0.0** con el pipeline 026 endurecido.
- **FR-007**: Authenticode / eliminación total de SmartScreen MUST quedar **fuera** de este corte (documentado como futuro).
- **FR-008**: Errores AWS `DescribeCluster` ResourceNotFound MUST tratarse como configuración de ambiente (docs/ops), no como defecto del pipeline de release.

### Key Entities

- **Release CI job**: build-windows / build-macos / build-linux / publish.
- **Updater signing prep**: script/env que normaliza la clave privada Tauri en Actions.
- **Cold-start window**: ventana `main` oculta hasta splash ready; `backgroundColor` splash.
- **Product version 1.0.0**: tag `v1.0.0` + assets + `latest.json`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un release completo (p. ej. 1.0.0) publica Windows NSIS(+sig), macOS DMG + `.app.tar.gz`(+sig), Linux AppImage(+sig) + `.deb`, y `latest.json` sin intervención manual de assets.
- **SC-002**: En al menos un cold start de revisión en Windows, no se observa flash blanco antes del splash branded.
- **SC-003**: `docs/RELEASE.md` permite a un mantenedor diagnosticar NSIS peer disconnect, macOS tar missing, y symbol 10 en ≤ 5 minutos.
- **SC-004**: SmartScreen y DescribeCluster ResourceNotFound están documentados como fuera de código / ops (sin confundirlos con fallos del pipeline).

## Assumptions

- Base: feature **026** multi-platform release ya implementada; esta feature endurece y cierra entrega 1.0.0.
- Splash visual base: feature **006**; este corte refuerza el edge case “evitar flash blanco”.
- Distribución sigue siendo interna al equipo; Gatekeeper/SmartScreen workarounds aceptables.
- Firmas updater Tauri (minisign) ≠ firma Authenticode de Windows.
