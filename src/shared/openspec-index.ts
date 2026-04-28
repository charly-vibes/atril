import type { GitHubTreeEntry } from "./github-api";

export interface OpenSpecIndex {
  /** Capability names found in openspec/specs/ */
  capabilities: string[];
  /** Active change IDs in openspec/changes/ (excluding archive) */
  changes: string[];
  /** Archived change IDs in openspec/changes/archive/ */
  archivedChanges: string[];
  /** change-id → list of capability names with delta specs */
  changeAffects: Record<string, string[]>;
  /** capability-name → list of change-ids that affect it */
  capabilityAffectedBy: Record<string, string[]>;
  /** change-id → list of new capabilities introduced (not in specs/) */
  changeIntroduces: Record<string, string[]>;
  /** capability-name → list of file paths */
  capabilityFiles: Record<string, string[]>;
  /** change-id → list of file paths */
  changeFiles: Record<string, string[]>;
}

const SPEC_PREFIX = "openspec/specs/";
const CHANGE_PREFIX = "openspec/changes/";
const ARCHIVE_PREFIX = "openspec/changes/archive/";

function getCapabilityName(path: string): string | undefined {
  const match = path.match(/^openspec\/specs\/([^/]+)\//);
  return match?.[1];
}

function getArchivedChangeId(path: string): string | undefined {
  const match = path.match(/^openspec\/changes\/archive\/([^/]+)\//);
  return match?.[1];
}

function getActiveChangePathInfo(path: string): { changeId: string; capability?: string } | undefined {
  const match = path.match(/^openspec\/changes\/([^/]+)\/(?:specs\/([^/]+)\/.*)?/);
  if (!match) return undefined;
  if (path.startsWith(ARCHIVE_PREFIX)) return undefined;
  return { changeId: match[1]!, capability: match[2] };
}

/**
 * Build an index of OpenSpec artifacts from a repository tree.
 * Pure function — works entirely from tree entries without API calls.
 */
export function buildOpenSpecIndex(entries: GitHubTreeEntry[]): OpenSpecIndex {
  const capabilitySet = new Set<string>();
  const changeSet = new Set<string>();
  const archivedSet = new Set<string>();
  const changeAffects: Record<string, string[]> = {};
  const capabilityAffectedBy: Record<string, string[]> = {};
  const changeIntroduces: Record<string, string[]> = {};
  const capabilityFiles: Record<string, string[]> = {};
  const changeFiles: Record<string, string[]> = {};

  // Delta spec paths: changes/<change-id>/specs/<capability>/
  const deltaSpecs: { changeId: string; capability: string }[] = [];

  for (const entry of entries) {
    if (entry.type !== "blob") continue;

    const capabilityName = getCapabilityName(entry.path);
    if (capabilityName) {
      capabilitySet.add(capabilityName);
      (capabilityFiles[capabilityName] ??= []).push(entry.path);
      continue;
    }

    const archivedChangeId = getArchivedChangeId(entry.path);
    if (archivedChangeId) {
      archivedSet.add(archivedChangeId);
      continue;
    }

    const activeChange = getActiveChangePathInfo(entry.path);
    if (activeChange) {
      changeSet.add(activeChange.changeId);
      (changeFiles[activeChange.changeId] ??= []).push(entry.path);
      if (activeChange.capability) {
        deltaSpecs.push({ changeId: activeChange.changeId, capability: activeChange.capability });
      }
      continue;
    }
  }

  // Build cross-reference maps from delta specs
  for (const { changeId, capability } of deltaSpecs) {
    const affects = (changeAffects[changeId] ??= []);
    if (!affects.includes(capability)) affects.push(capability);

    const affectedBy = (capabilityAffectedBy[capability] ??= []);
    if (!affectedBy.includes(changeId)) affectedBy.push(changeId);

    // If the capability doesn't exist in specs/, it's a new introduction
    if (!capabilitySet.has(capability)) {
      const introduces = (changeIntroduces[changeId] ??= []);
      if (!introduces.includes(capability)) introduces.push(capability);
    }
  }

  return {
    capabilities: [...capabilitySet].sort(),
    changes: [...changeSet].sort(),
    archivedChanges: [...archivedSet].sort(),
    changeAffects,
    capabilityAffectedBy,
    changeIntroduces,
    capabilityFiles,
    changeFiles,
  };
}
