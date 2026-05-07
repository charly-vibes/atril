import { describe, expect, test } from "bun:test";
import {
  renderBreadcrumb,
  renderFileActions,
  renderFileBreadcrumb,
  renderPendingChangeIndicator,
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
      { openspec: true, beads: true, wai: true, docs: true, readme: true, language: false },
      [
        { label: "Specs", path: "openspec/", kind: "openspec" },
        { label: "Issues", path: ".beads/issues.jsonl", kind: "beads" },
        { label: "Project memory", path: ".wai/", kind: "wai" },
        { label: "Documentation", path: "docs/", kind: "docs" },
        { label: "README", path: "README.rst", kind: "readme" },
      ],
    );

    expect(html).toContain('type="button" class="source-badge" data-active="true" data-source="openspec" data-kind="openspec" data-path="openspec/"');
    expect(html).toContain('data-source="beads" data-kind="beads" data-path=".beads/issues.jsonl"');
    expect(html).toContain('data-source="readme" data-kind="readme" data-path="README.rst"');
  });

  test("renders inactive source badges as non-interactive spans", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false, language: false },
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
    expect(html).toContain('title="No language glossary found in this repository"');
    expect(html).toContain('title="No docs found in this repository"');
    expect(html).toContain('title="No README found in this repository"');
  });

  test("inactive badges render as span not button per source", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: true, wai: false, docs: false, readme: false, language: false },
      [{ label: "Issues", path: ".beads/issues.jsonl", kind: "beads" }],
    );

    // openspec is inactive — must be a span with title
    expect(html).toContain('<span class="source-badge" data-active="false" title="No specs found in this repository">Specs</span>');
    // beads is active — must be a button
    expect(html).toContain('type="button" class="source-badge" data-active="true" data-source="beads"');
  });

  // Workspace view — active SPECS pill is a clickable button when openspec is detected
  test("active SPECS pill is rendered as a button when openspec source is present", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: false, wai: false, docs: false, readme: false, language: false },
      [{ label: "Specs", path: "openspec/", kind: "openspec" }],
    );

    expect(html).toContain('type="button"');
    expect(html).toContain('class="source-badge"');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-source="openspec"');
  });

  test("active SPECS pill carries openspec kind and root path for workspace routing", () => {
    const html = renderSourceBadges(
      { openspec: true, beads: false, wai: false, docs: false, readme: false, language: false },
      [{ label: "Specs", path: "openspec/", kind: "openspec" }],
    );

    expect(html).toContain('data-kind="openspec"');
    expect(html).toContain('data-path="openspec/"');
  });

  // Task 5.3 — inactive SPECS pill must not be a button (already verified above, explicit guard)
  test("inactive SPECS pill is a non-interactive span with no click affordance", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false, language: false },
      [],
    );

    const specsSpan = '<span class="source-badge" data-active="false" title="No specs found in this repository">Specs</span>';
    expect(html).toContain(specsSpan);
    // Must not appear as a button at all
    expect(html).not.toContain('<button');
  });

  test("active Language badge is a button with kind=language", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false, language: true },
      [{ label: "Language", path: ".wai/resources/ubiquitous-language/", kind: "language" }],
    );

    expect(html).toContain('type="button" class="source-badge" data-active="true" data-source="language" data-kind="language"');
    expect(html).toContain('data-path=".wai/resources/ubiquitous-language/"');
    expect(html).toContain('>Language<');
  });

  test("inactive Language badge is a span with title", () => {
    const html = renderSourceBadges(
      { openspec: false, beads: false, wai: false, docs: false, readme: false, language: false },
      [],
    );

    expect(html).toContain('<span class="source-badge" data-active="false" title="No language glossary found in this repository">Language</span>');
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
    // Single result: dir appears as section header, not as per-item path span
    expect(html).toContain('class="tree-search-section-header">docs</');
    expect(html).not.toContain('class="tree-search-path"');
  });

  test("shows '(root)' section header for a single result at the repo root", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "README.md", type: "blob", sha: "abc" },
    ];

    const html = renderTreeSearchResults(entries);

    expect(html).toContain('class="tree-search-section-header">(root)</');
    expect(html).toContain('class="tree-search-name">README.md</span>');
    expect(html).not.toContain('class="tree-search-section-header"><');
  });

  test("shows '(root)' header for root-level files when mixed with sub-dir results", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "README.md", type: "blob", sha: "abc" },
      { path: "docs/guide.md", type: "blob", sha: "def" },
    ];

    const html = renderTreeSearchResults(entries);

    expect(html).toContain('class="tree-search-section-header">(root)</');
    expect(html).toContain('class="tree-search-section-header">docs</');
    // No blank headers
    expect(html).not.toContain('class="tree-search-section-header"><');
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

  test("groups results by dir with section headers when items have different parent dirs", () => {
    const entries: GitHubTreeEntry[] = [
      { path: "openspec/specs/beads-viewer/spec.md", type: "blob", sha: "a1" },
      { path: "openspec/changes/add-reader/specs/platform/spec.md", type: "blob", sha: "a2" },
    ];

    const html = renderTreeSearchResults(entries);

    // Each dir appears as a section header
    expect(html).toContain('class="tree-search-section-header">openspec/specs</');
    expect(html).toContain('class="tree-search-section-header">openspec/changes/add-reader/specs</');

    // Items show only their name, not a per-item path span
    expect(html).toContain('class="tree-search-name">beads-viewer</span>');
    expect(html).toContain('class="tree-search-name">platform</span>');
    expect(html).not.toContain('class="tree-search-path"');
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

  test("navigateOverviewItem routes kind=openspec to the Specs/OpenSpec Workspace view", () => {
    expect(mainTs).toContain('kind === "openspec"');
    expect(mainTs).toContain('view: "specs"');
  });

  test("navigateOverviewItem routes inactive-source kinds (beads, wai, docs) without requiring openspec logic", () => {
    // Each source kind must have its own navigation branch
    expect(mainTs).toContain('kind === "beads"');
    expect(mainTs).toContain('kind === "wai"');
    expect(mainTs).toContain('kind === "docs"');
  });

  test("workspace document and file buttons route through the file view", () => {
    expect(mainTs).toContain('closest(".workspace-document-link, .workspace-file-link")');
    expect(mainTs).toContain('view: "file", path');
  });

  test("showSpecsView renders the workspace overview before fetching spec contents", () => {
    const renderIndex = mainTs.indexOf('specsContent.innerHTML = renderOpenSpecWorkspaceOverview(index);');
    const fetchIndex = mainTs.indexOf('const [specContents, tasksContents] = await Promise.all');
    expect(renderIndex).toBeGreaterThan(-1);
    expect(fetchIndex).toBeGreaterThan(-1);
    expect(renderIndex).toBeLessThan(fetchIndex);
  });
});

// Tasks 2.1-2.4 — pending-change indicators on canonical specs
describe("renderPendingChangeIndicator", () => {
  test("shows a pending-changes indicator for a canonical spec with one active change", () => {
    const html = renderPendingChangeIndicator(
      "openspec/specs/platform/spec.md",
      { platform: ["add-platform-v2"] },
      { "add-platform-v2": ["openspec/changes/add-platform-v2/proposal.md"] },
    );

    expect(html).toContain('class="pending-changes-indicator"');
    expect(html).toContain('data-path="openspec/changes/add-platform-v2/proposal.md"');
    expect(html).toContain("add-platform-v2");
  });

  test("shows multiple change links when more than one active change affects the spec", () => {
    const html = renderPendingChangeIndicator(
      "openspec/specs/platform/spec.md",
      { platform: ["add-platform-v2", "add-platform-docs"] },
      {
        "add-platform-v2": ["openspec/changes/add-platform-v2/proposal.md"],
        "add-platform-docs": ["openspec/changes/add-platform-docs/proposal.md"],
      },
    );

    expect(html).toContain('data-path="openspec/changes/add-platform-v2/proposal.md"');
    expect(html).toContain('data-path="openspec/changes/add-platform-docs/proposal.md"');
  });

  test("renders change name as plain text when the change has no proposal.md", () => {
    const html = renderPendingChangeIndicator(
      "openspec/specs/platform/spec.md",
      { platform: ["add-platform-v2"] },
      {},
    );

    expect(html).toContain("add-platform-v2");
    expect(html).not.toContain('class="pending-change-link"');
    expect(html).not.toContain("data-path=");
  });

  test("returns empty string for a canonical spec with no active changes", () => {
    const html = renderPendingChangeIndicator(
      "openspec/specs/platform/spec.md",
      {},
      {},
    );

    expect(html).toBe("");
  });

  test("returns empty string for non-canonical-spec paths", () => {
    expect(
      renderPendingChangeIndicator("README.md", { platform: ["add-platform-v2"] }, {}),
    ).toBe("");
    expect(
      renderPendingChangeIndicator(
        "openspec/changes/add-foo/specs/platform/spec.md",
        { platform: ["add-foo"] },
        {},
      ),
    ).toBe("");
    expect(
      renderPendingChangeIndicator(
        "openspec/specs/platform/design.md",
        { platform: ["add-foo"] },
        {},
      ),
    ).toBe("");
  });
});

describe("pending-change indicator wiring in main.ts", () => {
  test("showFileView renders the pending-change indicator into the DOM", () => {
    expect(mainTs).toContain("renderPendingChangeIndicator");
  });

  test("file-pending-indicator element exists in index.html", async () => {
    const indexHtml = await Bun.file("src/index.html").text();
    expect(indexHtml).toContain('id="file-pending-indicator"');
  });
});
