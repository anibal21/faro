import { describe, expect, it } from "vitest";
import {
  clampSidebarWidth,
  SIDEBAR_DEFAULT_WIDTH,
} from "../../src/lib/sidebarWidth";

describe("sidebar width", () => {
  it("clamps to 200–360 and defaults invalid values", () => {
    expect(clampSidebarWidth(100)).toBe(200);
    expect(clampSidebarWidth(240)).toBe(240);
    expect(clampSidebarWidth(500)).toBe(360);
    expect(clampSidebarWidth(Number.NaN)).toBe(SIDEBAR_DEFAULT_WIDTH);
  });
});

