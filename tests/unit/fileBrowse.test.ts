import { afterEach, describe, expect, it, vi } from "vitest";
import { openPathPicker, setPathPickerForTests } from "../../src/lib/fileBrowse";

describe("fileBrowse openPathPicker", () => {
  afterEach(() => {
    setPathPickerForTests(null);
  });

  it("returns absolute path when picker selects a file", async () => {
    setPathPickerForTests(async () => "C:\\keys\\live.pem");
    await expect(openPathPicker()).resolves.toBe("C:\\keys\\live.pem");
  });

  it("returns null on cancel", async () => {
    setPathPickerForTests(async () => null);
    await expect(openPathPicker()).resolves.toBeNull();
  });

  it("propagates picker failure", async () => {
    setPathPickerForTests(async () => {
      throw new Error("dialog unavailable");
    });
    await expect(openPathPicker()).rejects.toThrow(/unavailable/i);
  });
});
