import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("keepalive ACL (020 root cause)", () => {
  it("exposes allow-env-set-keep-alive permission", () => {
    const toml = readFileSync(
      resolve(__dirname, "../../src-tauri/permissions/faro.toml"),
      "utf8",
    );
    expect(toml).toContain("allow-env-set-keep-alive");
    expect(toml).toContain("env_set_keep_alive");
  });

  it("grants allow-env-set-keep-alive on the default capability", () => {
    const json = readFileSync(
      resolve(__dirname, "../../src-tauri/capabilities/default.json"),
      "utf8",
    );
    expect(json).toContain("allow-env-set-keep-alive");
  });
});
