export type ConnectionInstance = {
  id: string;
  name: string;
  bastionHost: string;
  sshPort: number;
  sshUser: string;
  pemPath: string;
  iamCredentialsPath: string;
  regionName: string;
  clusterName: string;
  namespaceDefault?: string | null;
  sortOrder?: number | null;
  isFavorite: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  isBuiltinDemo?: boolean;
};

export type EnvUpsertInput = {
  id?: string;
  name: string;
  bastionHost: string;
  sshPort: number;
  sshUser: string;
  pemPath: string;
  iamCredentialsPath: string;
  regionName: string;
  clusterName: string;
  namespaceDefault?: string;
  notes?: string;
  isFavorite?: boolean;
  sortOrder?: number;
};

export type WorkspaceState = {
  loadedIds: string[];
  activeId: string | null;
  liveGeneration: number;
};

export type PurgeResult = { purged: boolean };

export type ConnectResult = {
  status: string;
  clusterName: string;
  catalogEpoch: string;
  instanceId?: string;
};

export type PodRow = {
  podName: string;
  phase: string;
};

export type DeploymentRow = {
  id: string;
  namespace: string;
  name: string;
  replicaCount: number;
  readyReplicas: number;
  available: boolean;
  pods: PodRow[];
};

export type ConfigMapRow = {
  id: string;
  namespace: string;
  name: string;
  keyCount: number;
};

export type ConfigMapEntry = {
  keyName: string;
  valueText?: string | null;
  isTruncated: boolean;
  isBinary: boolean;
  byteLength?: number | null;
};

export type ConfigMapDetail = {
  id: string;
  namespace: string;
  name: string;
  keyCount: number;
  entries: ConfigMapEntry[];
};

export type LogsChunk = {
  windowId: string;
  podName: string;
  text: string;
  timestamp: string;
};

export type LogsStatus = {
  windowId: string;
  status: string;
};

export type AnalysisFinding = {
  severity: string;
  ruleId: string;
  explanation: string;
  recommendation: string;
};

export type WorkloadSummary = {
  namespace: string;
  deployment: string;
  replicaCount: number;
  readyReplicas?: number | null;
  ramConsumed?: string | null;
  cpuConsumed?: string | null;
  uptime?: string | null;
  fetchedAt: string;
};

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invokeCommand<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!isTauri()) {
    throw new Error(`Tauri IPC unavailable (command: ${cmd})`);
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

export async function sessionPurgeEphemeral(): Promise<PurgeResult> {
  return invokeCommand<PurgeResult>("session_purge_ephemeral");
}

export async function prefsGet(): Promise<Record<string, string>> {
  return invokeCommand<Record<string, string>>("prefs_get");
}

export async function prefsSet(key: string, value: string): Promise<void> {
  return invokeCommand("prefs_set", { key, value });
}

export async function envList(): Promise<ConnectionInstance[]> {
  return invokeCommand<ConnectionInstance[]>("env_list");
}

export async function envUpsert(
  payload: EnvUpsertInput,
): Promise<ConnectionInstance> {
  return invokeCommand<ConnectionInstance>("env_upsert", { payload });
}

export async function envDelete(id: string): Promise<void> {
  return invokeCommand("env_delete", { id });
}

export async function envLoad(ids: string[]): Promise<WorkspaceState> {
  return invokeCommand<WorkspaceState>("env_load", { ids });
}

export async function envSetActive(id: string): Promise<WorkspaceState> {
  return invokeCommand<WorkspaceState>("env_set_active", { id });
}

export async function envWorkspaceGet(): Promise<WorkspaceState> {
  return invokeCommand<WorkspaceState>("env_workspace_get");
}

export async function envConnect(
  instanceId?: string,
): Promise<ConnectResult> {
  return invokeCommand<ConnectResult>("env_connect", {
    instanceId: instanceId ?? null,
  });
}

export async function envDisconnect(instanceId?: string): Promise<void> {
  return invokeCommand("env_disconnect", {
    instanceId: instanceId ?? null,
  });
}

export async function envConnectionStates(): Promise<
  Array<{ instanceId: string; status: string }>
> {
  return invokeCommand("env_connection_states");
}

export async function demoFixturePaths(): Promise<{
  pemPath: string;
  iamCredentialsPath: string;
}> {
  return invokeCommand("demo_fixture_paths");
}

export async function k8sListDeployments(
  nameFilter?: string,
): Promise<DeploymentRow[]> {
  return invokeCommand<DeploymentRow[]>("k8s_list_deployments", {
    namespace: null,
    nameFilter: nameFilter ?? null,
  });
}

export async function k8sListConfigmaps(): Promise<ConfigMapRow[]> {
  return invokeCommand<ConfigMapRow[]>("k8s_list_configmaps", {
    namespace: null,
  });
}

export async function k8sGetConfigmap(
  namespace: string,
  name: string,
): Promise<ConfigMapDetail> {
  return invokeCommand<ConfigMapDetail>("k8s_get_configmap", {
    namespace,
    name,
  });
}

export async function catalogRefresh(): Promise<{ catalogEpoch: string }> {
  return invokeCommand<{ catalogEpoch: string }>("catalog_refresh");
}

export async function logsOpen(
  namespace: string,
  deployment: string,
): Promise<{ windowId: string }> {
  return invokeCommand<{ windowId: string }>("logs_open", {
    namespace,
    deployment,
  });
}

export async function logsClose(windowId: string): Promise<void> {
  return invokeCommand("logs_close", { windowId });
}

export async function logsSetView(
  windowId: string,
  view: "structured" | "raw",
): Promise<void> {
  return invokeCommand("logs_set_view", { windowId, view });
}

export async function analyzeWriteGroup(
  text: string,
  sourceHint?: string,
): Promise<AnalysisFinding[]> {
  return invokeCommand<AnalysisFinding[]>("analyze_write_group", {
    payload: { text, sourceHint: sourceHint ?? null },
  });
}

export async function workloadSummary(
  namespace: string,
  deployment: string,
): Promise<WorkloadSummary> {
  return invokeCommand<WorkloadSummary>("workload_summary", {
    namespace,
    deployment,
  });
}

export async function listenEvent<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  if (!isTauri()) {
    return () => undefined;
  }
  const { listen } = await import("@tauri-apps/api/event");
  const unlisten = await listen<T>(event, (e) => handler(e.payload));
  return unlisten;
}
