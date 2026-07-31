# Contract: Combined logs open

## Combined group click

```text
openCombinedLogs(namespace, deploymentName)
  → logs_open(namespace, deploymentName)  // no pod_name filter
  → navKey = deploy-logs:{namespace}/{deploymentName}
  → reuse existing tab if present
  → workload_summary(namespace, deploymentName)
```

## Orphan click

```text
openPod(namespace, podName, null)
  → logs_open with pod filter (single pod)
```

## Tab chrome

- Tab label for combined: Deployment name (not a single replica name).
- Status: no `iniciando` (012).
