/** Resolve desktop app version for Monitor rail footer. */
export async function getAppVersionDisplay(): Promise<string> {
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    const v = await getVersion();
    if (v && String(v).trim()) return `v${v}`;
  } catch {
    /* outside Tauri / tests */
  }
  return "v?";
}
