/**
 * Native file path picker for environment PEM / IAM fields.
 * Returns absolute path, null on cancel, or throws when the dialog is unavailable.
 * Never reads file contents — path string only.
 */

export type PathPickerFn = () => Promise<string | null>;

async function defaultOpenPathPicker(): Promise<string | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    multiple: false,
    directory: false,
  });
  if (selected === null) {
    return null;
  }
  if (Array.isArray(selected)) {
    return selected[0] ?? null;
  }
  return selected;
}

let pathPickerImpl: PathPickerFn = defaultOpenPathPicker;

/** Test-only: replace or restore the native picker. */
export function setPathPickerForTests(fn: PathPickerFn | null): void {
  pathPickerImpl = fn ?? defaultOpenPathPicker;
}

export async function openPathPicker(): Promise<string | null> {
  return pathPickerImpl();
}
