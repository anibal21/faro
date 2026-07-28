import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("ui chrome polish primary flow (E2E outline)", () => {
  it("wires TitleBar, slim Ambientes, Monitor, splash dwell", () => {
    const app = readFileSync(resolve(__dirname, "../../src/App.tsx"), "utf8");
    const shell = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.tsx"),
      "utf8",
    );
    const menu = readFileSync(
      resolve(__dirname, "../../src/components/chrome/AppMenubar.tsx"),
      "utf8",
    );
    const tree = readFileSync(
      resolve(__dirname, "../../src/components/catalog/EnvTreeNav.tsx"),
      "utf8",
    );
    expect(app).toContain("getSplashMinMs");
    expect(shell).toContain("TitleBar");
    expect(tree).toContain("Monitor");
    expect(menu).toContain("Desconectar todo");
    expect(menu).not.toContain("Cargar ambiente");
  });
});
