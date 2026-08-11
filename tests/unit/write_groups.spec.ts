import { describe, expect, it } from "vitest";
import { chunksToWriteGroups } from "../../src/components/logs/StructuredLogView";

describe("write-group aggregation (US7)", () => {
  it("marks ERROR chunks and filters by search", () => {
    const groups = chunksToWriteGroups(
      [
        {
          podName: "api-1",
          text: "INFO ok",
          timestamp: "t1",
        },
        {
          podName: "api-1",
          text: "ERROR NullPointerException",
          timestamp: "t2",
        },
      ],
      "error",
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].marked).toBe(true);
  });
});
