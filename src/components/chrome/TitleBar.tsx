import { useCallback, useEffect, useState } from "react";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TitleBarProps = {
  title?: string;
  className?: string;
};

export function TitleBar({ title = "Faro", className }: TitleBarProps) {
  const [maximized, setMaximized] = useState(false);

  const withWindow = useCallback(async (fn: (win: Awaited<ReturnType<typeof import("@tauri-apps/api/window").getCurrentWindow>>) => void | Promise<void>) => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      await fn(win);
    } catch {
      /* browser / tests */
    }
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        setMaximized(await win.isMaximized());
        unlisten = await win.onResized(async () => {
          setMaximized(await win.isMaximized());
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <header
      className={cn(
        "flex h-8 shrink-0 items-center border-b border-border bg-card text-[13px] text-foreground select-none",
        className,
      )}
      data-tauri-drag-region
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2 px-3"
        data-tauri-drag-region
      >
        <span className="truncate font-semibold" data-tauri-drag-region>
          {title}
        </span>
      </div>
      <div className="flex h-full shrink-0">
        <button
          type="button"
          aria-label="Minimizar"
          className="flex h-full w-11 items-center justify-center hover:bg-accent"
          onClick={() => void withWindow((w) => w.minimize())}
        >
          <Minus className="size-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label={maximized ? "Restaurar" : "Maximizar"}
          className="flex h-full w-11 items-center justify-center hover:bg-accent"
          onClick={() =>
            void withWindow(async (w) => {
              await w.toggleMaximize();
              setMaximized(await w.isMaximized());
            })
          }
        >
          <Square className="size-3" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Cerrar"
          className="flex h-full w-11 items-center justify-center hover:bg-destructive hover:text-white"
          onClick={() => void withWindow((w) => w.close())}
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
