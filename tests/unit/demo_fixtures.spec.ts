import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("demo fixtures", () => {
  it("contains catalog, YAML, and analyzable log samples", () => {
    const catalog = readFileSync("src-tauri/src/k8s/catalog.rs", "utf8");
    const logs = readFileSync("src-tauri/src/k8s/logs.rs", "utf8");
    expect(catalog).toContain("payments-api");
    expect(catalog).toContain("payments-config");
    expect(catalog).toContain("insert_service");
    expect(logs).toContain("NullPointerException");
  });
});

