# Contract: Demo fixture path resolution

## IPC

**Command**: `demo_fixture_paths`

**Input**: `AppHandle` (Tauri injects)

**Output** (success):

```json
{
  "pemPath": "<absolute path to demo.pem>",
  "iamCredentialsPath": "<absolute path or empty string>"
}
```

**Output** (failure): Error message containing `demo fixtures not found`.

## Resolution order

1. `$RESOURCE/fixtures/demo.pem` (bundled installer)
2. `{repo}/fixtures/demo.pem` via `CARGO_MANIFEST_DIR/../fixtures`
3. `{cwd}/fixtures/demo.pem` and parent variants
4. Relative `./fixtures` and `../fixtures`

First existing `demo.pem` wins; IAM path included only if `demo-iam-credentials` exists alongside.

## Repo invariants

- `fixtures/demo.pem` MUST be tracked (gitignore exception `!fixtures/demo.pem`).
- Content MUST be placeholder only (no real private key material).

## Bundle invariants

`tauri.conf.json`:

```json
"resources": {
  "../fixtures/": "fixtures/"
}
```

Packaged app MUST resolve via resource dir without repo checkout.

## UI integration

**Usar fixtures demo / restaurar demo** in `NewEnvironmentModal` calls this command and sets form `pemPath` (+ optional IAM path). Saving profile MUST produce a path that `is_fixture_backed()` recognizes.
