import { describe, expect, test } from "bun:test";
import { detectKnowledgeSources, suggestEntryPoints } from "../../src/shared/repo-overview";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: (p.includes(".") ? "blob" : "tree") as "blob" | "tree",
    sha: "abc",
  }));
}

describe("scenario: repository with all knowledge sources", () => {
  const entries = tree(
    "README.md",
    "openspec/project.md",
    "openspec/specs/platform/spec.md",
    ".beads/issues.jsonl",
    ".wai/config.toml",
    ".wai/projects/atril/research/findings.md",
    "docs/tutorials/getting-started.md",
    "src/main.ts",
  );

  test("detects all sources", () => {
    const s = detectKnowledgeSources(entries);
    expect(s).toEqual({ openspec: true, beads: true, wai: true, docs: true, readme: true, language: false });
  });

  test("suggests specs first and README last", () => {
    const s = detectKnowledgeSources(entries);
    const suggestions = suggestEntryPoints(s, entries);
    expect(suggestions.map((entry) => entry.kind)).toEqual([
      "tree",
      "beads",
      "wai",
      "docs",
      "readme",
    ]);
    // language is absent from this repo (no context files)
  });
});

describe("scenario: repository with only beads", () => {
  const entries = tree(
    ".beads/issues.jsonl",
    "src/index.ts",
    "package.json",
  );

  test("detects only beads", () => {
    const s = detectKnowledgeSources(entries);
    expect(s.beads).toBe(true);
    expect(s.openspec).toBe(false);
    expect(s.wai).toBe(false);
    expect(s.docs).toBe(false);
    expect(s.readme).toBe(false);
  });

  test("suggests issues only", () => {
    const s = detectKnowledgeSources(entries);
    const suggestions = suggestEntryPoints(s, entries);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0]!.kind).toBe("beads");
  });
});

describe("scenario: repository with no structured knowledge", () => {
  const entries = tree("src/main.rs", "Cargo.toml", "LICENSE");

  test("detects nothing", () => {
    const s = detectKnowledgeSources(entries);
    expect(s).toEqual({ openspec: false, beads: false, wai: false, docs: false, readme: false, language: false });
  });

  test("suggests nothing", () => {
    const s = detectKnowledgeSources(entries);
    const suggestions = suggestEntryPoints(s, entries);
    expect(suggestions).toEqual([]);
  });
});

describe("scenario: repository with only README and docs", () => {
  const entries = tree(
    "README.md",
    "docs/index.md",
    "docs/api.md",
    "lib/core.js",
  );

  test("detects readme and docs", () => {
    const s = detectKnowledgeSources(entries);
    expect(s.readme).toBe(true);
    expect(s.docs).toBe(true);
    expect(s.openspec).toBe(false);
    expect(s.beads).toBe(false);
    expect(s.wai).toBe(false);
  });

  test("suggests docs before README", () => {
    const s = detectKnowledgeSources(entries);
    const suggestions = suggestEntryPoints(s, entries);
    expect(suggestions.length).toBe(2);
    expect(suggestions.map((s) => s.kind)).toEqual(["docs", "readme"]);
  });
});
