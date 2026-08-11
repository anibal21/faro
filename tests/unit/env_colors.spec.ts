import { describe, expect, it } from "vitest";
import { ENV_COLORS, envColorVar } from "../../src/lib/envColors";

describe("environment colors", () => {
  it("defines ten distinct fixed metallic colors", () => {
    expect(ENV_COLORS).toHaveLength(10);
    expect(new Set(ENV_COLORS).size).toBe(10);
    expect(envColorVar(9)).toBe("var(--env-color-9)");
  });
});
