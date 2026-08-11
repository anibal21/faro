/**
 * Save UTF-8 text via native save dialog + Rust write.
 * Cancel → cancelled (no write).
 */

import { invokeCommand } from "./ipc";

export type SaveTextFn = (
  defaultPath: string,
  contents: string,
) => Promise<"saved" | "cancelled">;

async function defaultSaveTextFile(
  defaultPath: string,
  contents: string,
): Promise<"saved" | "cancelled"> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const path = await save({
    defaultPath,
    filters: [{ name: "Text", extensions: ["txt"] }],
  });
  if (path === null) {
    return "cancelled";
  }
  await invokeCommand("export_write_text", { path, contents });
  return "saved";
}

let saveImpl: SaveTextFn = defaultSaveTextFile;

/** Test-only: replace or restore the saver. */
export function setSaveTextFileForTests(fn: SaveTextFn | null): void {
  saveImpl = fn ?? defaultSaveTextFile;
}

export async function saveTextFile(
  defaultPath: string,
  contents: string,
): Promise<"saved" | "cancelled"> {
  return saveImpl(defaultPath, contents);
}

/** Build Raw export body from log chunks (chronological). */
export function buildRawLogExport(
  chunks: { timestamp: string; podName: string; text: string }[],
): string {
  return chunks.map((c) => `${c.timestamp} ${c.podName} ${c.text}`).join("");
}

/** Build ConfigMap export body (readable keys only). */
export function buildConfigMapExport(
  name: string,
  namespace: string,
  entries: {
    keyName: string;
    valueText?: string | null;
    isBinary: boolean;
    isTruncated: boolean;
  }[],
): string {
  const lines = [`# ConfigMap ${namespace}/${name}`, ""];
  for (const e of entries) {
    lines.push(`## ${e.keyName}`);
    if (e.isBinary) {
      lines.push("(binario — omitido)");
    } else {
      lines.push(e.valueText ?? "");
      if (e.isTruncated) lines.push("…(truncado)");
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Page through older history until exhausted, cancelled, or max pages. */
export async function exhaustLogHistory(options: {
  maxPages?: number;
  isCancelled: () => boolean;
  loadPage: () => Promise<"more" | "exhausted" | "error" | "skipped">;
  onProgress?: (page: number) => void;
}): Promise<"exhausted" | "cancelled" | "error"> {
  const max = options.maxPages ?? 200;
  for (let page = 1; page <= max; page++) {
    if (options.isCancelled()) return "cancelled";
    options.onProgress?.(page);
    const result = await options.loadPage();
    if (options.isCancelled()) return "cancelled";
    if (result === "exhausted") return "exhausted";
    if (result === "error") return "error";
    if (result === "skipped") {
      await new Promise((r) => setTimeout(r, 30));
      page -= 1;
      continue;
    }
  }
  return "exhausted";
}
