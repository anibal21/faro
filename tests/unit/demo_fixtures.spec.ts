import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("demo fixtures", () => {
  it("ships tracked demo.pem placeholder", () => {
    expect(existsSync("fixtures/demo.pem")).toBe(true);
  });

  it("contains rich catalog, YAML, and analyzable log samples", () => {
    const catalog = readFileSync("src-tauri/src/k8s/catalog.rs", "utf8");
    const logs = readFileSync("src-tauri/src/k8s/logs.rs", "utf8");
    const connect = readFileSync("src-tauri/src/commands/connect.rs", "utf8");

    expect(catalog).toContain("payments-api");
    expect(catalog).toContain("payments-worker");
    expect(catalog).toContain("payments-config");
    expect(catalog).toContain("payments-secrets");
    expect(catalog).toContain("payments-worker-1");
    expect((catalog.match(/insert_service\(/g) ?? []).length).toBeGreaterThanOrEqual(
      2,
    );
    expect((catalog.match(/insert_configmap\(/g) ?? []).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(catalog).toMatch(/"payments-api",\s*\n\s*2,\s*\n\s*2,/);
    expect(catalog).toMatch(/"payments-worker",\s*\n\s*2,\s*\n\s*2,/);

    expect(logs).toContain("NullPointerException");
    expect(logs).toContain('format!("{deployment}-bbb")');
    expect(logs).not.toMatch(/start_demo_follow[\s\S]*-ccc/);

    expect(connect).toContain("resolve_demo_fixture_paths");
    expect(connect).toContain("resource_dir");
  });
});
