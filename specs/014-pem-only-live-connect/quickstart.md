# Quickstart: 014-pem-only-live-connect

## Prerequisites

- Faro build with this feature.  
- Bastion where these already succeed (with your region/cluster):

```bash
aws eks describe-cluster --region <region> --name <cluster> --output json
aws eks get-token --region <region> --cluster-name <cluster> --output json
```

- PEM that SSHs to that bastion.  
- Contracts: [env-form-no-iam.md](./contracts/env-form-no-iam.md), [bastion-cluster-discovery.md](./contracts/bastion-cluster-discovery.md), [connect-no-local-iam.md](./contracts/connect-no-local-iam.md).

## Validation

### 1. Form without IAM (SC-001)

1. Ambientes → Nuevo…  
2. **Expect**: no IAM credentials field.  
3. Fill name, bastion, port, user, PEM, region, cluster, namespace → Guardar.  
4. **Expect**: save OK without any credentials file path.

### 2. Connect PEM-only (SC-002 / SC-003)

1. Ensure no IAM file is configured for the env (and ideally none nearby).  
2. Connect → **Expect** catalog.  
3. Open a Pods combined/log tab → **Expect** live lines.  

### 3. Demo (SC-005)

1. Connect built-in demo → sample catalog/logs without bastion.

### 4. Legacy ignore (SC-006)

1. If an old row still has `iam_credentials_path` set, rename/remove that file on disk.  
2. Connect → **Expect** success via bastion (file not required).

### 5. Failure hygiene (SC-004)

1. Temporarily wrong cluster name → Connect.  
2. **Expect** clear error; spot-check message has no PEM body / bearer token.

## Automated

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass

SC-001…SC-006 from [spec.md](./spec.md).
