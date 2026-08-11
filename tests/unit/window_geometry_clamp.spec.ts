import { describe, expect, it } from "vitest";
import { clampToWorkArea } from "../../src/lib/windowGeometry";

describe("clampToWorkArea (007)", () => {
  it("keeps desired size when it fits", () => {
    expect(
      clampToWorkArea(
        { width: 900, height: 600 },
        { width: 1920, height: 1080 },
        48,
      ),
    ).toEqual({ width: 900, height: 600 });
  });

  it("clamps to work area minus margin on small laptops", () => {
    const result = clampToWorkArea(
      { width: 900, height: 600 },
      { width: 1366, height: 728 },
      48,
    );
    expect(result.width).toBeLessThanOrEqual(1366 - 96);
    expect(result.height).toBeLessThanOrEqual(728 - 96);
    expect(result.width).toBe(900);
    expect(result.height).toBe(600);
  });

  it("never exceeds tiny work areas", () => {
    const result = clampToWorkArea(
      { width: 900, height: 600 },
      { width: 800, height: 500 },
      48,
    );
    expect(result.width).toBe(800 - 96);
    expect(result.height).toBe(500 - 96);
  });
});
