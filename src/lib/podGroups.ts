import type { FlatPodRow } from "./ipc";

const UNASSIGNED = "__unassigned__";

export type CombinedReplicaGroup = {
  namespace: string;
  deploymentName: string;
  replicaCount: number;
  memberPodNames: string[];
  samplePodName: string;
};

export type OrphanPodEntry = {
  namespace: string;
  podName: string;
  id: string;
  phase: string;
};

export type PodMenuModel = {
  groups: CombinedReplicaGroup[];
  orphans: OrphanPodEntry[];
};

function ownerKey(p: FlatPodRow): string | null {
  const d = p.deploymentName?.trim();
  if (!d || d === UNASSIGNED) return null;
  return `${p.namespace}\0${d}`;
}

/** Group catalog pods into Deployment combined rows + orphan singles. */
export function groupPodsByDeployment(pods: FlatPodRow[]): PodMenuModel {
  const map = new Map<string, CombinedReplicaGroup>();
  const orphans: OrphanPodEntry[] = [];

  for (const p of pods) {
    const key = ownerKey(p);
    if (!key) {
      orphans.push({
        namespace: p.namespace,
        podName: p.podName,
        id: p.id,
        phase: p.phase,
      });
      continue;
    }
    const existing = map.get(key);
    if (existing) {
      existing.memberPodNames.push(p.podName);
      existing.replicaCount = existing.memberPodNames.length;
    } else {
      map.set(key, {
        namespace: p.namespace,
        deploymentName: p.deploymentName!.trim(),
        replicaCount: 1,
        memberPodNames: [p.podName],
        samplePodName: p.podName,
      });
    }
  }

  const groups = [...map.values()].sort((a, b) => {
    const ns = a.namespace.localeCompare(b.namespace);
    if (ns !== 0) return ns;
    return a.deploymentName.localeCompare(b.deploymentName);
  });
  orphans.sort((a, b) => {
    const ns = a.namespace.localeCompare(b.namespace);
    if (ns !== 0) return ns;
    return a.podName.localeCompare(b.podName);
  });

  return { groups, orphans };
}

export function combinedPodLabel(g: CombinedReplicaGroup): string {
  return `${g.deploymentName} (${g.replicaCount})`;
}
