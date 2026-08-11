import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MAIN_HEIGHT,
  MAIN_WIDTH,
  SPLASH_HEIGHT,
  SPLASH_WIDTH,
} from "../../src/lib/windowGeometry";

describe("window geometry conf + constants (007)", () => {
  it("tauri.conf starts at compact splash size, fixed, centered", () => {
    const conf = JSON.parse(
      readFileSync(resolve(__dirname, "../../src-tauri/tauri.conf.json"), "utf8"),
    ) as {
      app: {
        windows: Array<{
          width: number;
          height: number;
          resizable: boolean;
          center?: boolean;
          decorations: boolean;
        }>;
      };
    };
    const win = conf.app.windows[0];
    expect(win.width).toBe(576);
    expect(win.height).toBe(324);
    expect(win.resizable).toBe(false);
    expect(win.center).toBe(true);
    expect(win.decorations).toBe(false);
  });

  it("exports product sizes splash 576x324 and main 900x600", () => {
    expect(SPLASH_WIDTH).toBe(576);
    expect(SPLASH_HEIGHT).toBe(324);
    expect(MAIN_WIDTH).toBe(900);
    expect(MAIN_HEIGHT).toBe(600);
  });
});
