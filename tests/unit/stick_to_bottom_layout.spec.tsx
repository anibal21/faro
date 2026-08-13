import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("stick to bottom layout (024)", () => {
  it("keeps Pegar al final as a right-aligned compact group", () => {
    const tsx = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    const css = readFileSync(
      resolve(__dirname, "../../src/styles/workspace.css"),
      "utf8",
    );
    expect(tsx).toContain('className="log-window__stick"');
    expect(tsx).toContain("Pegar al final");
    expect(css).toMatch(/\.log-window__stick\s*\{[^}]*margin-left:\s*auto/s);
    expect(css).toMatch(/\.log-window__stick\s*\{[^}]*gap:\s*0\.35rem/s);
    // Search field flex must not apply to the stick checkbox (was causing a huge gap)
    expect(css).toMatch(
      /\.log-window__toolbar\s+input\[type=["']search["']\]\s*\{[^}]*flex:\s*1/s,
    );
    expect(css).toMatch(/\.log-window__stick\s+input\s*\{[^}]*flex:\s*0\s+0\s+auto/s);
  });
});
