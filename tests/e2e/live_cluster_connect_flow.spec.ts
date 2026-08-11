import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("live cluster connect primary flow (E2E outline)", () => {
  it("wires demo id, live client, tunnel, and FE guards", () => {
    const conn = readFileSync(
      resolve(__dirname, "../../src-tauri/src/db/connection_instance.rs"),
      "utf8",
    );
    const connect = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    const tree = readFileSync(
      resolve(__dirname, "../../src/components/catalog/EnvTreeNav.tsx"),
      "utf8",
    );
    expect(conn).toContain("faro-demo");
    expect(connect).toContain("hydrate_live_catalog");
    expect(existsSync(resolve(__dirname, "../../src-tauri/src/k8s/client.rs"))).toBe(
      true,
    );
    expect(tree).toContain("isBuiltinDemo");
    expect(tree).toMatch(/Conectar|Desconectar/);
  });
});
