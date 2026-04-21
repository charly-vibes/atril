import { describe, expect, test } from "bun:test";
import {
  resolveIssueReferences,
  type IssueReference,
} from "../../src/shared/issue-reference";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: p.endsWith("/") ? ("tree" as const) : ("blob" as const),
    sha: "aaa",
  }));
}

const entries = tree(
  "README.md",
  "src/main.ts",
  "src/shared/router.ts",
  "docs/guide.md",
  "openspec/project.md",
  "openspec/changes/add-unified-repo-reader/proposal.md",
  "openspec/changes/add-unified-repo-reader/tasks.md",
  "openspec/specs/beads-viewer/spec.md",
  ".wai/projects/atril/config.toml",
);

describe("resolveIssueReferences", () => {
  describe("markdown links in issue text", () => {
    test("resolves markdown links to existing files", () => {
      const text = "See the [router](src/shared/router.ts) for details.";
      const refs = resolveIssueReferences(text, entries);
      expect(refs).toContainEqual(
        expect.objectContaining({
          text: "router",
          path: "src/shared/router.ts",
          status: "navigable",
        }),
      );
    });

    test("marks markdown links to missing files as unresolved", () => {
      const text = "Check [config](src/config.ts) for settings.";
      const refs = resolveIssueReferences(text, entries);
      expect(refs).toContainEqual(
        expect.objectContaining({
          text: "config",
          status: "unresolved",
        }),
      );
    });

    test("marks external links as external", () => {
      const text = "See [docs](https://example.com/docs) for more.";
      const refs = resolveIssueReferences(text, entries);
      expect(refs).toContainEqual(
        expect.objectContaining({
          text: "docs",
          status: "external",
        }),
      );
    });
  });

  describe("openspec shorthand references", () => {
    test("resolves openspec change name to change directory", () => {
      const text = "Related to openspec change add-unified-repo-reader";
      const refs = resolveIssueReferences(text, entries);
      expect(refs).toContainEqual(
        expect.objectContaining({
          text: "add-unified-repo-reader",
          path: "openspec/changes/add-unified-repo-reader/proposal.md",
          status: "navigable",
        }),
      );
    });

    test("resolves openspec spec name to spec file", () => {
      const text = "Implements spec beads-viewer";
      const refs = resolveIssueReferences(text, entries);
      expect(refs).toContainEqual(
        expect.objectContaining({
          text: "beads-viewer",
          path: "openspec/specs/beads-viewer/spec.md",
          status: "navigable",
        }),
      );
    });

    test("does not match partial words as openspec references", () => {
      const text = "The reader-component is good";
      const refs = resolveIssueReferences(text, entries);
      const specRefs = refs.filter((r) => r.path?.startsWith("openspec/"));
      expect(specRefs).toHaveLength(0);
    });
  });

  describe("mixed references", () => {
    test("extracts both markdown links and openspec references", () => {
      const text =
        "See [tasks](openspec/changes/add-unified-repo-reader/tasks.md) for change add-unified-repo-reader";
      const refs = resolveIssueReferences(text, entries);
      const navigable = refs.filter((r) => r.status === "navigable");
      expect(navigable).toHaveLength(2);
    });

    test("deduplicates references to the same path", () => {
      const text =
        "Check [proposal](openspec/changes/add-unified-repo-reader/proposal.md) for change add-unified-repo-reader";
      const refs = resolveIssueReferences(text, entries);
      const proposalRefs = refs.filter(
        (r) => r.path === "openspec/changes/add-unified-repo-reader/proposal.md",
      );
      expect(proposalRefs).toHaveLength(1);
    });
  });

  describe("graceful degradation", () => {
    test("returns empty array for text with no references", () => {
      const refs = resolveIssueReferences("Just plain text.", entries);
      expect(refs).toEqual([]);
    });

    test("returns empty array for empty text", () => {
      const refs = resolveIssueReferences("", entries);
      expect(refs).toEqual([]);
    });

    test("preserves unresolved references with original text", () => {
      const text = "See [missing feature](src/nonexistent.ts) for details.";
      const refs = resolveIssueReferences(text, entries);
      const unresolved = refs.filter((r) => r.status === "unresolved");
      expect(unresolved).toHaveLength(1);
      expect(unresolved[0]!.text).toBe("missing feature");
    });
  });
});
