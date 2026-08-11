import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Fixture mirrors contracts/latest-json-multiplatform.md (deb is NOT in platforms).
 */
const FIXTURE = resolve(
  __dirname,
  "../fixtures/latest-json-multiplatform.example.json",
);

describe("latest.json multiplatform (026 US2)", () => {
  it("includes windows/darwin/linux x86_64 with url+signature; no source zip URLs", () => {
    const feed = JSON.parse(readFileSync(FIXTURE, "utf8")) as {
      version: string;
      platforms: Record<string, { url: string; signature: string }>;
    };

    expect(feed.version).toMatch(/^\d+\.\d+\.\d+/);
    for (const key of ["windows-x86_64", "darwin-x86_64", "linux-x86_64"]) {
      expect(feed.platforms[key]?.url).toMatch(/^https:\/\//);
      expect(feed.platforms[key]?.signature.length).toBeGreaterThan(10);
      expect(feed.platforms[key].url).not.toMatch(/Source%20code|\/archive\//i);
    }
    expect(feed.platforms["windows-x86_64"].url).toMatch(/setup\.exe$/i);
    expect(feed.platforms["linux-x86_64"].url).toMatch(/\.AppImage$/i);
    expect(Object.keys(feed.platforms)).not.toContain("linux-deb");
  });
});
