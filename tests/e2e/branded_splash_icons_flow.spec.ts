import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("branded splash + icons primary flow (E2E outline)", () => {
  it("wires splash asset, no title overlay, dwell gate, window size, icons", () => {
    const splashView = readFileSync(
      resolve(__dirname, "../../src/views/SplashView.tsx"),
      "utf8",
    );
    const app = readFileSync(resolve(__dirname, "../../src/App.tsx"), "utf8");
    const conf = JSON.parse(
      readFileSync(resolve(__dirname, "../../src-tauri/tauri.conf.json"), "utf8"),
    ) as {
      app: { windows: Array<{ width: number; height: number }> };
      bundle: { icon: string[] };
    };

    expect(existsSync(resolve(__dirname, "../../src/assets/splash-load.png"))).toBe(
      true,
    );
    expect(splashView).toContain("splash-load.png");
    expect(splashView).not.toContain("splash__brand");
    expect(splashView).not.toContain("splash__tagline");
    expect(app).toContain("getSplashMinMs");
    // Window size owned by 007 (compact splash); icons still from 006
    expect(conf.app.windows[0].width).toBe(576);
    expect(conf.app.windows[0].height).toBe(324);
    for (const rel of conf.bundle.icon) {
      expect(existsSync(resolve(__dirname, "../../src-tauri", rel))).toBe(true);
    }
  });
});
