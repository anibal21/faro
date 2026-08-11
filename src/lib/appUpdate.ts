import { invokeCommand, listenEvent } from "./ipc";

export type UpdateCheckStatus = "upToDate" | "available" | "unavailable";

export type UpdateCheckResult = {
  status: UpdateCheckStatus;
  current: string;
  available?: string | null;
  notes?: string | null;
  canInstall: boolean;
};

export type UpdateDownloadProgress = {
  downloaded: number;
  contentLength?: number | null;
  percent?: number | null;
};

export async function updateCheck(): Promise<UpdateCheckResult> {
  return invokeCommand<UpdateCheckResult>("update_check");
}

export async function updateInstall(): Promise<void> {
  return invokeCommand<void>("update_install");
}

export function listenUpdateDownloadProgress(
  handler: (payload: UpdateDownloadProgress) => void,
): Promise<() => void> {
  return listenEvent<UpdateDownloadProgress>("update_download_progress", handler);
}
