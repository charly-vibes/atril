import { describe, expect, test } from "bun:test";
import { renderBeadsListView, filterIssues } from "../../src/shared/beads-renderer";
import type { BeadsIssue, BeadsLoadResult } from "../../src/shared/beads-loader";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function makeIssue(overrides: Partial<BeadsIssue> = {}): BeadsIssue {
  return {
    id: "test-1",
    title: "Test issue",
    description: "A test issue",
    status: "open",
    priority: 2,
    issue_type: "task",
    created_at: "2026-04-20T10:00:00Z",
    dependency_count: 0,
    dependent_count: 0,
    ...overrides,
  };
}

function makeResult(issues: BeadsIssue[]): BeadsLoadResult {
  return {
    issues,
    fetchedAt: "2026-04-23T12:00:00Z",
    branch: "main",
  };
}

describe("renderBeadsListView", () => {
  test("renders empty state when no issues", () => {
    const html = renderBeadsListView(makeResult([]));
    expect(html).toContain("No issues found");
    expect(html).toContain("main");
  });

  test("renders list of issues", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", title: "Fix login bug" }),
      makeIssue({ id: "a-2", title: "Add search" }),
    ]);
    const html = renderBeadsListView(result);
    expect(html).toContain("Fix login bug");
    expect(html).toContain("Add search");
    expect(html).toContain('data-issue-id="a-1"');
    expect(html).toContain('data-issue-id="a-2"');
  });

  test("renders detail panel when issue is selected", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", title: "Fix login bug", description: "Login fails on mobile" }),
      makeIssue({ id: "a-2", title: "Add search" }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).toContain("Fix login bug");
    expect(html).toContain("Login fails on mobile");
    expect(html).toContain("beads-detail");
  });

  test("marks selected issue in list", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", title: "Selected one" }),
      makeIssue({ id: "a-2", title: "Other one" }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).toContain('class="beads-list-item selected" data-issue-id="a-1"');
    expect(html).not.toContain('class="beads-list-item selected" data-issue-id="a-2"');
  });

  test("auto-selects the first visible issue when no issue is selected", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", title: "First issue", description: "First detail" }),
      makeIssue({ id: "a-2", title: "Second issue", description: "Second detail" }),
    ]);
    const html = renderBeadsListView(result);
    expect(html).toContain('class="beads-list-item selected" data-issue-id="a-1"');
    expect(html).toContain("First detail");
    expect(html).not.toContain("Select an issue to view details");
  });

  test("renders issue metadata", () => {
    const result = makeResult([
      makeIssue({
        id: "a-1",
        status: "in_progress",
        priority: 1,
        issue_type: "bug",
        assignee: "dev-user",
      }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).toContain("in progress");
    expect(html).toContain("P1");
    expect(html).toContain("bug");
    expect(html).toContain("dev-user");
  });

  test("renders dependency links", () => {
    const result = makeResult([
      makeIssue({
        id: "a-1",
        dependencies: [
          { issue_id: "a-1", depends_on_id: "a-0", type: "blocks" },
        ],
        dependency_count: 1,
      }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).toContain("Dependencies");
    expect(html).toContain('data-issue-id="a-0"');
    expect(html).toContain("blocks");
  });

  test("shows branch and freshness timestamp", () => {
    const result: BeadsLoadResult = {
      issues: [makeIssue()],
      fetchedAt: "2026-04-23T12:00:00Z",
      branch: "beads-sync",
    };
    const html = renderBeadsListView(result);
    expect(html).toContain("beads-sync");
    expect(html).toContain("beads-freshness");
  });

  test("escapes HTML in issue content", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", title: '<script>alert("xss")</script>' }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  test("renders status badges with correct class", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "open" }),
      makeIssue({ id: "a-2", status: "closed" }),
      makeIssue({ id: "a-3", status: "in_progress" }),
    ]);
    const html = renderBeadsListView(result);
    expect(html).toContain("beads-status-open");
    expect(html).toContain("beads-status-closed");
    expect(html).toContain("beads-status-in_progress");
  });

  test("handles issue with no description", () => {
    const issue = makeIssue({ id: "a-1", description: "" });
    const result = makeResult([issue]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).not.toContain("beads-description");
  });

  test("handles closed issue with close date", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "closed", closed_at: "2026-04-22T15:00:00Z" }),
    ]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).toContain("Closed");
    expect(html).toContain("Apr 22");
  });

  test("renders filter toolbar", () => {
    const result = makeResult([makeIssue()]);
    const html = renderBeadsListView(result);
    expect(html).toContain("beads-toolbar");
    expect(html).toContain("beads-search");
    expect(html).toContain("beads-filter");
  });

  test("shows a clear-search button only when the search has a value", () => {
    const result = makeResult([makeIssue()]);
    const withSearch = renderBeadsListView(result, undefined, { search: "login" });
    const withoutSearch = renderBeadsListView(result);

    expect(withSearch).toContain('class="beads-search-clear"');
    expect(withSearch).toContain('aria-label="Clear issue search"');
    expect(withoutSearch).not.toContain('class="beads-search-clear"');
  });

  test("filters list when filters provided", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "open", title: "Open task" }),
      makeIssue({ id: "a-2", status: "closed", title: "Closed task" }),
    ]);
    const html = renderBeadsListView(result, undefined, { status: "open" });
    expect(html).toContain("Open task");
    expect(html).not.toContain('data-issue-id="a-2"');
  });

  test("falls back to the first filtered issue when the selected issue is not visible", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "open", title: "Open issue", description: "Open detail" }),
      makeIssue({ id: "a-2", status: "closed", title: "Closed issue", description: "Closed detail" }),
    ]);
    const html = renderBeadsListView(result, "a-2", { status: "open" });
    expect(html).toContain('class="beads-list-item selected" data-issue-id="a-1"');
    expect(html).not.toContain('class="beads-list-item selected" data-issue-id="a-2"');
    expect(html).toContain("Open detail");
    expect(html).not.toContain("Closed detail");
  });

  test("shows the search term in the empty state when search has no matches", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "open", title: "Login issue" }),
    ]);
    const html = renderBeadsListView(result, undefined, { search: "xyznonexistent" });
    expect(html).toContain('No issues matching "xyznonexistent"');
  });

  test("shows empty filter message when no issues match filters", () => {
    const result = makeResult([
      makeIssue({ id: "a-1", status: "open" }),
    ]);
    const html = renderBeadsListView(result, undefined, { status: "closed" });
    expect(html).toContain("No issues match the current filters");
  });
});

describe("filterIssues", () => {
  const issues: BeadsIssue[] = [
    makeIssue({ id: "a-1", status: "open", issue_type: "bug", priority: 1, title: "Login fails", description: "On mobile devices" }),
    makeIssue({ id: "a-2", status: "closed", issue_type: "task", priority: 2, title: "Add tests", description: "Unit tests for auth" }),
    makeIssue({ id: "a-3", status: "in_progress", issue_type: "feature", priority: 0, title: "Search feature", description: "Full-text search" }),
    makeIssue({ id: "a-4", status: "open", issue_type: "bug", priority: 1, title: "CSS broken", description: "Layout issue on Safari" }),
  ];

  test("returns all issues with no filters", () => {
    expect(filterIssues(issues, {})).toHaveLength(4);
  });

  test("filters by status", () => {
    const result = filterIssues(issues, { status: "open" });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.status === "open")).toBe(true);
  });

  test("filters by type", () => {
    const result = filterIssues(issues, { type: "bug" });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.issue_type === "bug")).toBe(true);
  });

  test("filters by priority", () => {
    const result = filterIssues(issues, { priority: 1 });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.priority === 1)).toBe(true);
  });

  test("combines multiple filters (intersection)", () => {
    const result = filterIssues(issues, { status: "open", type: "bug" });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.status === "open" && i.issue_type === "bug")).toBe(true);
  });

  test("combines all filters", () => {
    const result = filterIssues(issues, { status: "open", type: "bug", priority: 1 });
    expect(result).toHaveLength(2);
  });

  test("search matches title", () => {
    const result = filterIssues(issues, { search: "login" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("a-1");
  });

  test("search matches description", () => {
    const result = filterIssues(issues, { search: "safari" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("a-4");
  });

  test("search is case-insensitive", () => {
    const result = filterIssues(issues, { search: "LOGIN" });
    expect(result).toHaveLength(1);
  });

  test("search with no matches returns empty array", () => {
    expect(filterIssues(issues, { search: "nonexistent" })).toHaveLength(0);
  });

  test("search combined with status filter", () => {
    const result = filterIssues(issues, { search: "test", status: "closed" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("a-2");
  });

  test("returns empty when filters exclude everything", () => {
    expect(filterIssues(issues, { status: "closed", type: "bug" })).toHaveLength(0);
  });
});

describe("cross-reference rendering", () => {
  test("renders navigable artifact references when tree entries provided", () => {
    const treeEntries: GitHubTreeEntry[] = [
      { path: "openspec/specs/beads-viewer/spec.md", type: "blob", sha: "abc" },
    ];
    const issue = makeIssue({
      id: "a-1",
      title: "Implement beads-viewer",
      description: "Related to beads-viewer spec",
    });
    const result = makeResult([issue]);
    const html = renderBeadsListView(result, "a-1", undefined, treeEntries);
    expect(html).toContain("Referenced artifacts");
    expect(html).toContain("beads-viewer");
    expect(html).toContain("issue-ref-link");
  });

  test("renders unresolvable references as plain text", () => {
    const treeEntries: GitHubTreeEntry[] = [];
    const issue = makeIssue({
      id: "a-1",
      description: "See [guide](docs/missing.md) for details",
    });
    const result = makeResult([issue]);
    const html = renderBeadsListView(result, "a-1", undefined, treeEntries);
    expect(html).toContain("no destination available");
  });

  test("omits references section when no tree entries provided", () => {
    const issue = makeIssue({
      id: "a-1",
      description: "References beads-viewer spec",
    });
    const result = makeResult([issue]);
    const html = renderBeadsListView(result, "a-1");
    expect(html).not.toContain("Referenced artifacts");
  });
});
