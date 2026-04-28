import { describe, expect, test } from "bun:test";
import { renderHistoryOverview } from "../../src/shared/history-overview";

describe("renderHistoryOverview", () => {
  test("renders commit title and short hash", () => {
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
    expect(html).toContain("abc1234");
    expect(html).toContain('class="history-sha"');
    expect(html).toContain('class="history-title"');
    expect(html).toContain("src/main.ts");
  });

  test("splits title from body and makes body expandable", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Add feature\n\nThis is the detailed description\nwith multiple lines.",
        authorName: "Sasha",
        authoredAt: "2026-04-20T12:00:00Z",
      },
    ]);

    expect(html).toContain("<details>");
    expect(html).toContain("Add feature");
    expect(html).toContain("This is the detailed description");
    expect(html).toContain('class="history-body"');
  });

  test("no details element for title-only commits without changed paths", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Quick fix",
        authorName: "Sasha",
        authoredAt: "2026-04-20T12:00:00Z",
      },
    ]);

    expect(html).not.toContain("<details>");
    expect(html).toContain("Quick fix");
    expect(html).toContain("abc1234");
  });

  test("renders empty state", () => {
    const html = renderHistoryOverview([]);
    expect(html).toContain("No history available");
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
  });
});

describe("path-aware navigation from history view", () => {
  test("renders changed paths as semantic buttons with data-path attributes", () => {
    const html = renderHistoryOverview([
      {
        sha: "abc123456789",
        message: "Update docs",
        authorName: "Sasha",
        authoredAt: "2026-04-21T10:00:00Z",
        changedPaths: ["src/main.ts", "docs/guide.md"],
      },
    ]);

    expect(html).toContain('type="button" class="changed-path-link"');
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
