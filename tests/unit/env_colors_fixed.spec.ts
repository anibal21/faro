import { describe, expect, it } from "vitest";
import { ENV_COLORS, envColorHex, envColorVar } from "../../src/lib/envColors";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("env colors fixed (024)", () => {
  it("defines ten distinct metallic hexes", () => {
    expect(ENV_COLORS).toHaveLength(10);
    expect(new Set(ENV_COLORS).size).toBe(10);
    expect(envColorHex(0)).toBe(ENV_COLORS[0]);
    expect(envColorVar(9)).toBe("var(--env-color-9)");
  });

  it("uses the same --env-color-* values in light and dark CSS", () => {
    const css = readFileSync(resolve(__dirname, "../../src/index.css"), "utf8");
    for (let i = 0; i < 10; i++) {
      const re = new RegExp(`--env-color-${i}:\\s*(#[0-9a-fA-F]{6})`, "g");
      const matches = [...css.matchAll(re)].map((m) => m[1]);
      expect(matches.length).toBeGreaterThanOrEqual(2);
      expect(new Set(matches).size).toBe(1);
      expect(matches[0]).toBe(ENV_COLORS[i]);
    }
  });
});
