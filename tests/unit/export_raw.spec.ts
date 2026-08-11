import { describe, expect, it } from "vitest";
import {
  buildConfigMapExport,
  buildRawLogExport,
} from "../../src/lib/fileExport";

describe("export raw / configmap (US6)", () => {
  it("Raw export uses chronological buffer only (no secrets fields)", () => {
    const body = buildRawLogExport([
      { timestamp: "2026-01-01T00:00:00Z", podName: "p1", text: "hello\n" },
      { timestamp: "2026-01-01T00:00:01Z", podName: "p1", text: "world\n" },
    ]);
    expect(body.indexOf("hello")).toBeLessThan(body.indexOf("world"));
    expect(body).not.toMatch(/BEGIN (RSA |OPENSSH )?PRIVATE KEY/);
    expect(body).not.toMatch(/aws_secret_access_key/i);
    expect(body).not.toMatch(/Bearer /);
  });

  it("ConfigMap serialization marks binary and empty entries list is empty-ish", () => {
    expect(buildConfigMapExport("cm", "ns", [])).toContain("# ConfigMap ns/cm");
    const body = buildConfigMapExport("cm", "ns", [
      {
        keyName: "cfg",
        valueText: "a: 1",
        isBinary: false,
        isTruncated: false,
      },
      {
        keyName: "secret.bin",
        valueText: "SHOULD_NOT_APPEAR",
        isBinary: true,
        isTruncated: false,
      },
    ]);
    expect(body).toContain("a: 1");
    expect(body).not.toContain("SHOULD_NOT_APPEAR");
    expect(body).toContain("binario");
  });
});
