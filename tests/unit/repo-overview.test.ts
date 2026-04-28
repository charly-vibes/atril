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
    expect(sources.language).toBe(false);
  });

  test("detects language when context .md files are present", () => {
    const entries: GitHubTreeEntry[] = [
      { path: ".wai/resources/ubiquitous-language/contexts/navigation.md", type: "blob", sha: "a1" },
    ];
    const sources = detectKnowledgeSources(entries);
    expect(sources.language).toBe(true);
  });

  test("does not detect language from directory entries or non-context paths", () => {
    const entries: GitHubTreeEntry[] = [
      { path: ".wai/resources/ubiquitous-language/contexts", type: "tree", sha: "a1" },
      { path: ".wai/resources/ubiquitous-language/README.md", type: "blob", sha: "a2" },
    ];
    const sources = detectKnowledgeSources(entries);
    expect(sources.language).toBe(false);
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
      language: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([
      { label: "README", path: "README.md", kind: "readme" },
    ]);
  });

  test("suggests specs tree when openspec present", () => {
    const entries = tree("openspec/project.md", "openspec/specs/platform/spec.md");
    const sources: KnowledgeSources = {
      openspec: true,
      beads: false,
      wai: false,
      docs: false,
      readme: false,
      language: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([
      { label: "Specs", path: "openspec/specs/", kind: "tree" },
    ]);
  });

  test("suggests beads issues when beads present", () => {
    const entries = tree(".beads/issues.jsonl");
    const sources: KnowledgeSources = {
      openspec: false,
      beads: true,
      wai: false,
      docs: false,
      readme: false,
      language: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([
      { label: "Issues", path: ".beads/issues.jsonl", kind: "beads" },
    ]);
  });

  test("returns empty for repos with no knowledge sources", () => {
    const entries = tree("src/main.ts", "package.json");
    const sources: KnowledgeSources = {
      openspec: false,
      beads: false,
      wai: false,
      docs: false,
      readme: false,
      language: false,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([]);
  });

  test("suggests language when language contexts are present", () => {
    const entries: GitHubTreeEntry[] = [
      { path: ".wai/resources/ubiquitous-language/contexts/navigation.md", type: "blob", sha: "a1" },
    ];
    const sources: KnowledgeSources = {
      openspec: false,
      beads: false,
      wai: false,
      docs: false,
      readme: false,
      language: true,
    };
    const suggestions = suggestEntryPoints(sources, entries);
    expect(suggestions).toEqual([
      { label: "Language", path: ".wai/resources/ubiquitous-language/", kind: "language" },
    ]);
  });
});
