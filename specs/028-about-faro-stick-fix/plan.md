# Implementation Plan: About Faro & Stick Checkbox Layout

**Branch**: `028-about-faro-stick-fix` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

## Summary

Corregir el hueco entre checkbox y «Pegar al final» (el `input` de búsqueda aplicaba `flex: 1` a todos los inputs del toolbar). Añadir **Ayuda → Acerca de Faro** con licencia MIT, autor y enlaces. Publicar **1.1.0**.

## Technical Context

**Language/Version**: TypeScript/React · Tauri 2 · CSS existente (`workspace.css`)  
**Primary Dependencies**: Dialog/Menubar existentes; `@tauri-apps/plugin-opener` para enlaces  
**Testing**: Vitest stick layout + about dialog/menubar  
**Target Platform**: Desktop (todas las plataformas Faro)

## Constitution Check

- [x] Spec-driven (`specs/028-about-faro-stick-fix/`)
- [x] No secrets in About copy (public email/URLs only)
- [x] No cluster mutation

## Structure

```text
src/styles/workspace.css          # search-only flex; stick checkbox compact
src/content/aboutFaro.ts          # copy
src/components/help/AboutFaroDialog.*
src/components/chrome/AppMenubar.tsx
src/views/MainShell.tsx
```
