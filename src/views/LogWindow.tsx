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
import { ServiceDetailTab } from "../components/catalog/ServiceDetailTab";
import { LogWorkspace } from "../components/logs/LogWorkspace";
import { useAnalysisDrawer } from "../hooks/useAnalysisDrawer";
import {
  buildConfigMapExport,
  buildRawLogExport,
  saveTextFile,
} from "../lib/fileExport";

type LogWindowProps = {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onSetView: (id: string, view: "structured" | "raw") => void;
  onSetSearch: (id: string, search: string) => void;
  onSetStickToBottom: (id: string, value: boolean) => void;
  onLoadOlder: (id: string) => void;
};

function tabLabel(t: WorkspaceTab): string {
  if (t.kind === "deployment") {
    return t.podName ?? t.deployment;
  }
  if (t.kind === "service") return `Svc: ${t.name}`;
  return t.name;
}

function localizeStatus(status: string): string {
  if (/following/i.test(status)) {
    return status.replace(/following/gi, "siguiendo");
  }
  if (status === "idle") return "inactivo";
  if (status === "starting") return "iniciando";
  return status;
}

export function LogWindow({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onSetView,
  onSetSearch,
  onSetStickToBottom,
  onLoadOlder,
}: LogWindowProps) {
  const [findings, setFindings] = useState<AnalysisFinding[] | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
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

  async function exportActive() {
    setExportMsg(null);
    if (!active) return;
    if (active.kind === "deployment") {
      if (active.chunks.length === 0) {
        setExportMsg("No hay logs para exportar");
        return;
      }
      const body = buildRawLogExport(active.chunks);
      const name = `${active.podName ?? active.deployment}-logs.txt`;
      const result = await saveTextFile(name, body);
      if (result === "cancelled") setExportMsg(null);
      else setExportMsg("Exportado");
      return;
    }
    if (active.kind === "configmap") {
      if (!active.detail?.entries.length) {
        setExportMsg("No hay datos para exportar");
        return;
      }
      const body = buildConfigMapExport(
        active.name,
        active.namespace,
        active.detail.entries,
      );
      const result = await saveTextFile(`${active.name}.txt`, body);
      if (result === "cancelled") setExportMsg(null);
      else setExportMsg("Exportado");
    }
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
              <label className="log-window__stick">
                <input
                  type="checkbox"
                  role="switch"
                  aria-label="Pegar al final"
                  checked={active.stickToBottom}
                  onChange={(e) =>
                    onSetStickToBottom(active.tabId, e.target.checked)
                  }
                />
                <span>Pegar al final</span>
              </label>
              <button
                type="button"
                disabled={
                  active.loadOlderStatus === "loading" ||
                  active.loadOlderStatus === "exhausted"
                }
                onClick={() => onLoadOlder(active.tabId)}
              >
                {active.loadOlderStatus === "loading"
                  ? "Cargando…"
                  : active.loadOlderStatus === "exhausted"
                    ? "Inicio del historial"
                    : "Cargar 500 anteriores"}
              </button>
              <button
                type="button"
                disabled={active.chunks.length === 0}
                onClick={() => {
                  void exportActive();
                }}
              >
                Exportar
              </button>
              <input
                type="search"
                placeholder="Buscar en logs…"
                value={active.search}
                onChange={(e) => onSetSearch(active.tabId, e.target.value)}
              />
              <span className="log-window__status">
                {localizeStatus(active.status)}
              </span>
              {active.loadOlderMessage && (
                <span className="log-window__status">{active.loadOlderMessage}</span>
              )}
              {exportMsg && (
                <span className="log-window__status">{exportMsg}</span>
              )}
            </div>
            <div className="log-window__body min-h-0 flex-1 overflow-hidden">
              {active.view === "structured" ? (
                <StructuredLogView
                  groups={groups}
                  onAnalyze={handleAnalyze}
                  stickToBottom={active.stickToBottom}
                  onStickToBottomChange={(v) =>
                    onSetStickToBottom(active.tabId, v)
                  }
                  prependGeneration={active.prependGeneration}
                  chunkCount={active.chunks.length}
                />
              ) : (
                <RawLogView
                  lines={active.chunks.map(
                    (c) => `${c.timestamp} ${c.podName} ${c.text}`,
                  )}
                  search={active.search}
                  stickToBottom={active.stickToBottom}
                  onStickToBottomChange={(v) =>
                    onSetStickToBottom(active.tabId, v)
                  }
                  prependGeneration={active.prependGeneration}
                  chunkCount={active.chunks.length}
                />
              )}
            </div>
          </div>
        </LogWorkspace>
      )}
      {active?.kind === "configmap" && (
        <div className="configmap-tab-shell min-h-0 flex flex-1 flex-col overflow-hidden">
          <div className="log-window__toolbar flex flex-wrap items-center gap-1.5 py-1">
            <button
              type="button"
              disabled={!active.detail?.entries.length}
              onClick={() => {
                void exportActive();
              }}
            >
              Exportar
            </button>
            {exportMsg && (
              <span className="log-window__status">{exportMsg}</span>
            )}
          </div>
          <ConfigMapTab detail={active.detail} name={active.name} />
        </div>
      )}
      {active?.kind === "service" && (
        <div className="configmap-tab-shell min-h-0 flex flex-1 flex-col overflow-hidden">
          <ServiceDetailTab detail={active.detail} name={active.name} />
        </div>
      )}
    </section>
  );
}
