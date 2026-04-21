import type { GitHubTreeEntry } from "./github-api";
import { resolveLink, type ResolvedLink, type LinkTarget, type LinkStatus } from "./link-resolver";

export interface AnnotatedLink {
  text: string;
  href: string;
  resolved: ResolvedLink;
  status: LinkStatus;
}

/**
 * Annotate a list of extracted links with their resolution status.
 * Each link is resolved against the tree and classified as navigable,
 * unresolved, or external — enabling fallback UI for broken links.
 */
export function annotateLinks(
  links: LinkTarget[],
  currentFile: string,
  entries: GitHubTreeEntry[],
): AnnotatedLink[] {
  return links.map((link) => {
    const resolved = resolveLink(link.href, currentFile, entries);
    let status: LinkStatus;
    switch (resolved.kind) {
      case "file":
      case "anchor":
        status = "navigable";
        break;
      case "external":
        status = "external";
        break;
      case "unresolved":
        status = "unresolved";
        break;
    }
    return { text: link.text, href: link.href, resolved, status };
  });
}
