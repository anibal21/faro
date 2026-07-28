import { useCallback, useEffect, useRef, useState } from "react";
import {
  k8sGetConfigmap,
  listenEvent,
  logsClose,
  logsOpen,
  workloadSummary,
  type ConfigMapDetail,
  type LogsChunk,
  type LogsStatus,
  type WorkloadSummary,
} from "../lib/ipc";
import { configmapNavKey, deploymentNavKey } from "./tabKeys";

export type WorkspaceTab =
  | {
      kind: "deployment";
      tabId: string;
      navKey: string;
      windowId: string;
      namespace: string;
      deployment: string;
      chunks: LogsChunk[];
      status: string;
      view: "structured" | "raw";
      search: string;
      summary: WorkloadSummary | null;
    }
  | {
      kind: "configmap";
      tabId: string;
      navKey: string;
      namespace: string;
      name: string;
      detail: ConfigMapDetail | null;
    };

const MAX_CHUNKS = 500;

export function useWorkspaceTabs(liveGeneration: number) {
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
            return { ...t, chunks };
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
      return () => undefined;
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

  useEffect(() => {
    const current = tabsRef.current;
    if (current.length === 0) return;
    void (async () => {
      for (const t of current) {
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
    })();
  }, [liveGeneration]);

  const openDeployment = useCallback(
    async (namespace: string, deployment: string) => {
      const navKey = deploymentNavKey(namespace, deployment);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      const [{ windowId }, summary] = await Promise.all([
        logsOpen(namespace, deployment),
        workloadSummary(namespace, deployment).catch(() => null),
      ]);
      const tabId = windowId;
      const tab: WorkspaceTab = {
        kind: "deployment",
        tabId,
        navKey,
        windowId,
        namespace,
        deployment,
        chunks: [],
        status: "starting",
        view: "structured",
        search: "",
        summary,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tabId);
    },
    [],
  );

  const openConfigMap = useCallback(
    async (namespace: string, name: string) => {
      const navKey = configmapNavKey(namespace, name);
      const existing = tabsRef.current.find((t) => t.navKey === navKey);
      if (existing) {
        setActiveTabId(existing.tabId);
        return;
      }
      const detail = await k8sGetConfigmap(namespace, name);
      const tabId = navKey;
      const tab: WorkspaceTab = {
        kind: "configmap",
        tabId,
        navKey,
        namespace,
        name,
        detail,
      };
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tabId);
    },
    [],
  );

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

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    openDeployment,
    openConfigMap,
    closeTab,
    closeAll,
    setView,
    setSearch,
  };
}
