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

    const data = await this.apiFetch<{ tree: GitHubTreeEntry[]; truncated: boolean }>(
      `${API_BASE}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
    );
    const result: TreeResult = { entries: data.tree, truncated: data.truncated };
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
    const res = await fetch(url);
    if (!res.ok) {
      this.throwForStatus(res.status);
    }
    const text = await res.text();
    this.cache.set(key, text);
    return text;
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
