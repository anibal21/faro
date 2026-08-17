import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Faro NSIS configuration", () => {
  it("ships Spanish current-user branding and MIT metadata", () => {
    const config = JSON.parse(
      readFileSync(resolve(__dirname, "../../src-tauri/tauri.conf.json"), "utf8"),
    ) as {
      bundle: {
        publisher: string;
        licenseFile: string;
        windows: {
          nsis: {
            languages: string[];
            installMode: string;
            startMenuFolder: string;
          };
        };
      };
    };
    expect(config.bundle.publisher).toMatch(/An.bal Rodr.guez/);
    expect(config.bundle.licenseFile).toBe("../LICENSE");
    expect(config.bundle.windows.nsis.languages).toContain("Spanish");
    expect(config.bundle.windows.nsis.installMode).toBe("currentUser");
    expect(config.bundle.windows.nsis.startMenuFolder).toBe("Faro");
  });
});

