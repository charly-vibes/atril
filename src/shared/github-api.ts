const API_BASE = "https://api.github.com";
const RAW_BASE = "https://raw.githubusercontent.com";

export interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

export interface TreeResult {
  entries: GitHubTreeEntry[];
  truncated: boolean;
  commitSha: string;
}

export interface CommitHistoryEntry {
  sha: string;
  message: string;
  authorName: string;
  authoredAt: string;
  changedPaths?: string[];
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class GitHubClient {
  private cache = new Map<string, unknown>();

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const key = `repo:${owner}/${repo}`;
    if (this.cache.has(key)) return (this.cache.get(key) as { default_branch: string }).default_branch;

    const data = await this.apiFetch<{ default_branch: string }>(
      `${API_BASE}/repos/${owner}/${repo}`,
    );
    this.cache.set(key, data);
    return data.default_branch;
  }

  async getTree(owner: string, repo: string, ref: string): Promise<TreeResult> {
    const key = `tree:${owner}/${repo}:${ref}`;
    if (this.cache.has(key)) return this.cache.get(key) as TreeResult;

    const [treeData, commitData] = await Promise.all([
      this.apiFetch<{ tree: GitHubTreeEntry[]; truncated: boolean }>(
        `${API_BASE}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
      ),
      this.apiFetch<{ sha: string }>(
        `${API_BASE}/repos/${owner}/${repo}/commits/${ref}`,
      ),
    ]);
    const result: TreeResult = { entries: treeData.tree, truncated: treeData.truncated, commitSha: commitData.sha };
    this.cache.set(key, result);
    return result;
  }

  async getFileContent(
    owner: string,
    repo: string,
    ref: string,
    path: string,
  ): Promise<string> {
    const key = `file:${owner}/${repo}:${ref}:${path}`;
    if (this.cache.has(key)) return this.cache.get(key) as string;

    const url = `${RAW_BASE}/${owner}/${repo}/${ref}/${path}`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      this.throwForStatus(res.status);
    }
    const text = await res.text();
    this.cache.set(key, text);
    return text;
  }

  async getCommitHistory(
    owner: string,
    repo: string,
    ref: string,
    path?: string,
  ): Promise<CommitHistoryEntry[]> {
    const key = `history:${owner}/${repo}:${ref}:${path ?? ""}`;
    if (this.cache.has(key)) return this.cache.get(key) as CommitHistoryEntry[];

    const params = new URLSearchParams({ sha: ref, per_page: "30" });
    if (path) params.set("path", path);

    const data = await this.apiFetch<
      Array<{
        sha: string;
        commit: {
          message: string;
          author: { name: string; date: string };
        };
        files?: Array<{ filename: string }>;
      }>
    >(`${API_BASE}/repos/${owner}/${repo}/commits?${params.toString()}`);

    const commits = data.map((entry) => ({
      sha: entry.sha,
      message: entry.commit.message,
      authorName: entry.commit.author.name,
      authoredAt: entry.commit.author.date,
      ...(entry.files ? { changedPaths: entry.files.map((file) => file.filename) } : {}),
    }));

    this.cache.set(key, commits);
    return commits;
  }

  private async apiFetch<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      this.throwForStatus(res.status, res.headers.get("X-RateLimit-Remaining"));
    }
    return res.json() as Promise<T>;
  }

  private throwForStatus(status: number, rateLimitRemaining?: string | null): never {
    if (status === 403 && rateLimitRemaining === "0") {
      throw new GitHubApiError(
        "GitHub API rate limit exceeded. Try again later.",
        status,
      );
    }
    if (status === 404) {
      throw new GitHubApiError("Repository not found.", status);
    }
    throw new GitHubApiError(`GitHub API error (HTTP ${status})`, status);
  }
}
