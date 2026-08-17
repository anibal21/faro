import { useEffect, useState } from "react";
import { prefsGet, prefsSet, type ConnectionInstance, type EnvUpsertInput } from "../lib/ipc";
import { TitleBar } from "../components/chrome/TitleBar";
import { AppMenubar } from "../components/chrome/AppMenubar";
import { SecurityDialog } from "../components/help/SecurityDialog";
import { AboutFaroDialog } from "../components/help/AboutFaroDialog";
import { UpdateAvailableDialog } from "../components/update/UpdateAvailableDialog";
import { NewEnvironmentModal } from "../components/env/NewEnvironmentModal";
import { ConnectionLimitModal } from "../components/env/ConnectionLimitModal";
import { EnvTreeNav } from "../components/catalog/EnvTreeNav";
import { LogWindow } from "./LogWindow";
import type { useConnection } from "../hooks/useConnection";
import { useConnectionHealth } from "../hooks/useConnectionHealth";
import type { useCatalog } from "../hooks/useCatalog";
import type { useConfigMaps } from "../hooks/useConfigMaps";
import type { useWorkspaceTabs } from "../hooks/useWorkspaceTabs";
import { useAppUpdateCheck } from "../hooks/useAppUpdateCheck";
import "./MainShell.css";
import {
  clampSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
} from "../lib/sidebarWidth";

type MainShellProps = {
  environments: ConnectionInstance[];
  loaded: ConnectionInstance[];
  activeId: string | null;
  liveGeneration: number;
  connection: ReturnType<typeof useConnection>;
  catalog: ReturnType<typeof useCatalog>;
  configMaps: ReturnType<typeof useConfigMaps>;
  workspace: ReturnType<typeof useWorkspaceTabs>;
  theme: "light" | "dark";
  onTheme: (t: "light" | "dark") => void;
  onUpsert: (payload: EnvUpsertInput) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRestoreDemo: () => Promise<void>;
  onSetActive: (id: string) => Promise<void>;
  error?: string | null;
};

export function MainShell({
  environments,
  loaded,
  activeId,
  liveGeneration,
  connection,
  catalog,
  configMaps,
  workspace,
  theme,
  onTheme,
  onUpsert,
  onRemove,
  onRestoreDemo,
  onSetActive,
  error = null,
}: MainShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConnectionInstance | null>(null);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const health = useConnectionHealth(true);
  const { connectedIds, markDisconnected } = connection;
  const update = useAppUpdateCheck(true);

  useEffect(() => {
    void prefsGet().then((prefs) => {
      const saved = Number(prefs["ui.sidebarWidth"]);
      if (Number.isFinite(saved)) setSidebarWidth(clampSidebarWidth(saved));
    });
  }, []);

  // After connect/disconnect, pull authoritative keepAlive/status promptly
  useEffect(() => {
    void health.refresh();
  }, [connectedIds, health.refresh]);

  useEffect(() => {
    for (const [id, row] of Object.entries(health.byId)) {
      if (row.status === "disconnected" && connectedIds.includes(id)) {
        markDisconnected(id);
      }
    }
  }, [health.byId, connectedIds, markDisconnected]);

  useEffect(() => {
    if (!update.manualMessage) return;
    window.alert(update.manualMessage);
    update.clearManualMessage();
  }, [update.manualMessage, update.clearManualMessage]);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(env: ConnectionInstance) {
    if (env.isBuiltinDemo || env.id === "faro-demo") return;
    setEditing(env);
    setModalOpen(true);
  }

  async function connectEnv(id: string) {
    if (activeId !== id) {
      await onSetActive(id);
    }
    await connection.connect(id);
  }

  async function disconnectAll() {
    const ok = window.confirm(
      "Desconectar todos los ambientes conectados?",
    );
    if (!ok) return;
    const ids = [...connection.connectedIds];
    for (const id of ids) {
      await connection.disconnect(id);
    }
    await workspace.closeAll();
  }

  async function deleteEnv(env: ConnectionInstance) {
    if (!window.confirm(`¿Eliminar la configuración "${env.name}"?`)) return;
    if (connection.connectedIds.includes(env.id)) {
      await connection.disconnect(env.id);
    }
    await workspace.closeForInstance(env.id);
    await onRemove(env.id);
  }

  async function focusConnected(id: string) {
    await onSetActive(id);
    if (connection.connectedIds.includes(id)) {
      await connection.focus(id);
      await catalog.refresh();
      await configMaps.refresh();
    }
  }

  const active =
    loaded.find((e) => e.id === activeId) ??
    environments.find((e) => e.id === activeId) ??
    null;
  const errorId = connection.errorInstanceId;
  const offer = update.offer;

  return (
    <div className="main-shell flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground text-[13px]">
      <TitleBar />
      <AppMenubar
        theme={theme}
        onTheme={onTheme}
        onNew={openNew}
        onDisconnectAll={() => {
          void disconnectAll();
        }}
        onOpenSecurity={() => setSecurityOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onCheckUpdates={() => {
          void update.checkManual();
        }}
      />
      <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} />
      <AboutFaroDialog open={aboutOpen} onOpenChange={setAboutOpen} />      {offer ? (
        <UpdateAvailableDialog
          open={update.dialogOpen}
          currentVersion={offer.current}
          availableVersion={offer.available ?? ""}
          notes={offer.notes}
          canInstall={offer.canInstall}
          installing={update.installing}
          progressPercent={update.progressPercent}
          installMessage={update.installMessage}
          error={update.installError}
          onAccept={() => {
            void update.accept();
          }}
          onReject={update.reject}
          onOpenChange={update.setDialogOpen}
        />
      ) : null}

      <div className="main-shell__body flex min-h-0 flex-1">
        <EnvTreeNav
          environments={environments}
          selectedId={activeId}
          connectedIds={connection.connectedIds}
          connectingId={connection.connectingId}
          connectionErrorId={errorId}
          catalogFocusId={connection.connectedInstanceId}
          healthById={health.byId}
          onSetKeepAlive={(id, enabled) => {
            void health.setKeepAlive(id, enabled).catch((e) => {
              window.alert(
                e instanceof Error ? e.message : String(e),
              );
            });
          }}
          onReconnect={(id) => {
            void connectEnv(id);
          }}
          deployments={catalog.deployments}
          pods={catalog.pods}
          services={catalog.services}
          configMaps={configMaps.items}
          catalogLoading={catalog.loading}
          onSelect={(id) => {
            void focusConnected(id);
          }}
          onConnect={(id) => {
            void connectEnv(id);
          }}
          onDisconnect={(id) => {
            void connection.disconnect(id).then(() => {
              void workspace.closeForInstance(id);
            });
          }}
          onEdit={openEdit}
          onDelete={(env) => {
            void deleteEnv(env);
          }}
          onOpenDeployment={(instanceId, ns, name) => {
            const colorIndex = environments.find((e) => e.id === instanceId)?.colorIndex ?? 0;
            void workspace.openDeployment(instanceId, colorIndex, ns, name);
          }}
          onOpenPod={(instanceId, ns, pod, dep) => {
            const colorIndex = environments.find((e) => e.id === instanceId)?.colorIndex ?? 0;
            void workspace.openPod(instanceId, colorIndex, ns, pod, dep);
          }}
          onOpenService={(instanceId, ns, name) => {
            const colorIndex = environments.find((e) => e.id === instanceId)?.colorIndex ?? 0;
            void workspace.openService(instanceId, colorIndex, ns, name);
          }}
          onOpenConfigMap={(instanceId, ns, name) => {
            const colorIndex = environments.find((e) => e.id === instanceId)?.colorIndex ?? 0;
            void workspace.openConfigMap(instanceId, colorIndex, ns, name);
          }}
          onRefreshCatalog={() => {
            void connection.refreshCatalog().then(() => {
              void catalog.refresh();
              void configMaps.refresh();
            });
          }}
          width={sidebarWidth}
          onWidthChange={(value) => {
            const next = clampSidebarWidth(value);
            setSidebarWidth(next);
            void prefsSet("ui.sidebarWidth", String(next));
          }}
        />

        <main className="main-shell__center flex min-w-0 flex-1 flex-col border-l border-border p-1.5">
          {!connection.connected ? (
            <div className="main-shell__empty m-auto max-w-md px-4 py-8 text-center text-[13px]">
              <h2 className="mb-2 text-base font-semibold">
                {environments.length === 0
                  ? "Bienvenido a Faro"
                  : "Selecciona y conecta"}
              </h2>
              {environments.length === 0 ? (
                <p className="mb-3 text-muted-foreground">
                  No hay ambientes guardados. Usa Ambientes → Nuevo…
                </p>
              ) : (
                <>
                  <p className="mb-2 text-muted-foreground">
                    Seleccionado:{" "}
                    <strong className="text-foreground">
                      {active?.name ?? "(ninguno)"}
                    </strong>
                    {active
                      ? ` — ${active.clusterName} (${active.regionName})`
                      : ""}
                  </p>
                  <p className="mb-3 text-[12px] text-muted-foreground">
                    Clic derecho en el arbol → Conectar. Demo offline:{" "}
                    <code>fixtures/demo.pem</code>. Generacion live:{" "}
                    {liveGeneration}.
                  </p>
                </>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground"
                  onClick={openNew}
                >
                  Nuevo ambiente
                </button>
                {activeId && (
                  <button
                    type="button"
                    className="rounded-md border border-primary px-3 py-1.5 text-[13px] font-semibold"
                    onClick={() => void connectEnv(activeId)}
                  >
                    Conectar
                  </button>
                )}
              </div>
              {(error || connection.error) && (
                <p className="mt-3 text-[12px] text-destructive">
                  {error ?? connection.error}
                </p>
              )}
            </div>
          ) : (
            <>
              <LogWindow
                tabs={workspace.tabs}
                activeTabId={workspace.activeTabId}
                onSelect={workspace.setActiveTabId}
                onClose={(id) => {
                  void workspace.closeTab(id);
                }}
                onSetView={workspace.setView}
                onSetSearch={workspace.setSearch}
                onSetStickToBottom={workspace.setStickToBottom}
                onLoadOlder={(id) => workspace.loadOlder(id)}
                onGatherExport={(tabId, isCancelled, onProgress) =>
                  workspace.gatherForExport(tabId, isCancelled, onProgress)
                }
              />
              {workspace.tabs.length === 0 && (
                <p className="p-2 text-[12px] text-muted-foreground">
                  Elige un Deployment (YAML), Pod (logs), Service o ConfigMap en
                  el arbol izquierdo.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      <NewEnvironmentModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={onUpsert}
        onRestoreDemo={onRestoreDemo}
      />
      <ConnectionLimitModal
        open={connection.limitReached}
        onClose={connection.dismissLimit}
      />
    </div>
  );
}
