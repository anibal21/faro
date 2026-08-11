# Contract: Multi-session tabs

## Identity

```text
navKey = `${instanceId}|${kindKey}`
```

Examples:
- `{id}|deploy-logs:default/payments-api`
- `{id}|pod:default/payments-api-aaa`
- `{id}|configmap:default/app-config`
- `{id}|deployment-yaml:default/payments-api`
- `{id}|svc:default/payments-api`

## Open behavior

1. Resolve `instanceId` from the tree row being acted on.
2. Ensure that instance is the **focused** session (FE `env_set_active` / connect focus helper) before catalog/log IPC that still use focus.
3. If `navKey` exists → activate tab; else create tab with `instanceId`, `colorIndex`, resource fields.
4. Same resource name in two instances → **two** tabs.

## Disconnect

- Close tabs where `tab.instanceId === disconnectedId` only.
- Do not close other instances’ tabs.

## Future (optional same feature or follow-up)

Pass `instanceId` explicitly into `logs_open` / `k8s_*` to avoid focus races; MVP allows focus-then-call if serialized on UI thread.
