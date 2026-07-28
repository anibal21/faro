import { useEffect, useState } from "react";
import { sessionPurgeEphemeral } from "./lib/ipc";
import { getSplashMinMs, sleep } from "./lib/splashDwell";
import {
  applyMainWindowGeometry,
  applySplashWindowGeometry,
} from "./lib/windowGeometry";
import { useEnvironments } from "./hooks/useEnvironments";
import { useActiveEnvironment } from "./hooks/useActiveEnvironment";
import { useConnection } from "./hooks/useConnection";
import { useCatalog } from "./hooks/useCatalog";
import { useConfigMaps } from "./hooks/useConfigMaps";
import { useWorkspaceTabs } from "./hooks/useWorkspaceTabs";
import { useTheme } from "./hooks/useTheme";
import { SplashView } from "./views/SplashView";
import { MainShell } from "./views/MainShell";
import "./styles/theme.css";
import "./styles/workspace.css";

type Phase = "splash" | "ready" | "error";

function App() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [bootError, setBootError] = useState<string | null>(null);
  const ready = phase === "ready";
  const { environments, error: crudError, upsert, refresh } =
    useEnvironments(ready);
  const {
    loaded,
    active,
    liveGeneration,
    error: wsError,
    refresh: refreshWs,
    setActive,
  } = useActiveEnvironment(environments, ready);
  const connection = useConnection(active?.id ?? null);
  const catalog = useCatalog(connection.connected, liveGeneration);
  const configMaps = useConfigMaps(connection.connected, liveGeneration);
  const workspace = useWorkspaceTabs(liveGeneration);
  const { theme, setTheme } = useTheme(ready);

  useEffect(() => {
    void applySplashWindowGeometry();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const started = Date.now();
      try {
        await sessionPurgeEphemeral();
        const elapsed = Date.now() - started;
        const remain = Math.max(0, getSplashMinMs() - elapsed);
        if (remain > 0) await sleep(remain);
        if (cancelled) return;
        await applyMainWindowGeometry();
        if (!cancelled) setPhase("ready");
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : String(e));
          setPhase("error");
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      void refresh();
      void refreshWs();
    }
  }, [ready, refresh, refreshWs]);

  if (phase === "splash" || phase === "error") {
    return (
      <SplashView error={phase === "error" ? bootError : null} />
    );
  }

  return (
    <MainShell
      environments={environments}
      loaded={loaded}
      activeId={active?.id ?? null}
      liveGeneration={liveGeneration}
      connection={connection}
      catalog={catalog}
      configMaps={configMaps}
      workspace={workspace}
      theme={theme}
      onTheme={(t) => {
        void setTheme(t);
      }}
      error={crudError ?? wsError}
      onUpsert={async (payload) => {
        await upsert(payload);
      }}
      onSetActive={async (id) => {
        await setActive(id);
      }}
    />
  );
}

export default App;
