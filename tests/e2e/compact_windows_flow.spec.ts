import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("compact fixed windows primary flow (E2E outline)", () => {
  it("wires splash conf, geometry helper, and App applyMain before ready", () => {
    const conf = JSON.parse(
      readFileSync(resolve(__dirname, "../../src-tauri/tauri.conf.json"), "utf8"),
    ) as {
      app: { windows: Array<{ width: number; height: number }> };
    };
    const app = readFileSync(resolve(__dirname, "../../src/App.tsx"), "utf8");
    const geo = readFileSync(
      resolve(__dirname, "../../src/lib/windowGeometry.ts"),
      "utf8",
    );
    const caps = readFileSync(
      resolve(__dirname, "../../src-tauri/capabilities/default.json"),
      "utf8",
    );

    expect(conf.app.windows[0].width).toBe(576);
    expect(conf.app.windows[0].height).toBe(324);
    expect(geo).toContain("MAIN_WIDTH = 900");
    expect(geo).toContain("MAIN_HEIGHT = 600");
    expect(app).toContain("applySplashWindowGeometry");
    expect(app).toContain("applyMainWindowGeometry");
    expect(app).toContain("getSplashMinMs");
    expect(caps).toContain("core:window:allow-set-size");
    expect(caps).toContain("core:window:allow-center");
  });
});
