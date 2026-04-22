import type { GitHubTreeEntry } from "./github-api";

export interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children?: TreeNode[];
}

/**
 * Build a hierarchical tree from a flat list of GitHub tree entries.
 * Directories come before files; both sorted alphabetically.
 */
export function buildFileTree(entries: GitHubTreeEntry[]): TreeNode[] {
  const dirs = new Map<string, TreeNode>();

  // First pass: create all directory nodes
  for (const entry of entries) {
    if (entry.type === "tree") {
      dirs.set(entry.path, {
        name: basename(entry.path),
        path: entry.path,
        type: "tree",
        children: [],
      });
    }
  }

  // Second pass: place blobs into their parent directory
  const root: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.type === "blob") {
      const node: TreeNode = {
        name: basename(entry.path),
        path: entry.path,
        type: "blob",
      };
      const parentPath = dirname(entry.path);
      if (parentPath && dirs.has(parentPath)) {
        dirs.get(parentPath)!.children!.push(node);
      } else {
        root.push(node);
      }
    }
  }

  // Third pass: nest directories into their parents
  for (const [path, node] of dirs) {
    const parentPath = dirname(path);
    if (parentPath && dirs.has(parentPath)) {
      dirs.get(parentPath)!.children!.push(node);
    } else {
      root.push(node);
    }
  }

  sortTree(root);
  return root;
}

/**
 * Fuzzy-filter tree entries by query. Only returns blobs.
 * Characters in query must appear in order in the entry path.
 */
export function fuzzyFilterEntries(
  query: string,
  entries: GitHubTreeEntry[],
  limit = 20,
): GitHubTreeEntry[] {
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const scored: Array<{ entry: GitHubTreeEntry; score: number }> = [];

  for (const entry of entries) {
    if (entry.type !== "blob") continue;

    const lowerPath = entry.path.toLowerCase();
    const score = fuzzyScore(lowerQuery, lowerPath);
    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

/** Higher score = better match. Returns 0 for no match. */
function fuzzyScore(query: string, target: string): number {
  let qi = 0;
  let score = 0;
  let consecutive = 0;

  const filename = target.slice(target.lastIndexOf("/") + 1);
  const filenameStart = target.length - filename.length;

  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      qi++;
      consecutive++;
      // Bonus for consecutive matches
      score += consecutive;
      // Bonus for matching in filename portion
      if (ti >= filenameStart) score += 2;
      // Bonus for matching after separator
      if (ti === 0 || target[ti - 1] === "/" || target[ti - 1] === "-" || target[ti - 1] === ".") {
        score += 3;
      }
    } else {
      consecutive = 0;
    }
  }

  // All query characters must be found
  return qi === query.length ? score : 0;
}

function basename(path: string): string {
  const i = path.lastIndexOf("/");
  return i < 0 ? path : path.slice(i + 1);
}

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i < 0 ? "" : path.slice(0, i);
}

function sortTree(nodes: TreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (node.children) sortTree(node.children);
  }
}
