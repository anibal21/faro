import { describe, expect, it } from "vitest";
import config from "../../src-tauri/tauri.conf.json";

describe("Faro NSIS configuration", () => {
  it("ships Spanish per-machine branding and MIT metadata", () => {
    expect(config.bundle.publisher).toBe("Aníbal Rodríguez");
    expect(config.bundle.licenseFile).toBe("../LICENSE");
    expect(config.bundle.windows.nsis.languages).toContain("Spanish");
    expect(config.bundle.windows.nsis.installMode).toBe("perMachine");
    expect(config.bundle.windows.nsis.startMenuFolder).toBe("Faro");
  });
});

