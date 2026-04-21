import { describe, expect, test } from "bun:test";
import {
  detectKnowledgeSources,
  suggestEntryPoints,
  type KnowledgeSources,
} from "../../src/shared/repo-overview";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: (p.includes(".") ? "blob" : "tree") as "blob" | "tree",
    sha: "abc",
  }));
}

describe("detectKnowledgeSources", () => {
  test("detects openspec, beads, wai, and docs", () => {
    const entries = tree(
      "openspec/project.md",
      "openspec/specs/platform/spec.md",
      ".beads/issues.jsonl",
      ".wai/config.toml",
      "docs/index.md",
      "README.md",
      "src/main.ts",
    );
    const sources = detectKnowledgeSources(entries);

    expect(sources.openspec).toBe(true);
    expect(sources.beads).toBe(true);
    expect(sources.wai).toBe(true);
    expect(sources.docs).toBe(true);
    expect(sources.readme).toBe(true);
  });

  test("returns false for missing sources", () => {
    const entries = tree("src/main.ts", "package.json");
    const sources = detectKnowledgeSources(entries);

    expect(sources.openspec).toBe(false);
    expect(sources.beads).toBe(false);
    expect(sources.wai).toBe(false);
    expect(sources.docs).toBe(false);
    expect(sources.readme).toBe(false);
  });

  test("detects README variants", () => {
    const entries = tree("README.rst");
    const sources = detectKnowledgeSources(entries);
    expect(sources.readme).toBe(true);
  });

  test("detects a top-level .wai directory entry", () => {
    const entries: GitHubTreeEntry[] = [
      { path: ".wai", type: "tree", sha: "abc" },
      { path: "src/main.ts", type: "blob", sha: "def" },
    ];

    const sources = detectKnowledgeSources(entries);

    expect(sources.wai).toBe(true);
  });

  test("handles empty tree", () => {
    const sources = detectKnowledgeSources([]);
    expect(sources.openspec).toBe(false);
    expect(sources.beads).toBe(false);
    expect(sources.wai).toBe(false);
    expect(sources.docs).toBe(false);
    expect(sources.readme).toBe(false);
  });
});

describe("suggestEntryPoints", () => {
  test("suggests README when present", () => {
    const entries = tree("README.md", "src/main.ts");
    const sources: KnowledgeSources = {
      openspec: false,
      beads: false,
      wai: false,
      docs: false,
      readme: true,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions.some((s) => s.path === "README.md")).toBe(true);
  });

  test("suggests openspec project.md when openspec present", () => {
    const entries = tree("openspec/project.md", "openspec/specs/platform/spec.md");
    const sources: KnowledgeSources = {
      openspec: true,
      beads: false,
      wai: false,
      docs: false,
      readme: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions.some((s) => s.path === "openspec/project.md")).toBe(true);
  });

  test("suggests beads issues when beads present", () => {
    const entries = tree(".beads/issues.jsonl");
    const sources: KnowledgeSources = {
      openspec: false,
      beads: true,
      wai: false,
      docs: false,
      readme: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions.some((s) => s.label.toLowerCase().includes("issue"))).toBe(true);
  });

  test("returns empty for repos with no knowledge sources", () => {
    const entries = tree("src/main.ts", "package.json");
    const sources: KnowledgeSources = {
      openspec: false,
      beads: false,
      wai: false,
      docs: false,
      readme: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([]);
  });
});
