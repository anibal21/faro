# Research: Release Harden & Splash Cold Start

**Feature**: 027-release-harden-splash | **Date**: 2026-08-12

## Decision: Cache + retry for Windows NSIS toolchain

**Rationale**: Tauri descarga `nsis-3.11.zip` desde GitHub Releases en runners frescos; `io: Peer disconnected` es intermitente tras compile OK. `actions/cache` sobre `%LOCALAPPDATA%/tauri` + hasta 3 reintentos del `tauri build` mitiga sin vendorear NSIS.

**Alternatives rejected**: Solo re-run manual del job; preinstalación NSIS del sistema (paths distintos a lo que espera Tauri bundler).

## Decision: macOS `--bundles app,dmg`

**Rationale**: Con solo `dmg`, no se emite `bundle/macos/*.app.tar.gz` requerido por updater/`latest.json` `darwin-x86_64`. Tauri necesita el target `app` (o equivalente) para el tar updater.

**Alternatives rejected**: Empaquetar DMG a mano; omitir macOS del feed (rompe SC de 026).

## Decision: Strip whitespace for base64 signing keys in CI

**Rationale**: Error `Invalid symbol 10, offset N` = newline en clave base64. `prepare-tauri-signing.sh` compacta claves base64; plaintext minisign conserva newlines internos.

**Alternatives rejected**: Pedir al mantenedor re-pegar el secret en cada fallo; poner el secret crudo en `env:` del build (GitHub suele añadir newline).

## Decision: Cold start `visible: false` + splash `backgroundColor` + show after paint

**Rationale**: WebView2 muestra blanco antes de React. Ocultar ventana, fondo `#0a192f`, precargar splash, `show()` tras paint. Alinea edge case 006.

**Alternatives rejected**: Solo CSS en `index.html` (ayuda pero no elimina el flash nativo); splash window nativa separada (más complejidad).

## Decision: Authenticode / SmartScreen deferred

**Rationale**: Requiere certificado OV/EV de pago y wiring `signtool` en CI. Distribución interna: documentar “Más información → Ejecutar de todas formas”.

## Decision: DescribeCluster ResourceNotFound is ops

**Rationale**: Faro ya reenvía stderr sanitizado del bastion. `No cluster found for name` = nombre/región/cuenta incorrectos en el ambiente — guía en RELEASE / soporte, no cambio de connect path.
