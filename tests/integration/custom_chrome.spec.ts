import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("custom chrome (US3)", () => {
  it("disables OS decorations and mounts TitleBar", () => {
    const conf = readFileSync(
      resolve(__dirname, "../../src-tauri/tauri.conf.json"),
      "utf8",
    );
    expect(conf).toMatch(/"decorations"\s*:\s*false/);
    const shell = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.tsx"),
      "utf8",
    );
    expect(shell).toContain("TitleBar");
  });
});
