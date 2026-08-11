import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("bundle icons (006 US3)", () => {
  it("every bundle.icon path exists under src-tauri", () => {
    const confPath = resolve(__dirname, "../../src-tauri/tauri.conf.json");
    const conf = JSON.parse(readFileSync(confPath, "utf8")) as {
      bundle: { icon: string[] };
    };
    expect(conf.bundle.icon.length).toBeGreaterThan(0);
    for (const rel of conf.bundle.icon) {
      const abs = resolve(__dirname, "../../src-tauri", rel);
      expect(existsSync(abs), `missing icon: ${rel}`).toBe(true);
    }
  });
});
