import { LogicalSize } from "@tauri-apps/api/dpi";

/** Splash: compact 16:9, fixed while loading */
export const SPLASH_WIDTH = 576;
export const SPLASH_HEIGHT = 324;

/** Main workspace default after ready */
export const MAIN_WIDTH = 900;
export const MAIN_HEIGHT = 600;

export const WORK_AREA_MARGIN = 48;

export type Size2D = { width: number; height: number };

/** Clamp desired size so it fits inside work area with margin. */
export function clampToWorkArea(
  desired: Size2D,
  workArea: Size2D,
  margin = WORK_AREA_MARGIN,
): Size2D {
  const maxW = Math.max(320, workArea.width - margin * 2);
  const maxH = Math.max(240, workArea.height - margin * 2);
  return {
    width: Math.min(desired.width, maxW),
    height: Math.min(desired.height, maxH),
  };
}

async function withWindow(
  fn: (
    win: Awaited<
      ReturnType<typeof import("@tauri-apps/api/window").getCurrentWindow>
    >,
  ) => void | Promise<void>,
): Promise<void> {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await fn(getCurrentWindow());
  } catch {
    /* browser / vitest */
  }
}

async function workAreaLogical(): Promise<Size2D | null> {
  try {
    const { currentMonitor } = await import("@tauri-apps/api/window");
    const monitor = await currentMonitor();
    if (!monitor) return null;
    const logical = monitor.workArea.size.toLogical(monitor.scaleFactor);
    return { width: logical.width, height: logical.height };
  } catch {
    return null;
  }
}

export async function applySplashWindowGeometry(): Promise<void> {
  await withWindow(async (win) => {
    await win.setSize(new LogicalSize(SPLASH_WIDTH, SPLASH_HEIGHT));
    await win.setResizable(false);
    await win.center();
  });
}

/** Show the main window after splash content is ready (window starts `visible: false`). */
export async function showMainWindow(): Promise<void> {
  await withWindow(async (win) => {
    await win.show();
    await win.setFocus();
  });
}

export async function applyMainWindowGeometry(): Promise<void> {
  await withWindow(async (win) => {
    const area = await workAreaLogical();
    const size = area
      ? clampToWorkArea(
          { width: MAIN_WIDTH, height: MAIN_HEIGHT },
          area,
        )
      : { width: MAIN_WIDTH, height: MAIN_HEIGHT };
    await win.setSize(new LogicalSize(size.width, size.height));
    await win.setMinSize(new LogicalSize(MAIN_WIDTH, MAIN_HEIGHT));
    await win.setResizable(true);
    await win.center();
  });
}
