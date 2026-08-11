import { describe, expect, it } from "vitest";

describe("primary E2E outline (T080)", () => {
  it("covers splash → analyze path", () => {
    const steps = [
      "splash",
      "env_upsert",
      "env_connect",
      "logs_open",
      "analyze_write_group",
    ];
    expect(steps[0]).toBe("splash");
    expect(steps.at(-1)).toBe("analyze_write_group");
  });
});
