import { describe, expect, test } from "bun:test";
import { resolveLink, extractLinks } from "../../src/shared/link-resolver";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

/** Helper to build a minimal tree from path strings. */
function tree(...paths: string[]): GitHubTreeEntry[] {
  return paths.map((p) => ({
    path: p,
    type: p.endsWith("/") ? ("tree" as const) : ("blob" as const),
    sha: "aaa",
  }));
}

describe("resolveLink", () => {
  const entries = tree(
    "README.md",
    "docs/guide.md",
    "docs/api.md",
    "docs/images/logo.png",
    "src/index.ts",
    "openspec/project.md",
  );

  describe("relative paths", () => {
    test("resolves sibling file from current directory", () => {
      const result = resolveLink("api.md", "docs/guide.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("docs/api.md");
    });

    test("resolves parent-relative path", () => {
      const result = resolveLink("../README.md", "docs/guide.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("README.md");
    });

    test("resolves deeper relative path", () => {
      const result = resolveLink("images/logo.png", "docs/guide.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("docs/images/logo.png");
    });

    test("resolves root-relative path starting with /", () => {
      const result = resolveLink("/src/index.ts", "docs/guide.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("src/index.ts");
    });

    test("returns unresolved for missing target", () => {
      const result = resolveLink("missing.md", "docs/guide.md", entries);
      expect(result.kind).toBe("unresolved");
    });

    test("returns unresolved for path escaping repo root", () => {
      const result = resolveLink("../../etc/passwd", "docs/guide.md", entries);
      expect(result.kind).toBe("unresolved");
    });

    test("handles multi-level .. traversal correctly", () => {
      const deepEntries = tree("a/b/c.md", "d.md");
      const result = resolveLink("../../d.md", "a/b/c.md", deepEntries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("d.md");
    });

    test("returns unresolved for empty href", () => {
      const result = resolveLink("", "docs/guide.md", entries);
      expect(result.kind).toBe("unresolved");
    });
  });

  describe("anchor links", () => {
    test("resolves same-document anchor", () => {
      const result = resolveLink("#requirements", "docs/guide.md", entries);
      expect(result.kind).toBe("anchor");
      expect(result.anchor).toBe("requirements");
      expect(result.path).toBe("docs/guide.md");
    });

    test("resolves file + anchor combination", () => {
      const result = resolveLink("api.md#usage", "docs/guide.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("docs/api.md");
      expect(result.anchor).toBe("usage");
    });

    test("file + anchor returns unresolved when file missing", () => {
      const result = resolveLink("gone.md#section", "docs/guide.md", entries);
      expect(result.kind).toBe("unresolved");
    });
  });

  describe("external links", () => {
    test("treats absolute http URL as external", () => {
      const result = resolveLink("https://example.com", "docs/guide.md", entries);
      expect(result.kind).toBe("external");
    });

    test("treats mailto as external", () => {
      const result = resolveLink("mailto:a@b.com", "docs/guide.md", entries);
      expect(result.kind).toBe("external");
    });
  });

  describe("from root context", () => {
    test("resolves relative link when current file is at root", () => {
      const result = resolveLink("docs/guide.md", "README.md", entries);
      expect(result.kind).toBe("file");
      expect(result.path).toBe("docs/guide.md");
    });
  });
});

describe("extractLinks", () => {
  test("extracts markdown links from content", () => {
    const md = `
# Title

See the [guide](docs/guide.md) and [API reference](docs/api.md#usage).

Also check [external](https://example.com).
`;
    const links = extractLinks(md);
    expect(links).toEqual([
      { text: "guide", href: "docs/guide.md" },
      { text: "API reference", href: "docs/api.md#usage" },
      { text: "external", href: "https://example.com" },
    ]);
  });

  test("extracts reference-style links", () => {
    const md = `
See the [guide][1] and [API][api-ref].

[1]: docs/guide.md
[api-ref]: docs/api.md "API docs"
`;
    const links = extractLinks(md);
    expect(links).toContainEqual({ text: "guide", href: "docs/guide.md" });
    expect(links).toContainEqual({ text: "API", href: "docs/api.md" });
  });

  test("returns empty array for content with no links", () => {
    const links = extractLinks("Just plain text.");
    expect(links).toEqual([]);
  });

  test("handles anchor-only links", () => {
    const md = `Jump to [requirements](#requirements).`;
    const links = extractLinks(md);
    expect(links).toEqual([{ text: "requirements", href: "#requirements" }]);
  });

  test("ignores image references", () => {
    const md = `![logo](images/logo.png)`;
    const links = extractLinks(md);
    expect(links).toEqual([]);
  });
});
