import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getSplashMinMs, sleep } from "../../src/lib/splashDwell";

describe("splash dwell (US4)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    delete (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS;
    vi.useRealTimers();
  });

  it("defaults to 5000ms and respects test override", () => {
    expect(getSplashMinMs()).toBe(5000);
    (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS = 0;
    expect(getSplashMinMs()).toBe(0);
  });

  it("sleep resolves after duration", async () => {
    const p = sleep(100);
    await vi.advanceTimersByTimeAsync(100);
    await p;
  });
});
