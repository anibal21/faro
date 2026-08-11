import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("follow status Spanish (US5)", () => {
  it("emits Spanish status strings from logs.rs", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src-tauri/src/k8s/logs.rs"),
      "utf8",
    );
    expect(src).toContain('"siguiendo"');
    expect(src).toContain('"inactivo"');
    expect(src).not.toMatch(/status:\s*"following"/);
  });

  it("FE localizes legacy English following", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toContain("localizeStatus");
    expect(src).toContain("siguiendo");
  });
});
