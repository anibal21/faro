import type { InstanceCatalog } from "../../src/hooks/useCatalog";

const emptySlice = (): InstanceCatalog => ({
  deployments: [],
  pods: [],
  services: [],
  configMaps: [],
  loading: false,
  error: null,
});

/** Build `catalogByInstance` for EnvTreeNav unit tests. */
export function catalogFor(
  instanceId: string,
  slice: Partial<InstanceCatalog> = {},
): Record<string, InstanceCatalog> {
  return {
    [instanceId]: { ...emptySlice(), ...slice },
  };
}

export function emptyCatalogByInstance(): Record<string, InstanceCatalog> {
  return {};
}
