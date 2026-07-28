import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { ConfigMapRow, ConnectionInstance, DeploymentRow } from "../../lib/ipc";
import { getAppVersionDisplay } from "../../lib/appVersion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { EnvTreeStatusDot, type EnvConnStatus } from "./EnvTreeStatusDot";
import { cn } from "@/lib/utils";

type EnvTreeNavProps = {
  environments: ConnectionInstance[];
  selectedId: string | null;
  connectedIds: string[];
  connectingId: string | null;
  connectionErrorId: string | null;
  catalogFocusId: string | null;
  deployments: DeploymentRow[];
  configMaps: ConfigMapRow[];
  catalogLoading?: boolean;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onEdit: (env: ConnectionInstance) => void;
  onOpenDeployment: (namespace: string, name: string) => void;
  onOpenConfigMap: (namespace: string, name: string) => void;
  onRefreshCatalog?: () => void;
};

function ExpandIcon({ open }: { open: boolean }) {
  const Icon = open ? Minus : Plus;
  return <Icon className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />;
}

export function EnvTreeNav({
  environments,
  selectedId,
  connectedIds,
  connectingId,
  connectionErrorId,
  catalogFocusId,
  deployments,
  configMaps,
  catalogLoading,
  onSelect,
  onConnect,
  onDisconnect,
  onEdit,
  onOpenDeployment,
  onOpenConfigMap,
  onRefreshCatalog,
}: EnvTreeNavProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [podsOpen, setPodsOpen] = useState<Record<string, boolean>>({});
  const [cmsOpen, setCmsOpen] = useState<Record<string, boolean>>({});
  const [version, setVersion] = useState("v?");

  useEffect(() => {
    let cancelled = false;
    void getAppVersionDisplay().then((v) => {
      if (!cancelled) setVersion(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function statusFor(id: string): EnvConnStatus {
    if (connectingId === id) return "connecting";
    if (connectionErrorId === id) return "error";
    if (connectedIds.includes(id)) return "connected";
    return "disconnected";
  }

  return (
    <aside
      className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-border bg-card text-[13px]"
      aria-label="Monitor"
    >
      <div className="mb-1 flex shrink-0 items-center justify-between px-2 pt-1.5">
        <span className="font-semibold text-muted-foreground">Monitor</span>
        {onRefreshCatalog && connectedIds.length > 0 && (
          <button
            type="button"
            className="text-[12px] text-muted-foreground hover:text-foreground"
            onClick={onRefreshCatalog}
          >
            Refrescar
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-1.5 pb-1">
        {environments.length === 0 ? (
          <p className="px-1 text-muted-foreground">
            No hay ambientes guardados aun. Usa Ambientes → Nuevo…
          </p>
        ) : (
          <ul className="space-y-0.5">
            {environments.map((env) => {
              const isExp = expanded[env.id] ?? env.id === selectedId;
              const st = statusFor(env.id);
              const isSel = env.id === selectedId;
              const showCatalog =
                env.id === catalogFocusId && st === "connected";
              return (
                <li key={env.id}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-sm px-0.5 py-0.5",
                          isSel && "bg-accent/60",
                        )}
                      >
                        <button
                          type="button"
                          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent"
                          aria-expanded={isExp}
                          aria-label={isExp ? "Contraer" : "Expandir"}
                          onClick={() =>
                            setExpanded((m) => ({ ...m, [env.id]: !isExp }))
                          }
                        >
                          <ExpandIcon open={isExp} />
                        </button>
                        <button
                          type="button"
                          className="min-w-0 flex-1 truncate text-left font-medium hover:underline"
                          onClick={() => onSelect(env.id)}
                        >
                          {env.name}{" "}
                          <span className="font-normal text-muted-foreground">
                            {env.clusterName}
                          </span>
                        </button>
                        <EnvTreeStatusDot status={st} />
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {st === "connected" ? (
                        <ContextMenuItem onSelect={() => onDisconnect(env.id)}>
                          Desconectar
                        </ContextMenuItem>
                      ) : (
                        <ContextMenuItem
                          disabled={st === "connecting"}
                          onSelect={() => onConnect(env.id)}
                        >
                          Conectar
                        </ContextMenuItem>
                      )}
                      <ContextMenuSeparator />
                      <ContextMenuItem onSelect={() => onEdit(env)}>
                        Editar configuracion
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {isExp && (
                    <ul className="ml-4 space-y-0.5 border-l border-border pl-2">
                      <li>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold text-muted-foreground"
                          aria-expanded={podsOpen[env.id] ?? true}
                          onClick={() =>
                            setPodsOpen((m) => ({
                              ...m,
                              [env.id]: !(m[env.id] ?? true),
                            }))
                          }
                        >
                          <ExpandIcon open={podsOpen[env.id] ?? true} /> Pods
                        </button>
                        {(podsOpen[env.id] ?? true) && (
                          <ul className="ml-2">
                            {!showCatalog && (
                              <li className="text-muted-foreground">
                                Conecta para ver catalogo
                              </li>
                            )}
                            {showCatalog && catalogLoading && (
                              <li className="text-muted-foreground">
                                Cargando…
                              </li>
                            )}
                            {showCatalog &&
                              deployments.map((d) => (
                                <li key={d.id}>
                                  <button
                                    type="button"
                                    className="truncate text-left hover:underline"
                                    onClick={() =>
                                      onOpenDeployment(d.namespace, d.name)
                                    }
                                  >
                                    {d.name}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                      <li>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold text-muted-foreground"
                          aria-expanded={cmsOpen[env.id] ?? true}
                          onClick={() =>
                            setCmsOpen((m) => ({
                              ...m,
                              [env.id]: !(m[env.id] ?? true),
                            }))
                          }
                        >
                          <ExpandIcon open={cmsOpen[env.id] ?? true} />{" "}
                          ConfigMaps
                        </button>
                        {(cmsOpen[env.id] ?? true) && (
                          <ul className="ml-2">
                            {!showCatalog && (
                              <li className="text-muted-foreground">
                                Conecta para ver catalogo
                              </li>
                            )}
                            {showCatalog &&
                              configMaps.map((cm) => (
                                <li key={cm.id}>
                                  <button
                                    type="button"
                                    className="truncate text-left hover:underline"
                                    onClick={() =>
                                      onOpenConfigMap(cm.namespace, cm.name)
                                    }
                                  >
                                    {cm.name}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer
        className="shrink-0 border-t border-border px-2 py-1.5 text-[12px] text-muted-foreground"
        data-testid="app-version"
      >
        {version}
      </footer>
    </aside>
  );
}
