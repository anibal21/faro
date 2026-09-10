# Quickstart: Validar entrega final documental (030)

## Prerequisites

- Spec/plan/contracts en `specs/030-final-delivery-docs/`
- Acceso de lectura a [Releases](https://github.com/anibal21/faro/releases)
- (Opcional) Faro 1.3.0 instalado o repo con `fixtures/demo.pem` para seguir `DEMO.md`

## Doc lint (manual)

1. Abrir `README.md`  
   - **Expected**: enlace a Releases, a `DEMO.md`, tabla docs actualizada, sección **Proyecto final**.
2. Abrir `0-ficha-del-proyecto.md`  
   - **Expected**: 0.4 → `https://github.com/anibal21/faro/releases`; 0.5 → repo GitHub.
3. Abrir `7-pull-requests.md`  
   - **Expected**: Entrega 2 = [PR #2](https://github.com/anibal21/faro/pull/2) completo; Entrega 3 documentada (URL del PR de cierre cuando exista); nota sobre PRs históricos si aplica.
4. Abrir `DEMO.md`  
   - **Expected**: ≥10 pasos con resultado esperado; disclaimer fixtures; multi-ambiente; límite 2 sesiones.

## Smoke demo (opcional, producto)

Seguir `DEMO.md` desde instalador o:

```bash
npm install
npm run tauri dev
```

**Expected**: connect fixtures → catálogo `payments-*` → logs → segundo env sin vaciar el primero.

## Contracts

- [pr-register.md](./contracts/pr-register.md)
- [demo-guide.md](./contracts/demo-guide.md)
- [final-project-section.md](./contracts/final-project-section.md)

## Next

`/speckit-tasks` → implementar los Markdown → abrir PR de Entrega 3 desde `finalproject-AERC`.
