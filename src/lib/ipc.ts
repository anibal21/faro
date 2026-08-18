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
  colorIndex?: number;
};

export type EnvUpsertInput = {
  id?: string;
  name: string;
  bastionHost: string;
  sshPort: number;
  sshUser: string;
  pemPath: string;
  /** Optional/legacy — empty string for PEM-only live connect. */
  iamCredentialsPath?: string;
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

export type PodTailBatch = {
  podName: string;
  tailText: string;
  requestDepth: number;
  exhausted: boolean;
  olderOnly?: boolean;
};

export type LoadOlderResult = {
  pods: PodTailBatch[];
};

export type LoadOlderStatus = "idle" | "loading" | "exhausted" | "error";

export type AnalysisFinding = {
  severity: string;
  ruleId: string;
  title: string;
  summary: string;
  why: string;
  whatToLookFor: string[];
  recommendation: string[];
  tags?: string[];
};

export type AnalyzeResult = {
  findings: AnalysisFinding[];
  packId: string;
  packDisplayName: string;
  signalSnippet?: string | null;
};

/** Packs aligned with embedded Rust assets under rules/<pack>/default.json. */
export const RULE_PACKS = [
  { id: "springboot", displayName: "Spring Boot / JVM" },
  { id: "liquibase", displayName: "Liquibase" },
  { id: "nodejs", displayName: "Node.js" },
  { id: "react", displayName: "React" },
  { id: "python", displayName: "Python" },
] as const;

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

export type FlatPodRow = {
  id: string;
  namespace: string;
  podName: string;
  phase: string;
  deploymentName?: string | null;
};

export type ServiceRow = {
  id: string;
  namespace: string;
  name: string;
  serviceType?: string | null;
  clusterIp?: string | null;
};

export type ServiceDetail = {
  id: string;
  namespace: string;
  name: string;
  serviceType?: string | null;
  clusterIp?: string | null;
  portsJson?: string | null;
  selectorJson?: string | null;
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

export async function envRestoreDemo(): Promise<ConnectionInstance> {
  return invokeCommand<ConnectionInstance>("env_restore_demo");
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

export async function envFocus(instanceId: string): Promise<void> {
  return invokeCommand("env_focus", { instanceId });
}

export type ConnectionHealthState = {
  instanceId: string;
  status: "connected" | "degraded" | "disconnected" | string;
  keepAlive: boolean;
  lastPulseAt?: string | null;
  mode?: "live" | "demo" | string;
};

export async function envConnectionStates(): Promise<ConnectionHealthState[]> {
  return invokeCommand<ConnectionHealthState[]>("env_connection_states");
}

export async function envSetKeepAlive(
  instanceId: string,
  enabled: boolean,
): Promise<{ instanceId: string; keepAlive: boolean }> {
  // Flat Tauri 2 args (020) — boolean false must arrive as enabled: false
  return invokeCommand("env_set_keep_alive", {
    instanceId,
    enabled: enabled === true,
  });
}

export async function demoFixturePaths(): Promise<{
  pemPath: string;
  iamCredentialsPath: string;
}> {
  return invokeCommand("demo_fixture_paths");
}

export async function k8sListDeployments(
  nameFilter?: string,
  instanceId?: string,
): Promise<DeploymentRow[]> {
  return invokeCommand<DeploymentRow[]>("k8s_list_deployments", {
    namespace: null,
    nameFilter: nameFilter ?? null,
    instanceId: instanceId ?? null,
  });
}

export async function k8sListConfigmaps(
  instanceId?: string,
): Promise<ConfigMapRow[]> {
  return invokeCommand<ConfigMapRow[]>("k8s_list_configmaps", {
    namespace: null,
    instanceId: instanceId ?? null,
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

export async function k8sListPods(instanceId?: string): Promise<FlatPodRow[]> {
  return invokeCommand<FlatPodRow[]>("k8s_list_pods", {
    instanceId: instanceId ?? null,
  });
}

export async function k8sListServices(instanceId?: string): Promise<ServiceRow[]> {
  return invokeCommand<ServiceRow[]>("k8s_list_services", {
    instanceId: instanceId ?? null,
  });
}

export async function k8sGetService(
  namespace: string,
  name: string,
): Promise<ServiceDetail> {
  return invokeCommand<ServiceDetail>("k8s_get_service", { namespace, name });
}

export type DeploymentYamlDoc = {
  namespace: string;
  name: string;
  yamlText: string;
};

export async function k8sGetDeploymentYaml(
  namespace: string,
  name: string,
): Promise<DeploymentYamlDoc> {
  return invokeCommand<DeploymentYamlDoc>("k8s_get_deployment_yaml", {
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
  podName?: string,
  instanceId?: string,
): Promise<{ windowId: string }> {
  return invokeCommand<{ windowId: string }>("logs_open", {
    namespace,
    deployment,
    podName: podName ?? null,
    instanceId: instanceId ?? null,
  });
}

export async function logsClose(windowId: string): Promise<void> {
  return invokeCommand("logs_close", { windowId });
}

export async function logsLoadOlder(
  namespace: string,
  deployment: string,
  depths: Record<string, number>,
): Promise<LoadOlderResult> {
  return invokeCommand<LoadOlderResult>("logs_load_older", {
    namespace,
    deployment,
    depths,
  });
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
  rulePack?: string | null,
): Promise<AnalyzeResult> {
  return invokeCommand<AnalyzeResult>("analyze_write_group", {
    payload: {
      text,
      sourceHint: sourceHint ?? null,
      rulePack: rulePack ?? null,
    },
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
