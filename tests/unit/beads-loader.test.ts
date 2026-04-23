import { describe, expect, test, beforeEach, mock } from "bun:test";
import { parseIssuesJsonl, loadBeadsIssues } from "../../src/shared/beads-loader";
import { GitHubClient } from "../../src/shared/github-api";

// --- parseIssuesJsonl (pure function) ---

describe("parseIssuesJsonl", () => {
  test("parses valid JSONL into issue objects", () => {
    const raw = [
      '{"id":"abc-1","title":"Fix bug","status":"open","priority":2,"issue_type":"bug","dependency_count":0,"dependent_count":0}',
      '{"id":"abc-2","title":"Add feature","status":"closed","priority":1,"issue_type":"feature","dependency_count":1,"dependent_count":0}',
    ].join("\n");

    const issues = parseIssuesJsonl(raw);
    expect(issues).toHaveLength(2);
    expect(issues[0]!.id).toBe("abc-1");
    expect(issues[0]!.title).toBe("Fix bug");
    expect(issues[1]!.status).toBe("closed");
  });

  test("skips blank lines", () => {
    const raw = '{"id":"abc-1","title":"One"}\n\n\n{"id":"abc-2","title":"Two"}\n';
    const issues = parseIssuesJsonl(raw);
    expect(issues).toHaveLength(2);
  });

  test("skips malformed JSON lines", () => {
    const raw = [
      '{"id":"abc-1","title":"Good"}',
      "not json at all",
      '{"id":"abc-2","title":"Also good"}',
    ].join("\n");

    const issues = parseIssuesJsonl(raw);
    expect(issues).toHaveLength(2);
    expect(issues[0]!.id).toBe("abc-1");
    expect(issues[1]!.id).toBe("abc-2");
  });

  test("skips JSON objects missing required fields", () => {
    const raw = [
      '{"id":"abc-1","title":"Valid"}',
      '{"name":"no id field"}',
      '{"id":"abc-2"}',
    ].join("\n");

    const issues = parseIssuesJsonl(raw);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.id).toBe("abc-1");
  });

  test("returns empty array for empty input", () => {
    expect(parseIssuesJsonl("")).toHaveLength(0);
    expect(parseIssuesJsonl("  \n  \n  ")).toHaveLength(0);
  });

  test("preserves optional fields when present", () => {
    const raw = JSON.stringify({
      id: "abc-1",
      title: "With deps",
      description: "A task",
      status: "open",
      priority: 0,
      issue_type: "task",
      assignee: "dev",
      spec_id: "some-spec",
      dependencies: [
        { issue_id: "abc-1", depends_on_id: "abc-0", type: "blocks" },
      ],
      dependency_count: 1,
      dependent_count: 0,
    });

    const issues = parseIssuesJsonl(raw);
    expect(issues[0]!.assignee).toBe("dev");
    expect(issues[0]!.spec_id).toBe("some-spec");
    expect(issues[0]!.dependencies).toHaveLength(1);
    expect(issues[0]!.dependencies![0]!.depends_on_id).toBe("abc-0");
  });
});

// --- loadBeadsIssues (integration with GitHubClient) ---

describe("loadBeadsIssues", () => {
  let client: GitHubClient;

  const validJsonl = [
    '{"id":"t-1","title":"Task one","status":"open","priority":2,"issue_type":"task","dependency_count":0,"dependent_count":0}',
    '{"id":"t-2","title":"Task two","status":"closed","priority":1,"issue_type":"bug","dependency_count":0,"dependent_count":0}',
  ].join("\n");

  beforeEach(() => {
    client = new GitHubClient();
  });

  test("loads issues from default branch", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(validJsonl, { status: 200 }))
    ) as unknown as typeof fetch;

    const result = await loadBeadsIssues(client, "owner", "repo", "main");

    expect(result.issues).toHaveLength(2);
    expect(result.branch).toBe("main");
    expect(result.fetchedAt).toBeTruthy();
  });

  test("falls back to beads-sync when default branch lacks issues file", async () => {
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        // Default branch: 404
        return Promise.resolve(new Response("Not Found", { status: 404 }));
      }
      // beads-sync branch: success
      return Promise.resolve(new Response(validJsonl, { status: 200 }));
    }) as unknown as typeof fetch;

    const result = await loadBeadsIssues(client, "owner", "repo", "main");

    expect(result.issues).toHaveLength(2);
    expect(result.branch).toBe("beads-sync");
  });

  test("throws when neither branch has issues file", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404 }))
    ) as unknown as typeof fetch;

    await expect(
      loadBeadsIssues(client, "owner", "repo", "main"),
    ).rejects.toThrow("No issue data found");
  });

  test("returns empty array for empty issues file", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("", { status: 200 }))
    ) as unknown as typeof fetch;

    const result = await loadBeadsIssues(client, "owner", "repo", "main");
    expect(result.issues).toHaveLength(0);
  });

  test("includes ISO timestamp in fetchedAt", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(validJsonl, { status: 200 }))
    ) as unknown as typeof fetch;

    const before = new Date().toISOString();
    const result = await loadBeadsIssues(client, "owner", "repo", "main");
    const after = new Date().toISOString();

    expect(result.fetchedAt >= before).toBe(true);
    expect(result.fetchedAt <= after).toBe(true);
  });
});
