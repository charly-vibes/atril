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
      ) as typeof fetch;

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
      globalThis.fetch = fetchMock as typeof fetch;

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
      ) as typeof fetch;

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
      ) as typeof fetch;

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
      globalThis.fetch = fetchMock as typeof fetch;

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
      ) as typeof fetch;

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
      ) as typeof fetch;

      expect(client.getDefaultBranch("charly-vibes", "atril")).rejects.toThrow(
        /not found/i
      );
    });

    test("throws on network error", async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new TypeError("Failed to fetch"))
      ) as typeof fetch;

      expect(client.getDefaultBranch("charly-vibes", "atril")).rejects.toThrow();
    });
  });

  describe("getFileContent", () => {
    test("fetches raw file content", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response("# Hello World", { status: 200 })
        )
      ) as typeof fetch;

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
      globalThis.fetch = fetchMock as typeof fetch;

      await client.getFileContent("charly-vibes", "atril", "main", "README.md");
      await client.getFileContent("charly-vibes", "atril", "main", "README.md");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
