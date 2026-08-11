import { describe, expect, it } from "vitest";
import {
  chunksToWriteGroups,
  isNewLogEntry,
  isStackContinuation,
  lightweightMark,
} from "../../src/components/logs/StructuredLogView";

describe("Spring Boot structured grouping", () => {
  it("keeps stacktrace lines in the same write-group", () => {
    const groups = chunksToWriteGroups(
      [
        {
          podName: "pay-0",
          timestamp: "t1",
          text:
            "2024-01-01 10:00:00.001 ERROR c.e.Pay - boom\n" +
            "java.lang.NullPointerException: Cannot invoke method on null\n" +
            "\tat com.example.PaymentService.charge(PaymentService.java:42)\n" +
            "\tat com.example.PaymentController.pay(PaymentController.java:18)\n",
        },
        {
          podName: "pay-0",
          timestamp: "t2",
          text: "2024-01-01 10:00:01.000 INFO  c.e.Pay - ok\n",
        },
      ],
      "",
    );
    expect(groups.length).toBe(2);
    expect(groups[0].text).toContain("NullPointerException");
    expect(groups[0].text).toContain("PaymentService.charge");
    expect(groups[0].marked).toBe(true);
    expect(groups[1].text).toContain("INFO");
    expect(lightweightMark(groups[1].text)).toBe(false);
  });

  it("groups across streamed chunks for one exception", () => {
    const groups = chunksToWriteGroups(
      [
        {
          podName: "a",
          timestamp: "t1",
          text: "2024-01-01 10:00:00.001 ERROR svc - fail\n",
        },
        {
          podName: "a",
          timestamp: "t2",
          text: "java.lang.IllegalStateException: bad\n",
        },
        {
          podName: "a",
          timestamp: "t3",
          text: "\tat com.foo.Bar.baz(Bar.java:9)\n",
        },
      ],
      "",
    );
    expect(groups.length).toBe(1);
    expect(groups[0].text).toContain("IllegalStateException");
    expect(groups[0].text).toContain("com.foo.Bar");
  });

  it("classifies stack continuation vs new entry", () => {
    expect(isStackContinuation("\tat com.foo.Bar.baz(Bar.java:1)")).toBe(true);
    expect(isStackContinuation("Caused by: java.io.IOException")).toBe(true);
    expect(isNewLogEntry("2024-06-01 12:00:00.000 INFO hello")).toBe(true);
    expect(isNewLogEntry("ERROR something")).toBe(true);
    expect(isNewLogEntry("\tat com.foo.Bar.baz(Bar.java:1)")).toBe(false);
  });
});
