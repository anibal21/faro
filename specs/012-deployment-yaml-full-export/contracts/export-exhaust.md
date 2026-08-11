# Contract: Export exhaust

## Trigger

Log tab **Export** (Raw export body). ConfigMap export unchanged (no exhaust).

## Algorithm (product-level)

1. Enter `gathering` — show progress; disable duplicate Export or allow Abort.
2. For each pod in the tab’s follow scope, page older history (same semantics as “Cargar 500 anteriores” / `logs_load_older`) until exhausted or empty older page.
3. Build Raw text from the **full in-memory chronological buffer after gather** (timestamp + podName + text lines).
4. Open save dialog; on path chosen, write file; on cancel, write nothing.
5. Abort during gather → no file; leave UI tab buffer as whatever gather completed (or roll back optional — prefer leave buffer updated so user sees history; do not write file).

## Non-goals

- No SQLite persistence of gather.
- No upload.
- No hard max MB in v1 (operator Abort + kube retention are limits).

## Errors

- Gather/save failures: actionable message; no key material.
