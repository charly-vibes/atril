import { describe, expect, test } from "bun:test";
import { buildWaiArtifactGroups, renderWaiOverview } from "../../src/shared/wai-overview";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function entry(path: string, type: "blob" | "tree" = "blob"): GitHubTreeEntry {
  return { path, type, sha: "abc" };
}

describe("buildWaiArtifactGroups (OpenSpec add-unified-repo-reader:4.1)", () => {
  test("groups project artifacts together and keeps shared artifacts browsable by location", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai", "tree"),
      entry(".wai/config.toml"),
      entry(".wai/projects/atril/research/2026-04-20-findings.md"),
      entry(".wai/projects/atril/plan/2026-04-20-next-steps.md"),
      entry(".wai/projects/ops/design/2026-04-18-indexing.md"),
      entry(".wai/resources/reflections/testing.md"),
      entry(".wai/inbox.org"),
    ]);

    expect(groups).toEqual([
      {
        id: "project:atril",
        label: "Project: atril",
        mode: "project",
        paths: [
          ".wai/projects/atril/plan/2026-04-20-next-steps.md",
          ".wai/projects/atril/research/2026-04-20-findings.md",
        ],
      },
      {
        id: "project:ops",
        label: "Project: ops",
        mode: "project",
        paths: [".wai/projects/ops/design/2026-04-18-indexing.md"],
      },
      {
        id: "location:resources",
        label: "Shared resources",
        mode: "location",
        paths: [".wai/resources/reflections/testing.md"],
      },
      {
        id: "location:root",
        label: "Workspace root",
        mode: "location",
        paths: [".wai/inbox.org"],
      },
    ]);
  });

  test("returns no browse groups when .wai is missing", () => {
    expect(buildWaiArtifactGroups([entry("README.md")])).toEqual([]);
  });

  test("returns no browse groups when .wai has only structural files", () => {
    expect(buildWaiArtifactGroups([entry(".wai", "tree"), entry(".wai/config.toml")])).toEqual([]);
  });
});

describe("WAI artifact history navigation (OpenSpec add-unified-repo-reader:5.3)", () => {
  test("renders a history action for each artifact alongside the existing file link", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/projects/atril/research/2026-04-20-findings.md"),
    ]);
    const html = renderWaiOverview(groups);

    expect(html).toContain('class="wai-artifact-history"');
    expect(html).toContain('data-path=".wai/projects/atril/research/2026-04-20-findings.md"');
  });

  test("does not render history actions when no artifacts exist", () => {
    const html = renderWaiOverview([]);
    expect(html).not.toContain('class="wai-artifact-history"');
  });
});
