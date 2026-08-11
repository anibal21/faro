import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type FaroConf = {
  bundle: {
    targets: string[];
    publisher: string;
    licenseFile: string;
    windows: {
      nsis: {
        languages: string[];
        installMode: string;
        startMenuFolder: string;
        installerHooks?: string;
      };
    };
  };
};

function loadConf(): FaroConf {
  return JSON.parse(
    readFileSync(resolve(__dirname, "../../src-tauri/tauri.conf.json"), "utf8"),
  ) as FaroConf;
}

describe("release bundle conf (026)", () => {
  it("uses currentUser NSIS and required multi-platform targets", () => {
    const config = loadConf();
    expect(config.bundle.windows.nsis.installMode).toBe("currentUser");
    for (const t of ["nsis", "dmg", "appimage", "deb"]) {
      expect(config.bundle.targets).toContain(t);
    }
  });

  it("keeps Spanish NSIS branding and installer hooks with currentUser", () => {
    const config = loadConf();
    expect(config.bundle.publisher).toMatch(/An.bal Rodr.guez/);
    expect(config.bundle.licenseFile).toBe("../LICENSE");
    expect(config.bundle.windows.nsis.languages).toContain("Spanish");
    expect(config.bundle.windows.nsis.startMenuFolder).toBe("Faro");
    expect(config.bundle.windows.nsis.installerHooks).toBe(
      "windows/nsis-hooks.nsh",
    );
    expect(config.bundle.windows.nsis.installMode).toBe("currentUser");
  });
});
