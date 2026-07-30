import { useState } from "react";
import type { ConnectionInstance, EnvUpsertInput } from "../lib/ipc";
import { TitleBar } from "../components/chrome/TitleBar";
import { AppMenubar } from "../components/chrome/AppMenubar";
import { NewEnvironmentModal } from "../components/env/NewEnvironmentModal";
import { EnvTreeNav } from "../components/catalog/EnvTreeNav";
import { LogWindow } from "./LogWindow";
import type { useConnection } from "../hooks/useConnection";
import type { useCatalog } from "../hooks/useCatalog";
import type { useConfigMaps } from "../hooks/useConfigMaps";
import type { useWorkspaceTabs } from "../hooks/useWorkspaceTabs";
import "./MainShell.css";

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
  onSetActive,
  error = null,
}: MainShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConnectionInstance | null>(null);

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

  const active =
    loaded.find((e) => e.id === activeId) ??
    environments.find((e) => e.id === activeId) ??
    null;
  const errorId = connection.errorInstanceId;

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
      />

      <div className="main-shell__body flex min-h-0 flex-1">
        <EnvTreeNav
          environments={environments}
          selectedId={activeId}
          connectedIds={connection.connectedIds}
          connectingId={connection.connectingId}
          connectionErrorId={errorId}
          catalogFocusId={connection.connectedInstanceId}
          deployments={catalog.deployments}
          pods={catalog.pods}
          services={catalog.services}
          configMaps={configMaps.items}
          catalogLoading={catalog.loading}
          onSelect={(id) => {
            void onSetActive(id);
          }}
          onConnect={(id) => {
            void connectEnv(id);
          }}
          onDisconnect={(id) => {
            void connection.disconnect(id).then(() => {
              if (id === connection.connectedInstanceId) {
                void workspace.closeAll();
              }
            });
          }}
          onEdit={openEdit}
          onOpenDeployment={(ns, name) => {
            void workspace.openDeployment(ns, name);
          }}
          onOpenPod={(ns, pod, dep) => {
            void workspace.openPod(ns, pod, dep);
          }}
          onOpenService={(ns, name) => {
            void workspace.openService(ns, name);
          }}
          onOpenConfigMap={(ns, name) => {
            void workspace.openConfigMap(ns, name);
          }}
          onRefreshCatalog={() => {
            void connection.refreshCatalog().then(() => {
              void catalog.refresh();
              void configMaps.refresh();
            });
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
                onLoadOlder={(id) => {
                  void workspace.loadOlder(id);
                }}
              />
              {workspace.tabs.length === 0 && (
                <p className="p-2 text-[12px] text-muted-foreground">
                  Elige un Deployment o ConfigMap en el arbol izquierdo.
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
      />
    </div>
  );
}
