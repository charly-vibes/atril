import { GitHubApiError, type GitHubClient } from "./github-api";

export interface BeadsIssue {
  id: string;
  title: string;
  description: string;
  status: "open" | "closed" | "in_progress";
  priority: number;
  issue_type: "task" | "bug" | "feature" | "epic";
  assignee?: string;
  owner?: string;
  created_at: string;
  updated_at?: string;
  closed_at?: string;
  close_reason?: string;
  acceptance_criteria?: string;
  spec_id?: string;
  design?: string;
  notes?: string;
  dependencies?: Array<{
    issue_id: string;
    depends_on_id: string;
    type: string;
  }>;
  dependency_count: number;
  dependent_count: number;
}

export interface BeadsLoadResult {
  issues: BeadsIssue[];
  fetchedAt: string;
  branch: string;
}

/** Parse a JSONL string into typed issue objects, skipping malformed lines. */
export function parseIssuesJsonl(raw: string): BeadsIssue[] {
  const issues: BeadsIssue[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.id === "string" && typeof parsed.title === "string") {
        issues.push(parsed as BeadsIssue);
      }
    } catch {
      // Skip malformed lines
    }
  }
  return issues;
}

/**
 * Load issues from a GitHub repository. Tries the given branch first,
 * then falls back to "beads-sync" branch.
 */
export async function loadBeadsIssues(
  client: GitHubClient,
  owner: string,
  repo: string,
  defaultBranch: string,
): Promise<BeadsLoadResult> {
  const path = ".beads/issues.jsonl";

  // Try default branch first
  try {
    const raw = await client.getFileContent(owner, repo, defaultBranch, path);
    return {
      issues: parseIssuesJsonl(raw),
      fetchedAt: new Date().toISOString(),
      branch: defaultBranch,
    };
  } catch (err) {
    if (!(err instanceof GitHubApiError && err.status === 404)) throw err;
    // 404 → fall through to beads-sync
  }

  // Fallback to beads-sync branch
  try {
    const raw = await client.getFileContent(owner, repo, "beads-sync", path);
    return {
      issues: parseIssuesJsonl(raw),
      fetchedAt: new Date().toISOString(),
      branch: "beads-sync",
    };
  } catch {
    throw new Error(
      "No issue data found. Checked .beads/issues.jsonl on both the default branch and beads-sync.",
    );
  }
}
