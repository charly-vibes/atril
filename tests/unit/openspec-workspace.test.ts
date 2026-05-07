import { describe, expect, test } from "bun:test";
import { renderOpenSpecWorkspaceOverview, parseTaskSummary } from "../../src/shared/openspec-workspace";
import { buildOpenSpecIndex } from "../../src/shared/openspec-index";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((path) => ({ path, type: "blob" as const, sha: "aaa" }));
}

describe("renderOpenSpecWorkspaceOverview", () => {
  test("renders the OpenSpec workspace landing sections with counts", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/project.md",
      "openspec/AGENTS.md",
      "openspec/specs/platform/spec.md",
      "openspec/specs/spec-viewer/spec.md",
      "openspec/changes/add-reader/proposal.md",
      "openspec/changes/archive/2026-01-01-add-platform/proposal.md",
      "openspec/notes.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain("OpenSpec Workspace");
    expect(html).toContain("Project");
    expect(html).toContain("2 documents");
    expect(html).toContain('type="button" class="workspace-document-link" data-path="openspec/AGENTS.md"');
    expect(html).toContain('type="button" class="workspace-document-link" data-path="openspec/project.md"');
    expect(html).toContain("Specs");
    expect(html).toContain("2 capabilities");
    expect(html).toContain("Changes");
    expect(html).toContain("1 active change");
    expect(html).toContain("Archive");
    expect(html).toContain("1 archived change");
    expect(html).toContain("Files");
    expect(html).toContain("7 workspace files");
    expect(html).toContain('type="button" class="workspace-file-link" data-path="openspec/notes.md"');
    expect(html).toContain('type="button" class="workspace-file-link" data-path="openspec/AGENTS.md"');
  });

  test("renders explicit empty states for partial OpenSpec workspaces", () => {
    const index = buildOpenSpecIndex(tree("openspec/AGENTS.md"));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain("No project.md yet");
    expect(html).toContain('data-path="openspec/AGENTS.md"');
    expect(html).toContain("No current specs found");
    expect(html).toContain("No active changes found");
    expect(html).toContain("No archived changes found");
  });

  test("does not show AGENTS.md under Project documents when absent", () => {
    const index = buildOpenSpecIndex(tree("openspec/project.md"));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain('data-path="openspec/project.md"');
    expect(html).not.toContain('data-path="openspec/AGENTS.md"');
  });

  test("renders raw workspace files even when no semantic OpenSpec sections exist", () => {
    const index = buildOpenSpecIndex(tree("openspec/support/reviewer-notes.md"));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain("No project.md yet");
    expect(html).toContain("No current specs found");
    expect(html).toContain("1 workspace file");
    expect(html).toContain('type="button" class="workspace-file-link" data-path="openspec/support/reviewer-notes.md"');
  });

  test("keeps the rendered specs bundle under the Specs section", () => {
    const index = buildOpenSpecIndex(tree("openspec/specs/platform/spec.md"));

    const html = renderOpenSpecWorkspaceOverview(index, {
      renderedSpecsHtml: '<section id="spec-platform"><h1>Platform</h1></section>',
    });

    expect(html).toContain('<section class="workspace-specs-bundle"');
    expect(html).toContain('id="spec-platform"');
    expect(html).toContain("Platform");
  });
});

describe("renderOpenSpecWorkspaceOverview — first-class changes", () => {
  test("renders grouped document links for a complete change", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/my-change/proposal.md",
      "openspec/changes/my-change/tasks.md",
      "openspec/changes/my-change/design.md",
      "openspec/changes/my-change/specs/platform/spec.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain('data-change-id="my-change"');
    expect(html).toContain('data-path="openspec/changes/my-change/proposal.md"');
    expect(html).toContain('data-path="openspec/changes/my-change/tasks.md"');
    expect(html).toContain('data-path="openspec/changes/my-change/design.md"');
    expect(html).toContain('data-path="openspec/changes/my-change/specs/platform/spec.md"');
  });

  test("shows missing-doc indicator when proposal.md is absent", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/incomplete/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain('data-change-id="incomplete"');
    expect(html).toContain("change-doc-missing");
    expect(html).toContain("proposal.md");
    expect(html).not.toContain('data-path="openspec/changes/incomplete/proposal.md"');
  });

  test("shows missing-doc indicator when tasks.md is absent", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/incomplete/proposal.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain("change-doc-missing");
    expect(html).toContain("tasks.md");
    expect(html).not.toContain('data-path="openspec/changes/incomplete/tasks.md"');
  });

  test("omits design.md when not present in change files", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/my-change/proposal.md",
      "openspec/changes/my-change/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).not.toContain("design.md");
  });

  test("shows task completion summary when taskSummaries option is provided", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/my-change/proposal.md",
      "openspec/changes/my-change/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index, {
      taskSummaries: { "my-change": { done: 3, total: 10 } },
    });

    expect(html).toContain("3/10");
  });

  test("shows no task summary when taskSummaries option is not provided", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/my-change/proposal.md",
      "openspec/changes/my-change/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).not.toContain("tasks complete");
    expect(html).not.toContain("tasks document available");
  });

  test("shows non-numeric task availability when tasks.md has no parseable checkboxes", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/my-change/proposal.md",
      "openspec/changes/my-change/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index, {
      taskSummaries: { "my-change": null },
    });

    expect(html).toContain("tasks document available");
    expect(html).not.toContain("tasks complete");
  });

  test("renders multiple change cards when multiple changes exist", () => {
    const index = buildOpenSpecIndex(tree(
      "openspec/changes/change-a/proposal.md",
      "openspec/changes/change-a/tasks.md",
      "openspec/changes/change-b/proposal.md",
      "openspec/changes/change-b/tasks.md",
    ));

    const html = renderOpenSpecWorkspaceOverview(index);

    expect(html).toContain('data-change-id="change-a"');
    expect(html).toContain('data-change-id="change-b"');
  });
});

describe("parseTaskSummary", () => {
  test("counts checked and total checkboxes", () => {
    const content = "- [x] Task 1\n- [ ] Task 2\n- [x] Task 3\n- [ ] Task 4";
    expect(parseTaskSummary(content)).toEqual({ done: 2, total: 4 });
  });

  test("returns null when content has no checkboxes", () => {
    expect(parseTaskSummary("# Section\n\nSome text with no tasks.")).toBeNull();
  });

  test("returns null for malformed checklists that are not markdown checkboxes", () => {
    const content = "1. done\n2. todo\n- [] not valid\n- [maybe] not valid";
    expect(parseTaskSummary(content)).toBeNull();
  });

  test("returns null for empty content", () => {
    expect(parseTaskSummary("")).toBeNull();
  });

  test("counts all done when every checkbox is checked", () => {
    const content = "- [x] A\n- [x] B\n- [x] C";
    expect(parseTaskSummary(content)).toEqual({ done: 3, total: 3 });
  });

  test("is case-insensitive for the X marker", () => {
    const content = "- [X] Task 1\n- [ ] Task 2";
    expect(parseTaskSummary(content)).toEqual({ done: 1, total: 2 });
  });
});
