/** Canonical repository reference parsed from user input. */
export interface RepoRef {
  owner: string;
  repo: string;
}

/**
 * Parse a repository slug ("owner/repo") or GitHub URL into a canonical RepoRef.
 * Returns null if the input cannot be parsed.
 */
export function parseRepoInput(input: string): RepoRef | null {
  const trimmed = input.trim();

  // Try slug format: owner/repo
  const slugMatch = trimmed.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
  if (slugMatch) {
    return { owner: slugMatch[1]!, repo: slugMatch[2]! };
  }

  // Try GitHub URL
  try {
    const url = new URL(trimmed);
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0]!, repo: parts[1]!.replace(/\.git$/, "") };
  } catch {
    return null;
  }
}
