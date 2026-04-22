import { describe, expect, test } from "bun:test";
import { buildWaiArtifactGroups, renderWaiOverview } from "../../src/shared/wai-overview";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function entry(path: string, type: "blob" | "tree" = "blob"): GitHubTreeEntry {
  return { path, type, sha: "abc" };
}

describe("buildWaiArtifactGroups", () => {
  test("creates PARA structure with Projects containing sub-categories", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/projects/atril/research/2026-04-20-findings.md"),
      entry(".wai/projects/atril/plans/2026-04-20-next-steps.md"),
      entry(".wai/projects/atril/handoffs/2026-04-20-session-end.md"),
      entry(".wai/resources/reflections/testing.md"),
    ]);

    expect(groups).toHaveLength(2); // Projects + Resources
    expect(groups[0].label).toBe("Projects");
    expect(groups[0].children).toHaveLength(1); // one project: atril
    expect(groups[0].children![0].label).toBe("atril");
    expect(groups[0].children![0].children).toHaveLength(3); // handoffs, research, plans

    const categories = groups[0].children![0].children!.map((c) => c.label);
    expect(categories).toEqual(["Handoffs", "Research", "Plans"]);

    expect(groups[1].label).toBe("Resources");
    expect(groups[1].paths).toHaveLength(1);
  });

  test("filters out internal files", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/.gitignore"),
      entry(".wai/.pipeline-run"),
      entry(".wai/projects/atril/.state"),
      entry(".wai/pipeline-runs/ticket-cycle.yml"),
      entry(".wai/resources/agent-config/skills/commit/SKILL.md"),
      entry(".wai/resources/pipelines/ticket-cycle.toml"),
      entry(".wai/projects/atril/research/2026-04-20-findings.md"),
    ]);

    expect(groups).toHaveLength(1); // only Projects
    const allPaths = groups[0].children![0].children![0].paths;
    expect(allPaths).toHaveLength(1);
    expect(allPaths[0]).toBe(".wai/projects/atril/research/2026-04-20-findings.md");
  });

  test("returns empty for no wai artifacts", () => {
    expect(buildWaiArtifactGroups([entry("README.md")])).toEqual([]);
  });

  test("includes areas and archive sections when present", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/areas/ops/runbook.md"),
      entry(".wai/archive/old-project/notes.md"),
      entry(".wai/resources/reflections/testing.md"),
    ]);

    expect(groups.map((g) => g.label)).toEqual(["Areas", "Resources", "Archive"]);
  });
});

describe("renderWaiOverview", () => {
  test("renders readable titles from filenames", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/projects/atril/research/2026-04-20-implemented-link-resolver.md"),
    ]);
    const html = renderWaiOverview(groups);

    expect(html).toContain("Implemented link resolver");
    expect(html).toContain('class="wai-artifact-name">Implemented link resolver</span>');
    expect(html).not.toContain('class="wai-artifact-name">2026');
  });

  test("renders nested PARA headings", () => {
    const groups = buildWaiArtifactGroups([
      entry(".wai/projects/atril/research/2026-04-20-findings.md"),
    ]);
    const html = renderWaiOverview(groups);

    expect(html).toContain("<h3>Projects</h3>");
    expect(html).toContain("<h4>atril</h4>");
    expect(html).toContain("<h5>Research</h5>");
  });

  test("renders empty state when no artifacts", () => {
    const html = renderWaiOverview([]);
    expect(html).toContain("No WAI artifacts available");
  });
});
