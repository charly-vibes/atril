import { describe, expect, test } from "bun:test";
import {
  renderBreadcrumb,
  renderFileBreadcrumb,
  renderSourceBadges,
  renderSuggestionList,
  renderTreeLevel,
  renderTreeSearchResults,
} from "../../src/shared/navigation-renderers";
import type { TreeNode } from "../../src/shared/file-tree";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

describe("renderSourceBadges", () => {
  test("renders active source badges as semantic buttons with navigation metadata", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: true, wai: true, docs: true, readme: true },
      [
        { label: "Specs", path: "openspec/specs/", kind: "tree" },
        { label: "Issues", path: ".beads/issues.jsonl", kind: "beads" },
        { label: "Project memory", path: ".wai/", kind: "wai" },
        { label: "Documentation", path: "docs/", kind: "docs" },
        { label: "README", path: "README.rst", kind: "readme" },
      ],
    );

    expect(html).toContain('type="button" class="source-badge" data-active="true" data-source="openspec" data-kind="tree" data-path="openspec/specs/"');
    expect(html).toContain('data-source="beads" data-kind="beads" data-path=".beads/issues.jsonl"');
    expect(html).toContain('data-source="readme" data-kind="readme" data-path="README.rst"');
  });

  test("renders inactive source badges as non-interactive spans", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false },
      [],
    );

    expect(html).toContain('<span class="source-badge" data-active="false">Specs</span>');
    expect(html).not.toContain('type="button" class="source-badge"');
  });
});

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

describe("renderFileBreadcrumb", () => {
  test("renders a canonical spec link for change delta spec files when the canonical spec exists", () => {
    const html = renderFileBreadcrumb(
      "openspec/changes/add-reader/specs/platform/spec.md",
      [
        { path: "openspec/specs/platform/spec.md", type: "blob", sha: "abc" },
      ],
    );

    expect(html).toContain('class="canonical-spec-link"');
    expect(html).toContain('data-path="openspec/specs/platform/spec.md"');
    expect(html).toContain('View canonical spec');
  });

  test("omits the canonical spec link when the canonical spec does not exist", () => {
    const html = renderFileBreadcrumb(
      "openspec/changes/add-reader/specs/repo-overview/spec.md",
      [],
    );

    expect(html).not.toContain('class="canonical-spec-link"');
  });
});
