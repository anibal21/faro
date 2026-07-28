import { useMemo, useState } from "react";
import {
  analyzeWriteGroup,
  type AnalysisFinding,
} from "../lib/ipc";
import type { WorkspaceTab } from "../hooks/useWorkspaceTabs";
import {
  chunksToWriteGroups,
  StructuredLogView,
  type WriteGroup,
} from "../components/logs/StructuredLogView";
import { RawLogView } from "../components/logs/RawLogView";
import { WorkloadSummaryStrip } from "../components/logs/WorkloadSummaryStrip";
import { ConfigMapTab } from "../components/catalog/ConfigMapTab";
import { LogWorkspace } from "../components/logs/LogWorkspace";
import { useAnalysisDrawer } from "../hooks/useAnalysisDrawer";

type LogWindowProps = {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onSetView: (id: string, view: "structured" | "raw") => void;
  onSetSearch: (id: string, search: string) => void;
};

function tabLabel(t: WorkspaceTab): string {
  return t.kind === "deployment" ? t.deployment : t.name;
}

export function LogWindow({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onSetView,
  onSetSearch,
}: LogWindowProps) {
  const [findings, setFindings] = useState<AnalysisFinding[] | null>(null);
  const drawer = useAnalysisDrawer();
  const active = tabs.find((t) => t.tabId === activeTabId) ?? tabs[0];

  const groups = useMemo(() => {
    if (!active || active.kind !== "deployment") return [];
    return chunksToWriteGroups(active.chunks, active.search);
  }, [active]);

  async function handleAnalyze(group: WriteGroup) {
    if (!active || active.kind !== "deployment") return;
    const result = await analyzeWriteGroup(
      group.text,
      `${active.namespace}/${active.deployment}`,
    );
    setFindings(result);
    drawer.openDrawer();
  }

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="log-window flex min-h-0 flex-1 flex-col text-xs">
      <div className="log-window__tabs flex flex-wrap gap-0.5 border-b border-border pb-0.5">
        {tabs.map((t) => (
          <button
            key={t.tabId}
            type="button"
            className={
              t.tabId === active?.tabId
                ? "log-window__tab log-window__tab--active"
                : "log-window__tab"
            }
            onClick={() => onSelect(t.tabId)}
          >
            {t.kind === "configmap" ? "CM: " : ""}
            {tabLabel(t)}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                void onClose(t.tabId);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  void onClose(t.tabId);
                }
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>
      {active?.kind === "deployment" && (
        <LogWorkspace
          drawerOpen={drawer.open}
          findings={findings}
          onCloseDrawer={() => {
            drawer.closeDrawer();
            setFindings(null);
          }}
          onOpenDrawer={drawer.openDrawer}
        >
          <div className="flex h-full min-h-0 flex-col">
            <WorkloadSummaryStrip summary={active.summary} />
            <div className="log-window__toolbar flex flex-wrap items-center gap-1.5 py-1">
              <div className="log-window__views flex gap-0.5">
                <button
                  type="button"
                  className={active.view === "structured" ? "is-active" : ""}
                  onClick={() => onSetView(active.tabId, "structured")}
                >
                  Structured
                </button>
                <button
                  type="button"
                  className={active.view === "raw" ? "is-active" : ""}
                  onClick={() => onSetView(active.tabId, "raw")}
                >
                  Raw
                </button>
              </div>
              <input
                type="search"
                placeholder="Buscar en logs…"
                value={active.search}
                onChange={(e) => onSetSearch(active.tabId, e.target.value)}
              />
              <span className="log-window__status">{active.status}</span>
            </div>
            <div className="log-window__body min-h-0 flex-1 overflow-hidden">
              {active.view === "structured" ? (
                <StructuredLogView groups={groups} onAnalyze={handleAnalyze} />
              ) : (
                <RawLogView
                  lines={active.chunks.map(
                    (c) => `${c.timestamp} ${c.podName} ${c.text}`,
                  )}
                  search={active.search}
                />
              )}
            </div>
          </div>
        </LogWorkspace>
      )}
      {active?.kind === "configmap" && (
        <ConfigMapTab detail={active.detail} name={active.name} />
      )}
    </section>
  );
}
