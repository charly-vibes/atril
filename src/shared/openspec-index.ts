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

    // Capabilities: openspec/specs/<name>/...
    if (entry.path.startsWith(SPEC_PREFIX)) {
      const rest = entry.path.slice(SPEC_PREFIX.length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx > 0) {
        const name = rest.slice(0, slashIdx);
        capabilitySet.add(name);
        (capabilityFiles[name] ??= []).push(entry.path);
      }
      continue;
    }

    // Archived changes: openspec/changes/archive/<id>/...
    if (entry.path.startsWith(ARCHIVE_PREFIX)) {
      const rest = entry.path.slice(ARCHIVE_PREFIX.length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx > 0) {
        archivedSet.add(rest.slice(0, slashIdx));
      }
      continue;
    }

    // Active changes: openspec/changes/<id>/...
    if (entry.path.startsWith(CHANGE_PREFIX)) {
      const rest = entry.path.slice(CHANGE_PREFIX.length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx > 0) {
        const changeId = rest.slice(0, slashIdx);
        changeSet.add(changeId);
        (changeFiles[changeId] ??= []).push(entry.path);

        // Delta specs: changes/<change-id>/specs/<capability>/...
        const afterId = rest.slice(slashIdx + 1);
        if (afterId.startsWith("specs/")) {
          const specRest = afterId.slice("specs/".length);
          const capSlash = specRest.indexOf("/");
          if (capSlash > 0) {
            deltaSpecs.push({ changeId, capability: specRest.slice(0, capSlash) });
          }
        }
      }
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
