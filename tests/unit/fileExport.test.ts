import { describe, expect, it, vi } from "vitest";
import {
  buildConfigMapExport,
  buildRawLogExport,
  saveTextFile,
  setSaveTextFileForTests,
} from "../../src/lib/fileExport";

describe("fileExport", () => {
  it("buildRawLogExport joins chronological chunks", () => {
    const text = buildRawLogExport([
      { timestamp: "t1", podName: "p", text: "a\n" },
      { timestamp: "t2", podName: "p", text: "b\n" },
    ]);
    expect(text).toContain("t1 p a");
    expect(text).toContain("t2 p b");
  });

  it("buildConfigMapExport skips binary bodies", () => {
    const text = buildConfigMapExport("cm", "ns", [
      { keyName: "app.yml", valueText: "x: 1", isBinary: false, isTruncated: false },
      { keyName: "bin", valueText: null, isBinary: true, isTruncated: false },
    ]);
    expect(text).toContain("app.yml");
    expect(text).toContain("x: 1");
    expect(text).toContain("binario");
  });

  it("saveTextFile maps cancel vs saved via inject", async () => {
    setSaveTextFileForTests(async () => "cancelled");
    expect(await saveTextFile("a.txt", "hi")).toBe("cancelled");
    setSaveTextFileForTests(async () => "saved");
    expect(await saveTextFile("a.txt", "hi")).toBe("saved");
    setSaveTextFileForTests(null);
  });
});
