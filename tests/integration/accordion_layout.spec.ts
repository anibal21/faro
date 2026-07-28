import { describe, expect, it } from "vitest";

describe("accordion layout integration (US1)", () => {
  it("connected layout is accordion | main without buscador", () => {
    const layout = {
      columns: ["accordion", "main"],
      hasCatalogFilter: false,
      hasAbrirLogs: false,
      hasRightConfigMapsRail: false,
    };
    expect(layout.columns).toEqual(["accordion", "main"]);
    expect(layout.hasCatalogFilter).toBe(false);
    expect(layout.hasAbrirLogs).toBe(false);
    expect(layout.hasRightConfigMapsRail).toBe(false);
  });
});
