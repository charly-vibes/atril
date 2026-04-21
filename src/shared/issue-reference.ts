import type { GitHubTreeEntry } from "./github-api";
import { extractLinks, resolveLink } from "./link-resolver";

export type ReferenceStatus = "navigable" | "unresolved" | "external";

export interface IssueReference {
  text: string;
  path?: string;
  status: ReferenceStatus;
}

/**
 * Extract and resolve artifact references from issue text.
 *
 * Detects:
 * 1. Markdown links — resolved against the repo tree
 * 2. OpenSpec change/spec shorthand names — expanded to tree paths
 *
 * References that resolve to the same path are deduplicated.
 */
export function resolveIssueReferences(
  text: string,
  entries: GitHubTreeEntry[],
): IssueReference[] {
  if (!text) return [];

  const refs: IssueReference[] = [];
  const seenPaths = new Set<string>();

  // 1. Markdown links
  const links = extractLinks(text);
  for (const link of links) {
    const resolved = resolveLink(link.href, "", entries);
    let ref: IssueReference;
    if (resolved.kind === "file") {
      if (seenPaths.has(resolved.path)) continue;
      seenPaths.add(resolved.path);
      ref = { text: link.text, path: resolved.path, status: "navigable" };
    } else if (resolved.kind === "external") {
      ref = { text: link.text, path: resolved.path, status: "external" };
    } else {
      ref = { text: link.text, status: "unresolved" };
    }
    refs.push(ref);
  }

  // 2. OpenSpec shorthand names — match change or spec directories
  const changeNames = new Map<string, string>();
  const specNames = new Map<string, string>();
  for (const entry of entries) {
    const changeMatch = entry.path.match(/^openspec\/changes\/([^/]+)\/proposal\.md$/);
    if (changeMatch) {
      changeNames.set(changeMatch[1]!, entry.path);
    }
    const specMatch = entry.path.match(/^openspec\/specs\/([^/]+)\/spec\.md$/);
    if (specMatch) {
      specNames.set(specMatch[1]!, entry.path);
    }
  }

  // Search for shorthand names as whole words in text
  for (const [name, path] of changeNames) {
    if (seenPaths.has(path)) continue;
    const pattern = new RegExp(`(?<![\\w/])${escapeRegex(name)}(?![\\w/])`, "g");
    if (pattern.test(text)) {
      seenPaths.add(path);
      refs.push({ text: name, path, status: "navigable" });
    }
  }

  for (const [name, path] of specNames) {
    if (seenPaths.has(path)) continue;
    const pattern = new RegExp(`(?<![\\w/])${escapeRegex(name)}(?![\\w/])`, "g");
    if (pattern.test(text)) {
      seenPaths.add(path);
      refs.push({ text: name, path, status: "navigable" });
    }
  }

  return refs;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
