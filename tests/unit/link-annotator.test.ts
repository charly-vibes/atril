import { describe, expect, test } from "bun:test";
import { annotateLinks, type AnnotatedLink } from "../../src/shared/link-annotator";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: "blob" as const,
    sha: "aaa",
  }));
}

describe("annotateLinks", () => {
  const entries = tree("README.md", "docs/guide.md", "docs/api.md");
  const currentFile = "docs/guide.md";

  test("annotates resolvable links as navigable", () => {
    const result = annotateLinks(
      [{ text: "API", href: "api.md" }],
      currentFile,
      entries,
    );
    expect(result).toEqual([
      {
        text: "API",
        href: "api.md",
        resolved: { kind: "file", path: "docs/api.md" },
        status: "navigable",
      },
    ]);
  });

  test("annotates unresolvable links as unresolved", () => {
    const result = annotateLinks(
      [{ text: "Missing", href: "missing.md" }],
      currentFile,
      entries,
    );
    expect(result[0]!.status).toBe("unresolved");
    expect(result[0]!.resolved.kind).toBe("unresolved");
  });

  test("annotates external links as external", () => {
    const result = annotateLinks(
      [{ text: "Site", href: "https://example.com" }],
      currentFile,
      entries,
    );
    expect(result[0]!.status).toBe("external");
  });

  test("annotates anchor links as navigable", () => {
    const result = annotateLinks(
      [{ text: "Section", href: "#intro" }],
      currentFile,
      entries,
    );
    expect(result[0]!.status).toBe("navigable");
  });

  test("processes multiple links at once", () => {
    const result = annotateLinks(
      [
        { text: "API", href: "api.md" },
        { text: "Gone", href: "gone.md" },
        { text: "Ext", href: "https://x.com" },
      ],
      currentFile,
      entries,
    );
    expect(result.map((r) => r.status)).toEqual(["navigable", "unresolved", "external"]);
  });

  test("counts unresolved links", () => {
    const result = annotateLinks(
      [
        { text: "A", href: "a.md" },
        { text: "B", href: "b.md" },
        { text: "C", href: "api.md" },
      ],
      currentFile,
      entries,
    );
    const unresolvedCount = result.filter((r) => r.status === "unresolved").length;
    expect(unresolvedCount).toBe(2);
  });
});
