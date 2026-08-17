# Data Model: Release Harden & Splash Cold Start

## Entities

| Entity | Fields / notes |
|--------|----------------|
| ProductVersion | SemVer `1.0.0` in package.json, tauri.conf.json, Cargo.toml |
| ReleaseTag | `v1.0.0` |
| NsisToolchainCache | `%LOCALAPPDATA%/tauri` on Windows runners; key `tauri-nsis-3.11-*` |
| SigningKeyMaterial | GitHub secret → file/env via prepare script; base64 compact or minisign plaintext |
| MainWindowColdStart | `visible: false`, `backgroundColor: #0a192f`, reveal after splash ready |
| MandatoryAssets | Unchanged from 026 + ensure macOS `.app.tar.gz`(+sig) present |

## Relationships

- ReleaseTag → CI matrix → MandatoryAssets → `latest.json` platforms  
- SigningKeyMaterial → `.sig` files for updater platforms  
- MainWindowColdStart → first paint SplashView (006 artwork)
