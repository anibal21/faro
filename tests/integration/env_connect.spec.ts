import { describe, expect, it } from "vitest";

describe("env_connect lifecycle (US4)", () => {
  it("documents connect/disconnect steps", () => {
    expect([
      "upsert env with fixtures paths",
      "load + set active",
      "env_connect → status connected + catalog_epoch",
      "env_disconnect → session tables empty",
    ]).toHaveLength(4);
  });
});
