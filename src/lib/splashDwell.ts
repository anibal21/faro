/** Minimum splash dwell (ms). Override in tests via window.__FARO_SPLASH_MIN_MS */
export function getSplashMinMs(): number {
  if (typeof window !== "undefined") {
    const w = window as Window & { __FARO_SPLASH_MIN_MS?: number };
    if (typeof w.__FARO_SPLASH_MIN_MS === "number" && w.__FARO_SPLASH_MIN_MS >= 0) {
      return w.__FARO_SPLASH_MIN_MS;
    }
  }
  return 5000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
