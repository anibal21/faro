# Contract: Export to text file

## Triggers

| Tab | Control | Payload |
|-----|---------|---------|
| Deployment / Pod log | Export | Currently loaded **Raw** chronological buffer only |
| ConfigMap | Export | Readable keys/values (binary keys noted/omitted per existing rules) |

## Dialog

- Native **save** dialog (Tauri dialog plugin).  
- Suggest `.txt` filename (e.g. `{deployment}-logs.txt` / `{configmap}.txt`).  
- **Cancel** → no file written.  

## Security

- MUST NOT write PEM/IAM contents, tokens, or credential paths into the file.  
- MUST NOT upload off-machine.  
- MUST NOT persist export body into SQLite.  

## Empty buffer

- Prefer **disable** Export with short explanation when there is nothing to export.

## Permissions

- Capability must allow dialog save (in addition to existing open).
