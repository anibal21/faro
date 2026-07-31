# Data Model: 014-pem-only-live-connect

## Entities

### ConnectionInstance (durable — changed validation)

| Field | Change |
|-------|--------|
| `pem_path` | Still required (path only) |
| `iam_credentials_path` | **Optional / legacy**. May be empty string on new/updated rows. Not read at connect. Existing non-empty values retained but ignored. |
| `bastion_host`, `ssh_port`, `ssh_user` | Unchanged, required for live |
| `region_name`, `cluster_name` | Unchanged, required for live |
| `namespace_default` | Still required for live connect |

**Validation (upsert)**:
- Reject empty: name, bastion, ssh user, pem path, region, cluster; namespace for non-demo as today.
- Do **not** reject empty `iam_credentials_path`.
- Continue rejecting secret-looking material in path fields (PEM/IAM path strings must not contain key bodies).

### BastionClusterDiscovery (ephemeral)

| Field | Notes |
|-------|--------|
| `api_host` | Hostname from cluster endpoint (no `https://`) |
| `ca_b64` | Cluster CA data from describe |
| `region`, `cluster` | From environment identifiers |

Not persisted. Produced once per successful connect step.

### LiveSession (unchanged shape)

Tunnel handle + kube client + session cache; credentials minted on bastion only.

## Relationships

```text
ConnectionInstance --connect--> BastionClusterDiscovery --tunnel+token--> LiveSession
Legacy iam_credentials_path -x-> (unused)
```

## State / lifecycle

- **Save**: IAM path optional.
- **Connect live**: ignore IAM path → bastion describe → tunnel → bastion token → hydrate.
- **Connect demo**: unchanged; no bastion/IAM.
- **Disconnect**: unchanged purge.
