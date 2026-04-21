import { describe, expect, test, beforeEach, mock } from "bun:test";
import { GitHubClient, type GitHubTreeEntry } from "../../src/shared/github-api";

describe("GitHubClient", () => {
  let client: GitHubClient;

  beforeEach(() => {
    client = new GitHubClient();
  });

  describe("getTree", () => {
    test("fetches repository tree for a given ref", async () => {
      const mockTree: GitHubTreeEntry[] = [
        { path: "README.md", type: "blob", sha: "abc123" },
        { path: "src", type: "tree", sha: "def456" },
      ];

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ tree: mockTree, truncated: false }),
            { status: 200 }
          )
        )
      ) as unknown as typeof fetch;

      const result = await client.getTree("charly-vibes", "atril", "main");
      expect(result.entries).toEqual(mockTree);
      expect(result.truncated).toBe(false);
    });

    test("caches tree responses within a session", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ tree: [], truncated: false }),
            { status: 200 }
          )
        )
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getTree("charly-vibes", "atril", "main");
      await client.getTree("charly-vibes", "atril", "main");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test("reports truncated trees", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ tree: [], truncated: true }),
            { status: 200 }
          )
        )
      ) as unknown as typeof fetch;

      const result = await client.getTree("charly-vibes", "atril", "main");
      expect(result.truncated).toBe(true);
    });
  });

  describe("getDefaultBranch", () => {
    test("returns default branch name", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ default_branch: "main" }),
            { status: 200 }
          )
        )
      ) as unknown as typeof fetch;

      const branch = await client.getDefaultBranch("charly-vibes", "atril");
      expect(branch).toBe("main");
    });

    test("caches default branch response", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ default_branch: "main" }),
            { status: 200 }
          )
        )
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getDefaultBranch("charly-vibes", "atril");
      await client.getDefaultBranch("charly-vibes", "atril");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    test("throws on rate limit with clear message", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ message: "API rate limit exceeded" }),
            { status: 403, headers: { "X-RateLimit-Remaining": "0" } }
          )
        )
      ) as unknown as typeof fetch;

      expect(client.getDefaultBranch("charly-vibes", "atril")).rejects.toThrow(
        /rate limit/i
      );
    });

    test("throws on 404 with clear message", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ message: "Not Found" }),
            { status: 404 }
          )
        )
      ) as unknown as typeof fetch;

      expect(client.getDefaultBranch("charly-vibes", "atril")).rejects.toThrow(
        /not found/i
      );
    });

    test("throws on network error", async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new TypeError("Failed to fetch"))
      ) as unknown as typeof fetch;

      expect(client.getDefaultBranch("charly-vibes", "atril")).rejects.toThrow();
    });
  });

  describe("getFileContent", () => {
    test("fetches raw file content", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response("# Hello World", { status: 200 })
        )
      ) as unknown as typeof fetch;

      const content = await client.getFileContent(
        "charly-vibes",
        "atril",
        "main",
        "README.md"
      );
      expect(content).toBe("# Hello World");
    });

    test("caches file content responses", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(new Response("content", { status: 200 }))
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getFileContent("charly-vibes", "atril", "main", "README.md");
      await client.getFileContent("charly-vibes", "atril", "main", "README.md");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCommitHistory", () => {
    test("loads recent commits for a repository", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify([
              {
                sha: "abc123",
                commit: {
                  message: "Add history mode",
                  author: {
                    name: "Sasha",
                    date: "2026-04-20T12:00:00Z",
                  },
                },
              },
              {
                sha: "def456",
                commit: {
                  message: "Refine routing",
                  author: {
                    name: "Charly",
                    date: "2026-04-19T08:30:00Z",
                  },
                },
              },
            ]),
            { status: 200 }
          )
        )
      ) as unknown as typeof fetch;

      const commits = await client.getCommitHistory("charly-vibes", "atril", "main");

      expect(commits).toHaveLength(2);
      expect(commits[0]).toEqual({
        sha: "abc123",
        message: "Add history mode",
        authorName: "Sasha",
        authoredAt: "2026-04-20T12:00:00Z",
      });
      expect(commits[1]).toEqual({
        sha: "def456",
        message: "Refine routing",
        authorName: "Charly",
        authoredAt: "2026-04-19T08:30:00Z",
      });
    });

    test("returns an empty list when the API returns no commits", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      ) as unknown as typeof fetch;

      const commits = await client.getCommitHistory("charly-vibes", "atril", "main");

      expect(commits).toEqual([]);
    });

    test("caches recent commit history responses", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getCommitHistory("charly-vibes", "atril", "main");
      await client.getCommitHistory("charly-vibes", "atril", "main");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test("scopes commit history lookup to a selected path", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getCommitHistory(
        "charly-vibes",
        "atril",
        "main",
        "openspec/changes/add-unified-repo-reader/proposal.md"
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/repos/charly-vibes/atril/commits?sha=main&per_page=30&path=openspec%2Fchanges%2Fadd-unified-repo-reader%2Fproposal.md"
      );
    });

    test("treats repository-wide and path-specific history as separate cache entries", async () => {
      const fetchMock = mock(() =>
        Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      );
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      await client.getCommitHistory("charly-vibes", "atril", "main");
      await client.getCommitHistory(
        "charly-vibes",
        "atril",
        "main",
        "README.md"
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test("throws a clear error when commit history cannot be loaded", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: "Not Found" }), { status: 404 })
        )
      ) as unknown as typeof fetch;

      expect(
        client.getCommitHistory(
          "charly-vibes",
          "atril",
          "main",
          "missing/file.md"
        )
      ).rejects.toThrow(/not found/i);
    });
  });
});
