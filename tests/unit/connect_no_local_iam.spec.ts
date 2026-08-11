import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("connect no local IAM wiring", () => {
  it("connect.rs wires bastion describe before tunnel", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    expect(src).toContain("describe_cluster_endpoint_via_bastion");
    const describeIdx = src.indexOf("describe_cluster_endpoint_via_bastion");
    const tunnelIdx = src.indexOf("open_tunnel");
    expect(describeIdx).toBeLessThan(tunnelIdx);
  });
});
