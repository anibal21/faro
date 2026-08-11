import { describe, expect, it } from "vitest";
import { MAIN_HEIGHT, MAIN_WIDTH } from "../../src/lib/windowGeometry";

describe("main window minimum", () => {
  it("stays at 900×600", () => {
    expect([MAIN_WIDTH, MAIN_HEIGHT]).toEqual([900, 600]);
  });
});

