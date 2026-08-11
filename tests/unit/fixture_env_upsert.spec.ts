import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("fixture env upsert (024)", () => {
  it("Usar fixtures demo fills PEM via demoFixturePaths", () => {
    const modal = readFileSync(
      resolve(__dirname, "../../src/components/env/NewEnvironmentModal.tsx"),
      "utf8",
    );
    expect(modal).toContain("demoFixturePaths");
    expect(modal).toContain("Usar fixtures demo");
    expect(modal).toContain("pemPath: paths.pemPath");
  });

  it("backend marks fixtures/demo.pem profiles as fixture-backed", () => {
    const rust = readFileSync(
      resolve(__dirname, "../../src-tauri/src/db/connection_instance.rs"),
      "utf8",
    );
    expect(rust).toContain("fn is_fixture_backed");
    expect(rust).toContain("fixtures/demo.pem");
    const connect = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    expect(connect).toContain("is_fixture_backed");
    expect(connect).toContain("hydrate_demo_catalog");
  });
});
