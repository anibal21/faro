import { useCallback, useEffect, useState } from "react";
import { prefsGet, prefsSet } from "../lib/ipc";

export type ThemeMode = "light" | "dark";

export function useTheme(ready: boolean) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    async function load() {
      try {
        const prefs = await prefsGet();
        const t = prefs.theme === "dark" ? "dark" : "light";
        if (!cancelled) {
          setThemeState(t);
          applyTheme(t);
        }
      } catch {
        applyTheme("light");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const setTheme = useCallback(async (next: ThemeMode) => {
    setThemeState(next);
    applyTheme(next);
    try {
      await prefsSet("theme", next);
    } catch {
      /* prefs may be unavailable outside Tauri */
    }
  }, []);

  return { theme, setTheme };
}

function applyTheme(t: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", t);
  root.classList.toggle("dark", t === "dark");
}
