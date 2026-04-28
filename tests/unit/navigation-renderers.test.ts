import { describe, expect, test } from "bun:test";
import {
  renderBreadcrumb,
  renderFileActions,
  renderFileBreadcrumb,
  renderSourceBadges,
  renderSuggestionList,
  renderTreeLevel,
  renderTreeSearchResults,
} from "../../src/shared/navigation-renderers";
import type { TreeNode } from "../../src/shared/file-tree";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

const mainTs = await Bun.file("src/main.ts").text();

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

    expect(html).toContain('<span class="source-badge" data-active="false" title="No specs found in this repository">Specs</span>');
    expect(html).not.toContain('type="button" class="source-badge"');
  });

  test("inactive badges have title attribute with 'No X found' message", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false },
      [],
    );

    expect(html).toContain('title="No specs found in this repository"');
    expect(html).toContain('title="No issues found in this repository"');
    expect(html).toContain('title="No memory found in this repository"');
    expect(html).toContain('title="No docs found in this repository"');
    expect(html).toContain('title="No README found in this repository"');
  });

  test("inactive badges render as span not button per source", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: true, wai: false, docs: false, readme: false },
      [{ label: "Issues", path: ".beads/issues.jsonl", kind: "beads" }],
    );

    // openspec is inactive — must be a span with title
    expect(html).toContain('<span class="source-badge" data-active="false" title="No specs found in this repository">Specs</span>');
    // beads is active — must be a button
    expect(html).toContain('type="button" class="source-badge" data-active="true" data-source="beads"');
  });

  // Task 5.1 — active SPECS pill is a clickable button when openspec is detected
  test("active SPECS pill is rendered as a button when openspec source is present", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: false, wai: false, docs: false, readme: false },
      [{ label: "Specs", path: "openspec/specs/", kind: "tree" }],
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('class="source-badge"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-source="openspec"');
  });

  // Task 5.2 — SPECS pill carries the routing metadata to navigate to the OpenSpec navigator
  test("active SPECS pill carries tree kind and openspec/specs/ path for navigator routing", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: false, wai: false, docs: false, readme: false },
      [{ label: "Specs", path: "openspec/specs/", kind: "tree" }],
    );

    // The click handler in main.ts uses data-kind and data-path to route the badge click.
    // For SPECS: kind="tree" + path="openspec/specs/" → { view: "tree", search: "openspec/specs/" }
    expect(html).toContain('data-kind="tree"');
    expect(html).toContain('data-path="openspec/specs/"');
  });

  // Task 5.2 — falls back to openspec/changes/ when no canonical specs exist yet
  test("active SPECS pill uses openspec/changes/ path when only changes exist", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: false, wai: false, docs: false, readme: false },
      [{ label: "Specs", path: "openspec/changes/", kind: "tree" }],
    );

    expect(html).toContain('data-path="openspec/changes/"');
    expect(html).toContain('data-kind="tree"');
  });

  // Task 5.3 — inactive SPECS pill must not be a button (already verified above, explicit guard)
  test("inactive SPECS pill is a non-interactive span with no click affordance", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false },
      [],
    );

    const specsSpan = '<span class="source-badge" data-active="false" title="No specs found in this repository">Specs</span>';
    expect(html).toContain(specsSpan);
    // Must not appear as a button at all
    expect(html).not.toContain('<button');
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

  test("shows common parent dir once as section header when all items share the same dir", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "openspec/specs/beads-viewer/spec.md", type: "blob", sha: "a1" },
      { path: "openspec/specs/design-system/spec.md", type: "blob", sha: "a2" },
      { path: "openspec/specs/platform/spec.md", type: "blob", sha: "a3" },
      { path: "openspec/specs/spec-viewer/spec.md", type: "blob", sha: "a4" },
    ];

    const html = renderTreeSearchResults(entries);

    // Common dir appears once as a header
    const headerMatches = (html.match(/class="tree-search-section-header"/g) ?? []).length;
    expect(headerMatches).toBe(1);
    expect(html).toContain('>openspec/specs</');

    // Individual items show only the capability name, not the repeated dir
    expect(html).toContain('class="tree-search-name">beads-viewer</span>');
    expect(html).toContain('class="tree-search-name">design-system</span>');
    expect(html).toContain('class="tree-search-name">platform</span>');
    expect(html).toContain('class="tree-search-name">spec-viewer</span>');

    // The repeated dir must NOT appear inside individual item path spans
    const pathSpanMatches = (html.match(/class="tree-search-path">openspec\/specs</g) ?? []).length;
    expect(pathSpanMatches).toBe(0);
  });

  test("still shows per-item dir when items have different parent dirs", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "openspec/specs/beads-viewer/spec.md", type: "blob", sha: "a1" },
      { path: "openspec/changes/add-reader/specs/platform/spec.md", type: "blob", sha: "a2" },
    ];

    const html = renderTreeSearchResults(entries);

    // No shared-dir header
    expect(html).not.toContain('class="tree-search-section-header"');

    // Each item still shows its own dir
    expect(html).toContain('class="tree-search-path">openspec/specs</span>');
    expect(html).toContain('class="tree-search-path">openspec/changes/add-reader/specs</span>');
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

describe("renderFileActions", () => {
  test("renders history and copy-link buttons for the file view", () => {
    const html = renderFileActions();

    expect(html).toContain('type="button" id="file-history"');
    expect(html).toContain('type="button" class="copy-link-button" data-copy-scope="file"');
    expect(html).toContain('aria-label="Copy link to current file"');
  });
});

// Task 5.2 — wiring: main.ts routes source badge clicks to the navigator
describe("source badge click wiring in main.ts", () => {
  test("click handler reads data-kind from active source badge to determine navigation target", () => {
    // The handler uses .closest('.source-badge') and checks tagName === 'BUTTON'
    // then passes badge.dataset.kind and badge.dataset.path to navigateOverviewItem
    expect(mainTs).toContain("closest(\".source-badge\")");
    expect(mainTs).toContain('badge?.tagName === "BUTTON"');
    expect(mainTs).toContain("badge.dataset.kind");
    expect(mainTs).toContain("badge.dataset.path");
  });

  test("navigateOverviewItem routes kind=tree + openspec path to the tree view scoped to openspec/specs/", () => {
    // The function must handle kind === "tree" and navigate to { view: "tree", search: path }
    // when the path is an openspec path
    expect(mainTs).toContain('kind === "tree"');
    expect(mainTs).toContain('"openspec/specs/"');
    expect(mainTs).toContain('"openspec/changes/"');
    expect(mainTs).toContain('view: "tree"');
  });

  test("navigateOverviewItem routes inactive-source kinds (beads, wai, docs) without requiring openspec logic", () => {
    // Each source kind must have its own navigation branch
    expect(mainTs).toContain('kind === "beads"');
    expect(mainTs).toContain('kind === "wai"');
    expect(mainTs).toContain('kind === "docs"');
  });
});
