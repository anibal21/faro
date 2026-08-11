# Contract: Environment form without IAM

## UI

New / Edit environment MUST show:

- Name, bastion host, SSH port, SSH user  
- PEM path + Examinar  
- Region, cluster name, namespace  

MUST NOT show:

- Credenciales IAM / IAM credentials path / Examinar IAM  

## Upsert payload

- `pemPath` required (non-empty path string).  
- `iamCredentialsPath` may be omitted or empty string.  
- Backend MUST accept empty IAM path for create and update.

## Legacy edit

Opening an environment that still has a stored IAM path MUST NOT reintroduce a required IAM field. Saving without touching IAM MUST succeed.
