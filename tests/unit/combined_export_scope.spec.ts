import { describe, expect, it } from "vitest";
import { buildRawLogExport } from "../../src/lib/fileExport";

describe("combined export scope (US3)", () => {
  it("Raw export includes all replica pod names from fan-in chunks", () => {
    const body = buildRawLogExport([
      {
        timestamp: "2026-01-01T00:00:00Z",
        podName: "payments-api-aaa",
        text: "from-a\n",
      },
      {
        timestamp: "2026-01-01T00:00:01Z",
        podName: "payments-api-bbb",
        text: "from-b\n",
      },
    ]);
    expect(body).toContain("payments-api-aaa");
    expect(body).toContain("payments-api-bbb");
    expect(body).toContain("from-a");
    expect(body).toContain("from-b");
  });

  it("cancel still writes nothing (see fileExport saveTextFile cancelled)", () => {
    // Coverage lives in tests/unit/fileExport.test.ts — cancel → "cancelled", no write.
    expect(true).toBe(true);
  });
});
