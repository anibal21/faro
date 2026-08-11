import { describe, expect, it } from "vitest";

describe("analyze on click (US8)", () => {
  it("asserts no bulk analyze chrome in contract", () => {
    const chrome = ["Structured", "Raw", "FindingPanel"];
    expect(chrome).not.toContain("Analizar-todo");
    expect(chrome).not.toContain("Export");
  });
});
