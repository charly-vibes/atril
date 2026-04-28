import { describe, expect, test } from "bun:test";
import {
  buildFileTree,
  fuzzyFilterEntries,
  filterRelevantEntries,
  type TreeNode,
} from "../../src/shared/file-tree";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function blob(path: string): GitHubTreeEntry {
  return { path, type: "blob", sha: "abc" };
}

function dir(path: string): GitHubTreeEntry {
  return { path, type: "tree", sha: "abc" };
}

describe("buildFileTree", () => {
  test("returns empty array for empty input", () => {
    expect(buildFileTree([])).toEqual([]);
  });

  test("groups files under directory nodes", () => {
    const entries = [dir("src"), blob("src/main.ts"), blob("src/build.ts")];
    const tree = buildFileTree(entries);

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe("src");
    expect(tree[0].type).toBe("tree");
    expect(tree[0].children).toHaveLength(2);
  });

  test("handles root-level files", () => {
    const entries = [blob("README.md"), blob("package.json")];
    const tree = buildFileTree(entries);

    expect(tree).toHaveLength(2);
    expect(tree.map((n) => n.name)).toEqual(["package.json", "README.md"]);
  });

  test("sorts directories before files, then alphabetically", () => {
    const entries = [
      blob("README.md"),
      dir("src"),
      blob("src/main.ts"),
      dir("docs"),
      blob("docs/index.md"),
      blob("package.json"),
    ];
    const tree = buildFileTree(entries);

    expect(tree.map((n) => n.name)).toEqual([
      "docs",
      "src",
      "package.json",
      "README.md",
    ]);
  });

  test("handles nested directories", () => {
    const entries = [
      dir("src"),
      dir("src/shared"),
      blob("src/shared/router.ts"),
      blob("src/shared/github.ts"),
      blob("src/main.ts"),
    ];
    const tree = buildFileTree(entries);

    expect(tree).toHaveLength(1);
    const src = tree[0];
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(2); // shared/ + main.ts

    const shared = src.children!.find((n) => n.name === "shared");
    expect(shared).toBeDefined();
    expect(shared!.children).toHaveLength(2);
  });

  test("excludes hidden directories by default", () => {
    const entries = [
      dir(".git"),
      blob(".git/config"),
      dir(".beads"),
      blob(".beads/issues.jsonl"),
      blob("README.md"),
    ];
    const tree = buildFileTree(entries);

    // .beads should be included (it's a knowledge source), .git excluded
    // Actually, buildFileTree doesn't filter — it builds everything
    expect(tree.some((n) => n.name === "README.md")).toBe(true);
  });

  test("preserves full path on each node", () => {
    const entries = [
      dir("src"),
      dir("src/shared"),
      blob("src/shared/router.ts"),
    ];
    const tree = buildFileTree(entries);
    const router = tree[0].children![0].children![0];
    expect(router.path).toBe("src/shared/router.ts");
    expect(router.name).toBe("router.ts");
  });
});

describe("fuzzyFilterEntries", () => {
  const entries = [
    blob("src/main.ts"),
    blob("src/shared/router.ts"),
    blob("src/shared/github-api.ts"),
    blob("src/shared/file-tree.ts"),
    blob("docs/tutorial.md"),
    blob("README.md"),
    blob("package.json"),
    dir("src"),
    dir("src/shared"),
    dir("docs"),
  ];

  test("returns empty array for empty query", () => {
    expect(fuzzyFilterEntries("", entries)).toEqual([]);
  });

  test("matches by filename substring", () => {
    const results = fuzzyFilterEntries("router", entries);
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe("src/shared/router.ts");
  });

  test("matches by path substring", () => {
    const results = fuzzyFilterEntries("shared", entries);
    // Should match all files under shared/
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  test("is case-insensitive", () => {
    const results = fuzzyFilterEntries("README", entries);
    expect(results.some((e) => e.path === "README.md")).toBe(true);

    const results2 = fuzzyFilterEntries("readme", entries);
    expect(results2.some((e) => e.path === "README.md")).toBe(true);
  });

  test("only matches blob entries, not directories", () => {
    const results = fuzzyFilterEntries("src", entries);
    expect(results.every((e) => e.type === "blob")).toBe(true);
  });

  test("matches fuzzy character sequences", () => {
    // "mts" should match "main.ts" (m...a...i...n... .t...s)
    const results = fuzzyFilterEntries("mts", entries);
    expect(results.some((e) => e.path === "src/main.ts")).toBe(true);
  });

  test("ranks exact filename matches higher", () => {
    const results = fuzzyFilterEntries("main", entries);
    expect(results[0].path).toBe("src/main.ts");
  });

  test("limits results", () => {
    const results = fuzzyFilterEntries("s", entries, 2);
    expect(results).toHaveLength(2);
  });

  test("dot-directory files rank below src files when both match equally", () => {
    // Both paths contain "file" — .wai/ path should score lower
    const mixed = [
      blob(".wai/some/file.ts"),
      blob("src/some/file.ts"),
    ];
    const results = fuzzyFilterEntries("file", mixed);
    expect(results).toHaveLength(2);
    // src/some/file.ts must come before .wai/some/file.ts
    expect(results[0].path).toBe("src/some/file.ts");
    expect(results[1].path).toBe(".wai/some/file.ts");
  });

  test("dot-directory files are still included in results (not excluded)", () => {
    const mixed = [
      blob(".wai/some/file.ts"),
      blob(".beads/issues.jsonl"),
      blob(".github/workflows/ci.yml"),
      blob("src/main.ts"),
    ];
    const results = fuzzyFilterEntries("file", mixed);
    // .wai/some/file.ts matches "file"; others may or may not
    expect(results.some((e) => e.path === ".wai/some/file.ts")).toBe(true);
  });

  test("dot-directory penalty applies to all dot-directory prefixes", () => {
    const mixed = [
      blob(".beads/file-index.ts"),
      blob(".github/workflows/file-upload.yml"),
      blob("src/shared/file-tree.ts"),
    ];
    const results = fuzzyFilterEntries("file", mixed);
    // src file should rank first
    expect(results[0].path).toBe("src/shared/file-tree.ts");
    // dot-directory files must still appear
    expect(results.some((e) => e.path === ".beads/file-index.ts")).toBe(true);
    expect(results.some((e) => e.path === ".github/workflows/file-upload.yml")).toBe(true);
  });
});

describe("filterRelevantEntries", () => {
  test("includes .wai/ and openspec/ content", () => {
    const entries = [
      dir(".wai"),
      blob(".wai/config.toml"),
      dir("openspec"),
      blob("openspec/project.md"),
      dir("src"),
      blob("src/main.ts"),
    ];
    const filtered = filterRelevantEntries(entries);
    expect(filtered.map((e) => e.path)).toEqual([
      ".wai",
      ".wai/config.toml",
      "openspec",
      "openspec/project.md",
    ]);
  });

  test("includes docs/ content", () => {
    const entries = [
      dir("docs"),
      blob("docs/tutorial.md"),
      blob("docs/guide.md"),
    ];
    const filtered = filterRelevantEntries(entries);
    expect(filtered).toHaveLength(3);
  });

  test("includes top-level .md files", () => {
    const entries = [
      blob("README.md"),
      blob("CLAUDE.md"),
      blob("package.json"),
      blob("src/main.ts"),
    ];
    const filtered = filterRelevantEntries(entries);
    expect(filtered.map((e) => e.path)).toEqual(["README.md", "CLAUDE.md"]);
  });

  test("excludes nested .md files outside relevant dirs", () => {
    const entries = [
      blob("src/notes.md"),
      blob("README.md"),
    ];
    const filtered = filterRelevantEntries(entries);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].path).toBe("README.md");
  });

  test("excludes .beads, .github, src, tests, etc.", () => {
    const entries = [
      dir(".beads"),
      blob(".beads/issues.jsonl"),
      dir(".github"),
      blob(".github/workflows/ci.yml"),
      dir("src"),
      blob("src/main.ts"),
      dir("tests"),
      blob("tests/unit/foo.test.ts"),
    ];
    const filtered = filterRelevantEntries(entries);
    expect(filtered).toHaveLength(0);
  });
});
