# Contract: Demo guide (`DEMO.md`)

## Purpose

Guía reproducible offline (fixtures) enlazada desde el README.

## File

- Path: `/DEMO.md` (raíz del repositorio)
- Language: español
- Linked from: `README.md` (quick start y/o tabla de documentación)

## Mandatory sections

1. **Objetivo** — probar Faro sin bastión/EKS real  
2. **Obtener Faro** — [Releases](https://github.com/anibal21/faro/releases) (versión **1.3.0** recomendada) **o** desarrollo local; advertencia: no usar zip “Source code” como instalador  
3. **Prerrequisitos** — OS soportado; para dev: Node/Rust si aplica  
4. **Pasos numerados** (≥10) cada uno con **Resultado esperado**  
5. **Fixtures** — qué hace “Usar fixtures demo / restaurar demo”; `fixtures/demo.pem` es placeholder  
6. **Catálogo esperado** — deployments `payments-api` / `payments-worker`, 2 pods c/u, services, configmaps  
7. **Logs y análisis** — Structured / Raw / Pegar al final / hallazgo  
8. **Multi-ambiente** — 2 fixtures; catálogos independientes; 3.ª conexión bloqueada  
9. **Chrome / ayuda** — keep-alive, Seguridad, Acerca de, tema  
10. **Problemas frecuentes** — fixtures not found; Source code zip; sin cluster  

## Out of contract

- No requiere IAM/AWS reales  
- No sustituye `TESTING.md` automatizado (puede enlazarlo)

## Acceptance check

- [ ] ≥10 pasos con resultado esperado  
- [ ] Enlace Releases presente  
- [ ] README enlaza `DEMO.md` de forma visible  
- [ ] Disclaimer de fixtures
