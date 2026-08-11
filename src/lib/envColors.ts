/** Bright metallic env colors — identical in light and dark themes (024). */

export const ENV_COLORS = [
  "#ff5c7a", // rose metal
  "#ff8f4a", // copper
  "#ffc857", // gold
  "#2ee6a6", // emerald chrome
  "#1bb8d1", // teal steel
  "#4cc9f0", // cyan metal
  "#5b6cff", // cobalt
  "#9b5cff", // violet metal
  "#f72585", // magenta chrome
  "#c4c9d4", // titanium silver
] as const;

export type EnvColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function normalizeEnvColorIndex(value: number | null | undefined): EnvColorIndex {
  return Math.min(9, Math.max(0, Math.trunc(value ?? 0))) as EnvColorIndex;
}

export function envColorHex(value: number | null | undefined): string {
  return ENV_COLORS[normalizeEnvColorIndex(value)];
}

export function envColorVar(value: number | null | undefined): string {
  return `var(--env-color-${normalizeEnvColorIndex(value)})`;
}
