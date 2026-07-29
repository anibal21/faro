import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("live connect branch (008)", () => {
  it("connect branches demo vs live without demo hydrate on live", () => {
    const connect = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    expect(connect).toContain("is_builtin_demo");
    expect(connect).toContain("hydrate_demo_catalog");
    expect(connect).toContain("hydrate_live_catalog");
    expect(connect).toContain("mint_eks_token");
    // live error path closes tunnel
    expect(connect).toContain("close_tunnel");
  });
});
