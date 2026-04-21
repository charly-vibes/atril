import { describe, expect, test } from "bun:test";
import { renderHistoryOverview } from "../../src/shared/history-overview";

describe("renderHistoryOverview", () => {
  test("renders recent commits with changed path summaries", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Add history mode",
        authorName: "Sasha",
        authoredAt: "2026-04-20T12:00:00Z",
        changedPaths: ["src/main.ts", "src/shared/router.ts"],
      },
    ]);

    expect(html).toContain("Recent commits");
    expect(html).toContain("Add history mode");
    expect(html).toContain("Sasha");
    expect(html).toContain("2026-04-20T12:00:00Z");
    expect(html).toContain("abc1234");
    expect(html).toContain("src/main.ts");
    expect(html).toContain("src/shared/router.ts");
  });

  test("renders an empty state when no commits are available", () => {
    const html = renderHistoryOverview([]);

    expect(html).toContain("No history available");
    expect(html).toContain("No recent commits were found for this repository.");
  });

  test("renders scoped history text for a selected path", () => {
    const html = renderHistoryOverview(
      [
        {
          sha: "abc123456789",
          message: "Refine docs",
          authorName: "Charly",
          authoredAt: "2026-04-21T09:30:00Z",
        },
      ],
      "docs/guide.md",
    );

    expect(html).toContain("Showing recent commits for <code>docs/guide.md</code>.");
    expect(html).toContain("Changed paths unavailable for this commit.");
  });
});

describe("path-aware navigation from history view (OpenSpec add-unified-repo-reader:5.3)", () => {
  test("renders changed paths as navigable elements with data-path attributes", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Update docs",
        authorName: "Sasha",
        authoredAt: "2026-04-21T10:00:00Z",
        changedPaths: ["src/main.ts", "docs/guide.md"],
      },
    ]);

    expect(html).toContain('class="changed-path-link"');
    expect(html).toContain('data-path="src/main.ts"');
    expect(html).toContain('data-path="docs/guide.md"');
  });

  test("does not render navigable elements when changed paths are absent", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Refine docs",
        authorName: "Charly",
        authoredAt: "2026-04-21T09:30:00Z",
      },
    ]);

    expect(html).not.toContain('class="changed-path-link"');
  });
});
