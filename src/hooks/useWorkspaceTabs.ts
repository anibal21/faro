import { useCallback, useEffect, useRef, useState } from "react";
import {
  k8sGetConfigmap,
  k8sGetDeploymentYaml,
  k8sGetService,
  envFocus,
  listenEvent,
  logsClose,
  logsLoadOlder,
  logsOpen,
  workloadSummary,
  type ConfigMapDetail,
  type LoadOlderStatus,
  type LogsChunk,
  type LogsStatus,
  type ServiceDetail,
  type WorkloadSummary,
} from "../lib/ipc";
import {
  knownTextForPod,
  LOG_PAGE_LINES,
  olderPrefixFromTail,
} from "../lib/logHistory";
import {
  configmapNavKey,
  deploymentNavKey,
  deployLogsNavKey,
  podNavKey,
  serviceNavKey,
} from "./tabKeys";

type WorkspaceTabContext = {
  instanceId: string;
  colorIndex: number;
};

export type WorkspaceTab = WorkspaceTabContext & (
  | {
      kind: "deployment";
      tabId: string;
      navKey: string;
      windowId: string;
      namespace: string;
      deployment: string;
      podName?: string;
      chunks: LogsChunk[];
      status: string;
      view: "structured" | "raw";
      search: string;
      summary: WorkloadSummary | null;
      stickToBottom: boolean;
      historyDepthByPod: Record<string, number>;
      exhaustedPods: string[];
      loadOlderStatus: LoadOlderStatus;
      loadOlderMessage: string | null;
      prependGeneration: number;
    }
  | {
      kind: "deployment-yaml";
      tabId: string;
      navKey: string;
      namespace: string;
      name: string;
      yamlText: string | null;
    }
  | {
      kind: "configmap";
      tabId: string;
      navKey: string;
      namespace: string;
      name: string;
      detail: ConfigMapDetail | null;
    }
  | {
      kind: "service";
      tabId: string;
      navKey: string;
      namespace: string;
      name: string;
      detail: ServiceDetail | null;
    }
);

const MAX_CHUNKS = 2000;

export function useWorkspaceTabs(_liveGeneration: number) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  useEffect(() => {
    let cancelled = false;
    async function bind() {
      const u1 = await listenEvent<LogsChunk>("logs_chunk", (payload) => {
        setTabs((prev) =>
          prev.map((t) => {
            if (t.kind !== "deployment" || t.windowId !== payload.windowId) {
              return t;
            }
            const chunks = [...t.chunks, payload];
            if (chunks.length > MAX_CHUNKS) {
              chunks.splice(0, chunks.length - MAX_CHUNKS);
            }
            const historyDepthByPod = { ...t.historyDepthByPod };
            if (historyDepthByPod[payload.podName] == null) {
              historyDepthByPod[payload.podName] = LOG_PAGE_LINES;
            }
            return { ...t, chunks, historyDepthByPod };
          }),
        );
      });
      const u2 = await listenEvent<LogsStatus>("logs_status", (payload) => {
        setTabs((prev) =>
          prev.map((t) =>
            t.kind === "deployment" && t.windowId === payload.windowId
              ? { ...t, status: payload.status }
              : t,
          ),
        );
      });
      if (!cancelled) {
        return () => {
          u1();
          u2();
        };
      }
      u1();
      u2();
    }
    let cleanup: () => void = () => undefined;
    void bind().then((fn) => {
      if (fn) cleanup = fn;
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const openDeployment = useCallback(
    async (instanceId: string, colorIndex: number, namespace: string, deployment: string) => {
      const navKey = deploymentNavKey(instanceId, namespace, deployment);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      await envFocus(instanceId);
      const doc = await k8sGetDeploymentYaml(namespace, deployment);
      const tabId = navKey;
      const tab: WorkspaceTab = {
        kind: "deployment-yaml",
        tabId,
        navKey,
        instanceId,
        colorIndex,
        namespace,
        name: deployment,
        yamlText: doc.yamlText,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tabId);
    },
    [],
  );

  /** Fan-in logs for all replicas of a Deployment (no pod filter). */
  const openCombinedLogs = useCallback(
    async (instanceId: string, colorIndex: number, namespace: string, deploymentName: string) => {
      const owner = deploymentName.trim();
      if (!owner || owner === "__unassigned__") return;
      const navKey = deployLogsNavKey(instanceId, namespace, owner);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      // Open tab as soon as follow starts; summary fills in async (bastion RTT).
      await envFocus(instanceId);
      const { windowId } = await logsOpen(namespace, owner, undefined, instanceId);
      const tab: WorkspaceTab = {
        kind: "deployment",
        tabId: windowId,
        navKey,
        instanceId,
        colorIndex,
        windowId,
        namespace,
        deployment: owner,
        chunks: [],
        status: "",
        view: "structured",
        search: "",
        summary: null,
        stickToBottom: true,
        historyDepthByPod: {},
        exhaustedPods: [],
        loadOlderStatus: "idle",
        loadOlderMessage: null,
        prependGeneration: 0,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(windowId);
      void workloadSummary(namespace, owner)
        .then((summary) => {
          setTabs((prev) =>
            prev.map((t) =>
              t.tabId === windowId && t.kind === "deployment"
                ? { ...t, summary }
                : t,
            ),
          );
        })
        .catch(() => undefined);
    },
    [],
  );

  const openPod = useCallback(
    async (
      instanceId: string,
      colorIndex: number,
      namespace: string,
      podName: string,
      deploymentName?: string | null,
    ) => {
      const owner = deploymentName?.trim();
      const isOrphan = !owner || owner === "__unassigned__";

      if (!isOrphan && owner) {
        await openCombinedLogs(instanceId, colorIndex, namespace, owner);
        return;
      }

      const navKey = podNavKey(instanceId, namespace, podName);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      const dep = owner?.trim() || podName;
      await envFocus(instanceId);
      const { windowId } = await logsOpen(namespace, dep, podName, instanceId);
      const tab: WorkspaceTab = {
        kind: "deployment",
        tabId: windowId,
        navKey,
        instanceId,
        colorIndex,
        windowId,
        namespace,
        deployment: dep,
        podName,
        chunks: [],
        status: "",
        view: "structured",
        search: "",
        summary: null,
        stickToBottom: true,
        historyDepthByPod: {},
        exhaustedPods: [],
        loadOlderStatus: "idle",
        loadOlderMessage: null,
        prependGeneration: 0,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(windowId);
      void workloadSummary(namespace, dep)
        .then((summary) => {
          setTabs((prev) =>
            prev.map((t) =>
              t.tabId === windowId && t.kind === "deployment"
                ? { ...t, summary }
                : t,
            ),
          );
        })
        .catch(() => undefined);
    },
    [openCombinedLogs],
  );

  const openConfigMap = useCallback(
    async (instanceId: string, colorIndex: number, namespace: string, name: string) => {
      const navKey = configmapNavKey(instanceId, namespace, name);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      await envFocus(instanceId);
      const detail = await k8sGetConfigmap(namespace, name);
      const tabId = navKey;
      const tab: WorkspaceTab = {
        kind: "configmap",
        tabId,
        navKey,
        instanceId,
        colorIndex,
        namespace,
        name,
        detail,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tabId);
    },
    [],
  );

  const openService = useCallback(async (instanceId: string, colorIndex: number, namespace: string, name: string) => {
    const navKey = serviceNavKey(instanceId, namespace, name);
    const existing = tabsRef.current.find((t) => t.navKey === navKey);
    if (existing) {
      setActiveTabId(existing.tabId);
      return;
    }
    await envFocus(instanceId);
    const detail = await k8sGetService(namespace, name);
    const tab: WorkspaceTab = {
      kind: "service",
      tabId: navKey,
      navKey,
      instanceId,
      colorIndex,
      namespace,
      name,
      detail,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(navKey);
  }, []);

  const closeTab = useCallback(async (tabId: string) => {
    const tab = tabsRef.current.find((t) => t.tabId === tabId);
    if (tab?.kind === "deployment") {
      await logsClose(tab.windowId);
    }
    setTabs((prev) => prev.filter((t) => t.tabId !== tabId));
    setActiveTabId((cur) => (cur === tabId ? null : cur));
  }, []);

  const closeAll = useCallback(async () => {
    for (const t of tabsRef.current) {
      if (t.kind === "deployment") {
        try {
          await logsClose(t.windowId);
        } catch {
          /* ignore */
        }
      }
    }
    setTabs([]);
    setActiveTabId(null);
  }, []);

  const closeForInstance = useCallback(async (instanceId: string) => {
    const closing = tabsRef.current.filter((t) => t.instanceId === instanceId);
    for (const tab of closing) {
      if (tab.kind === "deployment") {
        try {
          await logsClose(tab.windowId);
        } catch {
          /* ignore */
        }
      }
    }
    setTabs((prev) => prev.filter((t) => t.instanceId !== instanceId));
    setActiveTabId((current) =>
      closing.some((t) => t.tabId === current) ? null : current,
    );
  }, []);

  const setView = useCallback(
    (tabId: string, view: "structured" | "raw") => {
      setTabs((prev) =>
        prev.map((t) =>
          t.kind === "deployment" && t.tabId === tabId ? { ...t, view } : t,
        ),
      );
    },
    [],
  );

  const setSearch = useCallback((tabId: string, search: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.kind === "deployment" && t.tabId === tabId ? { ...t, search } : t,
      ),
    );
  }, []);

  const setStickToBottom = useCallback((tabId: string, stickToBottom: boolean) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.kind === "deployment" && t.tabId === tabId
          ? { ...t, stickToBottom }
          : t,
      ),
    );
  }, []);

  const loadOlder = useCallback(async (tabId: string): Promise<"more" | "exhausted" | "error" | "skipped"> => {
    const tab = tabsRef.current.find((t) => t.tabId === tabId);
    if (!tab || tab.kind !== "deployment") return "skipped";
    if (tab.loadOlderStatus === "loading") return "skipped";
    if (tab.loadOlderStatus === "exhausted") return "exhausted";

    setTabs((prev) =>
      prev.map((t) =>
        t.kind === "deployment" && t.tabId === tabId
          ? { ...t, loadOlderStatus: "loading", loadOlderMessage: null }
          : t,
      ),
    );

    const depths: Record<string, number> = { ...tab.historyDepthByPod };
    const podNames = [...new Set(tab.chunks.map((c) => c.podName))];
    for (const p of podNames) {
      if (depths[p] == null) depths[p] = LOG_PAGE_LINES;
    }
    if (Object.keys(depths).length === 0) {
      depths[`${tab.deployment}-aaa`] = LOG_PAGE_LINES;
    }

    try {
      const result = await logsLoadOlder(tab.namespace, tab.deployment, depths);

      const olderChunks: LogsChunk[] = [];
      const historyDepthByPod = { ...depths };
      const exhaustedPods = new Set(tab.exhaustedPods);
      let anyOlder = false;

      for (const batch of result.pods) {
        let older = "";
        if (batch.olderOnly) {
          older = batch.tailText;
          if (!older.trim() || batch.exhausted) {
            exhaustedPods.add(batch.podName);
          } else {
            anyOlder = true;
            historyDepthByPod[batch.podName] = batch.requestDepth;
          }
        } else {
          const known = knownTextForPod(tab.chunks, batch.podName);
          const diff = olderPrefixFromTail(batch.tailText, known);
          older = diff.older;
          if (diff.exhausted || batch.exhausted || !older.trim()) {
            exhaustedPods.add(batch.podName);
          } else {
            anyOlder = true;
            historyDepthByPod[batch.podName] = batch.requestDepth;
          }
        }
        if (older.trim()) {
          olderChunks.push({
            windowId: tab.windowId,
            podName: batch.podName,
            text: older,
            timestamp: new Date(0).toISOString(),
          });
        }
      }

      const allExhausted =
        (result.pods.length === 0 ||
          result.pods.every((p) => exhaustedPods.has(p.podName))) &&
        !anyOlder;

      setTabs((prev) => {
        const next = prev.map((t) => {
          if (t.kind !== "deployment" || t.tabId !== tabId) return t;
          const chunks = anyOlder ? [...olderChunks, ...t.chunks] : t.chunks;
          if (chunks.length > MAX_CHUNKS) {
            chunks.splice(0, chunks.length - MAX_CHUNKS);
          }
          return {
            ...t,
            chunks,
            historyDepthByPod,
            exhaustedPods: [...exhaustedPods],
            loadOlderStatus: (allExhausted ? "exhausted" : "idle") as LoadOlderStatus,
            loadOlderMessage: allExhausted
              ? "Inicio del historial disponible"
              : null,
            prependGeneration: anyOlder
              ? t.prependGeneration + 1
              : t.prependGeneration,
            stickToBottom: anyOlder ? false : t.stickToBottom,
          };
        });
        tabsRef.current = next;
        return next;
      });
      return allExhausted ? "exhausted" : "more";
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setTabs((prev) =>
        prev.map((t) =>
          t.kind === "deployment" && t.tabId === tabId
            ? {
                ...t,
                loadOlderStatus: "error",
                loadOlderMessage: msg || "No se pudo cargar historial",
              }
            : t,
        ),
      );
      return "error";
    }
  }, []);

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    openDeployment,
    openPod,
    openCombinedLogs,
    openConfigMap,
    openService,
    closeTab,
    closeAll,
    closeForInstance,
    setView,
    setSearch,
    setStickToBottom,
    loadOlder,
    gatherForExport: async (
      tabId: string,
      isCancelled: () => boolean,
      onProgress?: (page: number) => void,
    ) => {
      const { exhaustLogHistory } = await import("../lib/fileExport");
      const gather = await exhaustLogHistory({
        isCancelled,
        onProgress,
        loadPage: () => loadOlder(tabId),
      });
      if (gather === "cancelled") return { status: "cancelled" as const };
      if (gather === "error") return { status: "error" as const };
      const tab = tabsRef.current.find((t) => t.tabId === tabId);
      if (!tab || tab.kind !== "deployment") {
        return { status: "error" as const };
      }
      return { status: "ok" as const, chunks: tab.chunks, deployment: tab.deployment };
    },
  };
}
