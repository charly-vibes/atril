import type { GitHubTreeEntry } from "./github-api";

export type LinkKind = "file" | "anchor" | "external" | "unresolved";

/** Consumer-facing resolution status — collapses "file"/"anchor" to "navigable". */
export type LinkStatus = "navigable" | "unresolved" | "external";

export interface ResolvedLink {
  kind: LinkKind;
  path: string;
  anchor?: string;
}

export interface LinkTarget {
  text: string;
  href: string;
}

/**
 * Resolve a link href relative to a current file within a repository tree.
 *
 * - Absolute URLs (http/https/mailto) → external
 * - Anchor-only (#foo) → anchor on current file
 * - Relative paths → resolved against current file's directory, checked against tree
 * - Root-relative (/path) → resolved from repo root
 */
export function resolveLink(
  href: string,
  currentFile: string,
  entries: GitHubTreeEntry[],
): ResolvedLink {
  // External links
  if (/^https?:\/\//.test(href) || /^mailto:/.test(href)) {
    return { kind: "external", path: href };
  }

  // Anchor-only
  if (href.startsWith("#")) {
    return { kind: "anchor", path: currentFile, anchor: href.slice(1) };
  }

  // Split href into path and optional anchor
  let rawPath: string;
  let anchor: string | undefined;
  const hashIdx = href.indexOf("#");
  if (hashIdx >= 0) {
    rawPath = href.slice(0, hashIdx);
    anchor = href.slice(hashIdx + 1);
  } else {
    rawPath = href;
  }

  // Resolve the path
  let resolved: string;
  if (rawPath.startsWith("/")) {
    // Root-relative
    resolved = rawPath.slice(1);
  } else {
    // Relative to current file's directory
    const dir = currentFile.includes("/")
      ? currentFile.slice(0, currentFile.lastIndexOf("/"))
      : "";
    resolved = dir ? `${dir}/${rawPath}` : rawPath;
  }

  // Normalize . and .. segments
  resolved = normalizePath(resolved);

  // Path escapes repo root
  if (resolved.startsWith("../") || resolved.startsWith("/")) {
    return { kind: "unresolved", path: href };
  }

  // Check if file exists in tree
  const pathSet = new Set(entries.map((e) => e.path));
  if (pathSet.has(resolved)) {
    const result: ResolvedLink = { kind: "file", path: resolved };
    if (anchor) result.anchor = anchor;
    return result;
  }

  return { kind: "unresolved", path: href };
}

/** Normalize a path by resolving `.` and `..` segments. */
function normalizePath(path: string): string {
  const parts = path.split("/");
  const out: string[] = [];
  let underflow = 0;
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      if (out.length > 0) {
        out.pop();
      } else {
        underflow++;
      }
    } else {
      out.push(part);
    }
  }
  if (underflow > 0) {
    return "../".repeat(underflow) + out.join("/");
  }
  return out.join("/");
}

/**
 * Extract markdown links from content.
 * Returns inline links [text](url) and resolved reference links [text][ref].
 * Excludes image references ![alt](url).
 */
export function extractLinks(content: string): LinkTarget[] {
  const links: LinkTarget[] = [];

  // Collect reference definitions: [key]: url "optional title"
  const refDefs = new Map<string, string>();
  const refPattern = /^\[([^\]]+)\]:\s+(\S+)(?:\s+"[^"]*")?$/gm;
  let refMatch: RegExpExecArray | null;
  while ((refMatch = refPattern.exec(content)) !== null) {
    refDefs.set(refMatch[1]!.toLowerCase(), refMatch[2]!);
  }

  // Inline links: [text](url) — but not images ![alt](url)
  const inlinePattern = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = inlinePattern.exec(content)) !== null) {
    links.push({ text: m[1]!, href: m[2]! });
  }

  // Reference links: [text][ref] or [text][num]
  const refLinkPattern = /(?<!!)\[([^\]]+)\]\[([^\]]+)\]/g;
  while ((m = refLinkPattern.exec(content)) !== null) {
    const key = m[2]!.toLowerCase();
    const href = refDefs.get(key);
    if (href) {
      links.push({ text: m[1]!, href });
    }
  }

  return links;
}
