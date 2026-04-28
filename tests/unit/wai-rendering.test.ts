import { describe, expect, test } from "bun:test";
import { renderWaiOverview, renderLanguageEntry } from "../../src/shared/wai-overview";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function blob(path: string): GitHubTreeEntry {
  return { path, type: "blob", sha: "abc" };
}

function dir(path: string): GitHubTreeEntry {
  return { path, type: "tree", sha: "abc" };
}

describe("renderWaiOverview", () => {
  test("renders PARA sections with nested project groups", () => {
    const html = renderWaiOverview([
      {
        id: "para:projects",
        label: "Projects",
        mode: "project",
        paths: [],
        children: [
          {
            id: "project:atril",
            label: "atril",
            mode: "project",
            paths: [],
            children: [
              {
                id: "project:atril:research",
                label: "Research",
                mode: "project",
                paths: [".wai/projects/atril/research/2026-04-20-findings.md"],
              },
            ],
          },
        ],
      },
      {
        id: "para:resources",
        label: "Resources",
        mode: "location",
        paths: [".wai/resources/reflections/testing.md"],
      },
    ]);

    expect(html).toContain("Projects");
    expect(html).toContain("atril");
    expect(html).toContain("Research");
    expect(html).toContain("Findings");
    expect(html).toContain("Resources");
    expect(html).toContain("Testing");
  });

  test("renders an empty state when no artifacts", () => {
    const html = renderWaiOverview([]);
    expect(html).toContain("No WAI artifacts available");
  });
});

describe("renderLanguageEntry", () => {
  test("returns a Language button when index file is present", () => {
    const entries: GitHubTreeEntry[] = [
      dir(".wai/resources/ubiquitous-language"),
      blob(".wai/resources/ubiquitous-language/README.md"),
    ];
    const html = renderLanguageEntry(entries);
    expect(html).toContain("Language");
    expect(html).toContain('data-kind="language"');
  });

  test("returns empty string when index file is absent", () => {
    const entries: GitHubTreeEntry[] = [
      dir(".wai/resources"),
      blob(".wai/resources/reflections/testing.md"),
    ];
    expect(renderLanguageEntry(entries)).toBe("");
  });

  test("returns empty string for an empty tree", () => {
    expect(renderLanguageEntry([])).toBe("");
  });
});
