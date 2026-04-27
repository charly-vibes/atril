import { describe, expect, test } from "bun:test";
import {
  renderBreadcrumb,
  renderSuggestionList,
  renderTreeLevel,
  renderTreeSearchResults,
} from "../../src/shared/navigation-renderers";
import type { TreeNode } from "../../src/shared/file-tree";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

describe("renderSuggestionList", () => {
  test("renders suggestion items as semantic buttons", () => {
    const html = renderSuggestionList([
      { label: "README", path: "README.md", kind: "readme" },
      { label: "Documentation", path: "docs/", kind: "docs" },
    ]);

    expect(html).toContain('class="suggestion-item"');
    expect(html).toContain('type="button" class="suggestion-item"');
    expect(html).toContain('data-path="README.md"');
    expect(html).toContain('data-kind="history"');
  });
});

describe("renderTreeLevel", () => {
  test("renders tree and file items as semantic buttons", () => {
    const nodes: TreeNode[] = [
      {
        name: "docs",
        path: "docs",
        type: "tree",
        children: [
          { name: "guide.md", path: "docs/guide.md", type: "blob" },
        ],
      },
    ];

    const html = renderTreeLevel(nodes);

    expect(html).toContain('type="button" class="tree-item" data-type="tree" data-path="docs"');
    expect(html).toContain('type="button" class="tree-item" data-type="blob" data-path="docs/guide.md"');
    expect(html).toContain('class="tree-children" hidden');
  });
});

describe("renderTreeSearchResults", () => {
  test("renders search results as semantic buttons", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "docs/guide.md", type: "blob", sha: "abc" },
    ];

    const html = renderTreeSearchResults(entries);

    expect(html).toContain('type="button" class="tree-search-item" data-path="docs/guide.md"');
    expect(html).toContain('class="tree-search-name">guide.md</span>');
    expect(html).toContain('class="tree-search-path">docs</span>');
  });
});

describe("renderBreadcrumb", () => {
  test("renders breadcrumb segments as explicit buttons", () => {
    const html = renderBreadcrumb("docs/guides/intro.md");

    expect(html).toContain('type="button" class="breadcrumb-seg" data-dir="docs"');
    expect(html).toContain('type="button" class="breadcrumb-seg" data-dir="docs/guides"');
    expect(html).toContain('<span>intro.md</span>');
  });
});
