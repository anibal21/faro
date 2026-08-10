import { useEffect, useState, type ReactNode, type PointerEvent } from "react";
import { Minus, Plus } from "lucide-react";
import type {
  ConfigMapRow,
  ConnectionHealthState,
  ConnectionInstance,
  DeploymentRow,
  FlatPodRow,
  ServiceRow,
} from "../../lib/ipc";
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
import { envColorVar } from "@/lib/envColors";
import { clampSidebarWidth } from "@/lib/sidebarWidth";
import {
  combinedPodLabel,
  groupPodsByDeployment,
} from "@/lib/podGroups";

type EnvTreeNavProps = {
  environments: ConnectionInstance[];
  selectedId: string | null;
  connectedIds: string[];
  connectingId: string | null;
  connectionErrorId: string | null;
  catalogFocusId: string | null;
  healthById?: Record<string, ConnectionHealthState>;
  onSetKeepAlive?: (id: string, enabled: boolean) => void;
  onReconnect?: (id: string) => void;
  deployments: DeploymentRow[];
  pods: FlatPodRow[];
  services: ServiceRow[];
  configMaps: ConfigMapRow[];
  catalogLoading?: boolean;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onEdit: (env: ConnectionInstance) => void;
  onDelete?: (env: ConnectionInstance) => void;
  onOpenDeployment: (instanceId: string, namespace: string, name: string) => void;
  onOpenPod: (instanceId: string, namespace: string, podName: string, deploymentName?: string | null) => void;
  onOpenService: (instanceId: string, namespace: string, name: string) => void;
  onOpenConfigMap: (instanceId: string, namespace: string, name: string) => void;
  onRefreshCatalog?: () => void;
  width?: number;
  onWidthChange?: (width: number) => void;
};

function ExpandIcon({ open }: { open: boolean }) {
  const Icon = open ? Minus : Plus;
  return <Icon className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />;
}

type SectionKey = "deployments" | "pods" | "services" | "configmaps";

export function EnvTreeNav({
  environments,
  selectedId,
  connectedIds,
  connectingId,
  connectionErrorId,
  catalogFocusId,
  healthById = {},
  onSetKeepAlive,
  onReconnect,
  deployments,
  pods,
  services,
  configMaps,
  catalogLoading,
  onSelect,
  onConnect,
  onDisconnect,
  onEdit,
  onDelete = () => undefined,
  onOpenDeployment,
  onOpenPod,
  onOpenService,
  onOpenConfigMap,
  onRefreshCatalog,
  width = 240,
  onWidthChange = () => undefined,
}: EnvTreeNavProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState<
    Record<string, Record<SectionKey, boolean>>
  >({});
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
    const h = healthById[id]?.status;
    if (h === "degraded") return "degraded";
    if (h === "disconnected") return "disconnected";
    if (connectedIds.includes(id) || h === "connected") return "connected";
    return "disconnected";
  }

  /** Prefer explicit health; never invent ON when the row is missing. */
  function keepAliveOn(id: string): boolean {
    return healthById[id]?.keepAlive === true;
  }

  function isSectionOpen(envId: string, key: SectionKey): boolean {
    return sectionOpen[envId]?.[key] ?? true;
  }

  function toggleSection(envId: string, key: SectionKey) {
    setSectionOpen((m) => ({
      ...m,
      [envId]: {
        deployments: m[envId]?.deployments ?? true,
        pods: m[envId]?.pods ?? true,
        services: m[envId]?.services ?? true,
        configmaps: m[envId]?.configmaps ?? true,
        [key]: !(m[envId]?.[key] ?? true),
      },
    }));
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    const move = (e: globalThis.PointerEvent) =>
      onWidthChange(clampSidebarWidth(startWidth + e.clientX - startX));
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function section(
    envId: string,
    key: SectionKey,
    title: string,
    showCatalog: boolean,
    children: ReactNode,
  ) {
    const open = isSectionOpen(envId, key);
    return (
      <li className="env-tree__section">
        <button
          type="button"
          className="env-tree__section-title inline-flex items-center gap-1 font-semibold text-muted-foreground"
          aria-expanded={open}
          onClick={() => toggleSection(envId, key)}
        >
          <ExpandIcon open={open} /> {title}
        </button>
        {open && (
          <ul className="env-tree__section-items">
            {!showCatalog && (
              <li className="text-muted-foreground">Conecta para ver catalogo</li>
            )}
            {showCatalog && catalogLoading && (
              <li className="text-muted-foreground">Cargando…</li>
            )}
            {showCatalog && !catalogLoading && children}
          </ul>
        )}
      </li>
    );
  }

  return (
    <aside
      className="env-tree relative flex h-full min-h-0 shrink-0 flex-col border-r border-border bg-card text-[13px]"
      aria-label="Monitor"
      style={{ width }}
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
            {[...environments]
              .sort((a, b) => {
                const aDemo = a.isBuiltinDemo || a.id === "faro-demo" ? 0 : 1;
                const bDemo = b.isBuiltinDemo || b.id === "faro-demo" ? 0 : 1;
                if (aDemo !== bDemo) return aDemo - bDemo;
                return a.name.localeCompare(b.name);
              })
              .map((env) => {
                const isDemo = env.isBuiltinDemo || env.id === "faro-demo";
                const isExp = expanded[env.id] ?? env.id === selectedId;
                const st = statusFor(env.id);
                const isSel = env.id === selectedId;
                const showCatalog =
                  env.id === catalogFocusId &&
                  (st === "connected" || st === "degraded");
                const needsReconnect =
                  st === "disconnected" &&
                  healthById[env.id]?.status === "disconnected";
                return (
                  <li key={env.id}>
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center gap-1 rounded-sm px-0.5 py-0.5",
                            isSel && "bg-accent/60",
                          )}
                          style={{ borderLeft: `4px solid ${envColorVar(env.colorIndex)}` }}
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
                            {isDemo && (
                              <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                demo
                              </span>
                            )}{" "}
                            <span className="font-normal text-muted-foreground">
                              {env.clusterName}
                            </span>
                          </button>
                          <EnvTreeStatusDot status={st} />
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {st === "connected" || st === "degraded" ? (
                          <ContextMenuItem onSelect={() => onDisconnect(env.id)}>
                            Desconectar
                          </ContextMenuItem>
                        ) : needsReconnect && onReconnect ? (
                          <ContextMenuItem
                            onSelect={() => onReconnect(env.id)}
                          >
                            Reconectar
                          </ContextMenuItem>
                        ) : (
                          <ContextMenuItem
                            disabled={st === "connecting"}
                            onSelect={() => onConnect(env.id)}
                          >
                            Conectar
                          </ContextMenuItem>
                        )}
                        {!isDemo &&
                          (st === "connected" || st === "degraded") &&
                          onSetKeepAlive && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onSelect={() => {
                                  // Single handler only — dual onClick+onSelect double-toggles (020)
                                  const next = !keepAliveOn(env.id);
                                  onSetKeepAlive(env.id, next);
                                }}
                              >
                                {keepAliveOn(env.id)
                                  ? "No mantener conexión viva"
                                  : "Mantener conexión viva"}
                              </ContextMenuItem>
                            </>
                          )}
                        {!isDemo && (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuItem onSelect={() => onEdit(env)}>
                              Editar configuracion
                            </ContextMenuItem>
                          </>
                        )}
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive"
                          onSelect={() => onDelete(env)}
                        >
                          Eliminar
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    {(st === "connected" || st === "degraded") && (
                      <div
                        className="ml-9 mb-0.5 text-[10px] text-muted-foreground"
                        data-testid={`session-health-${env.id}`}
                      >
                        {st === "connected" && <span>Conectado</span>}
                        {st === "degraded" && <span>Degradado</span>}
                        <span>
                          {" "}
                          · Keep-alive: {keepAliveOn(env.id) ? "ON" : "OFF"}
                        </span>
                      </div>
                    )}
                    {st === "disconnected" &&
                      healthById[env.id]?.status === "disconnected" && (
                        <div
                          className="ml-9 mb-0.5 text-[10px] text-muted-foreground"
                          data-testid={`session-health-${env.id}`}
                        >
                          Desconectado
                          <span>
                            {" "}
                            · Keep-alive: {keepAliveOn(env.id) ? "ON" : "OFF"}
                          </span>
                        </div>
                      )}

                    {isExp && (
                      <ul className="ml-4 space-y-0.5 border-l border-border pl-2">
                        {section(
                          env.id,
                          "deployments",
                          "Deployments",
                          showCatalog,
                          deployments.length === 0 ? (
                            <li className="text-muted-foreground">Sin deployments</li>
                          ) : (
                            deployments.map((d) => (
                              <li key={d.id}>
                                <button
                                  type="button"
                                  className="truncate text-left hover:underline"
                                  onClick={() =>
                                    onOpenDeployment(env.id, d.namespace, d.name)
                                  }
                                >
                                  {d.name}
                                </button>
                              </li>
                            ))
                          ),
                        )}
                        {section(
                          env.id,
                          "pods",
                          "Pods",
                          showCatalog,
                          (() => {
                            const { groups, orphans } =
                              groupPodsByDeployment(pods);
                            if (groups.length === 0 && orphans.length === 0) {
                              return (
                                <li className="text-muted-foreground">
                                  Sin pods
                                </li>
                              );
                            }
                            return (
                              <>
                                {groups.map((g) => (
                                  <li
                                    key={`grp:${g.namespace}/${g.deploymentName}`}
                                  >
                                    <button
                                      type="button"
                                      className="truncate text-left hover:underline"
                                      onClick={() =>
                                        onOpenPod(
                                          env.id,
                                          g.namespace,
                                          g.samplePodName,
                                          g.deploymentName,
                                        )
                                      }
                                    >
                                      {combinedPodLabel(g)}
                                    </button>
                                  </li>
                                ))}
                                {orphans.map((o) => (
                                  <li key={o.id}>
                                    <button
                                      type="button"
                                      className="truncate text-left hover:underline"
                                      onClick={() =>
                                        onOpenPod(env.id, o.namespace, o.podName, null)
                                      }
                                    >
                                      {o.podName}
                                    </button>
                                  </li>
                                ))}
                              </>
                            );
                          })(),
                        )}
                        {section(
                          env.id,
                          "services",
                          "Services",
                          showCatalog,
                          services.length === 0 ? (
                            <li className="text-muted-foreground">Sin services</li>
                          ) : (
                            services.map((s) => (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  className="truncate text-left hover:underline"
                                  onClick={() =>
                                    onOpenService(env.id, s.namespace, s.name)
                                  }
                                >
                                  {s.name}
                                </button>
                              </li>
                            ))
                          ),
                        )}
                        {section(
                          env.id,
                          "configmaps",
                          "ConfigMaps",
                          showCatalog,
                          configMaps.length === 0 ? (
                            <li className="text-muted-foreground">Sin configmaps</li>
                          ) : (
                            configMaps.map((cm) => (
                              <li key={cm.id}>
                                <button
                                  type="button"
                                  className="truncate text-left hover:underline"
                                  onClick={() =>
                                    onOpenConfigMap(env.id, cm.namespace, cm.name)
                                  }
                                >
                                  {cm.name}
                                </button>
                              </li>
                            ))
                          ),
                        )}
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
      <div
        className="env-tree__resize-handle"
        role="separator"
        aria-label="Redimensionar panel de ambientes"
        aria-orientation="vertical"
        onPointerDown={startResize}
      />
    </aside>
  );
}
