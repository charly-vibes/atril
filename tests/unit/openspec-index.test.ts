import { describe, expect, test } from "bun:test";
import {
  buildOpenSpecIndex,
  type OpenSpecIndex,
} from "../../src/shared/openspec-index";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: p.endsWith("/") ? ("tree" as const) : ("blob" as const),
    sha: "aaa",
  }));
}

describe("buildOpenSpecIndex", () => {
  test("detects capabilities from specs directory", () => {
    const entries = tree(
      "openspec/specs/platform/spec.md",
      "openspec/specs/spec-viewer/spec.md",
      "openspec/specs/spec-viewer/design.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.capabilities).toEqual(["platform", "spec-viewer"]);
  });

  test("detects active changes from changes directory", () => {
    const entries = tree(
      "openspec/changes/add-unified-repo-reader/proposal.md",
      "openspec/changes/add-unified-repo-reader/tasks.md",
      "openspec/changes/update-design-system/proposal.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.changes).toEqual(["add-unified-repo-reader", "update-design-system"]);
  });

  test("detects archived changes", () => {
    const entries = tree(
      "openspec/changes/archive/2026-01-15-add-initial-platform/proposal.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.archivedChanges).toEqual(["2026-01-15-add-initial-platform"]);
  });

  test("maps change delta specs to affected capabilities", () => {
    const entries = tree(
      "openspec/specs/platform/spec.md",
      "openspec/specs/spec-viewer/spec.md",
      "openspec/changes/add-unified-repo-reader/proposal.md",
      "openspec/changes/add-unified-repo-reader/specs/platform/spec.md",
      "openspec/changes/add-unified-repo-reader/specs/spec-viewer/spec.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.changeAffects["add-unified-repo-reader"]).toEqual(["platform", "spec-viewer"]);
    expect(index.capabilityAffectedBy["platform"]).toContain("add-unified-repo-reader");
    expect(index.capabilityAffectedBy["spec-viewer"]).toContain("add-unified-repo-reader");
  });

  test("excludes archived delta specs from the active capability mapping", () => {
    const entries = tree(
      "openspec/specs/platform/spec.md",
      "openspec/changes/add-reader/specs/platform/spec.md",
      "openspec/changes/archive/2026-01-15-add-legacy-nav/specs/platform/spec.md",
    );

    const index = buildOpenSpecIndex(entries);

    expect(index.changeAffects["add-reader"]).toEqual(["platform"]);
    expect(index.capabilityAffectedBy["platform"]).toEqual(["add-reader"]);
    expect(index.changeAffects["2026-01-15-add-legacy-nav"]).toBeUndefined();
  });

  test("returns empty index when no openspec directory exists", () => {
    const entries = tree("README.md", "src/index.ts");
    const index = buildOpenSpecIndex(entries);
    expect(index.capabilities).toEqual([]);
    expect(index.changes).toEqual([]);
    expect(index.archivedChanges).toEqual([]);
  });

  test("builds artifact paths for a capability", () => {
    const entries = tree(
      "openspec/specs/platform/spec.md",
      "openspec/specs/platform/design.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.capabilityFiles["platform"]).toEqual([
      "openspec/specs/platform/spec.md",
      "openspec/specs/platform/design.md",
    ]);
  });

  test("builds artifact paths for a change", () => {
    const entries = tree(
      "openspec/changes/add-reader/proposal.md",
      "openspec/changes/add-reader/tasks.md",
      "openspec/changes/add-reader/design.md",
      "openspec/changes/add-reader/specs/platform/spec.md",
    );
    const index = buildOpenSpecIndex(entries);
    expect(index.changeFiles["add-reader"]).toContain("openspec/changes/add-reader/proposal.md");
    expect(index.changeFiles["add-reader"]).toContain("openspec/changes/add-reader/tasks.md");
    expect(index.changeFiles["add-reader"]).toContain("openspec/changes/add-reader/design.md");
    expect(index.changeFiles["add-reader"]).toContain("openspec/changes/add-reader/specs/platform/spec.md");
  });

  test("detects new specs introduced by a change", () => {
    const entries = tree(
      "openspec/changes/add-reader/specs/repo-overview/spec.md",
    );
    // repo-overview doesn't exist in openspec/specs/, so it's a new capability
    const index = buildOpenSpecIndex(entries);
    expect(index.changeIntroduces["add-reader"]).toEqual(["repo-overview"]);
  });
});
