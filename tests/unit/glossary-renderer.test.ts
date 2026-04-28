import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { extractGlossaryTerms, renderGlossary, termToAnchor } from "../../src/views/language-explorer";

const FIXTURE_CONTEXT = `# Bounded Context: navigation

URL routing and state management.

## Key Concepts

| Term | Definition |
|------|-----------|
| **Route** | A fully resolved navigation target with context and view state |
| **Deep Link** | URL-encoded target: \`?view=wai&section=language\` |
| **Back Navigation** | Browser back button restores previous route without full reload |
`;

const CONTEXT_NO_TABLE = `# Bounded Context: design

This context has no term-definition table.

## Notes

Some prose content here.
`;

describe("termToAnchor", () => {
  test("lowercases and hyphenates a simple term", () => {
    expect(termToAnchor("Route")).toBe("route");
  });

  test("lowercases and hyphenates a multi-word term", () => {
    expect(termToAnchor("Deep Link")).toBe("deep-link");
  });

  test("strips bold markdown markers before converting", () => {
    expect(termToAnchor("**Back Navigation**")).toBe("back-navigation");
  });

  test("collapses multiple spaces into single hyphen", () => {
    expect(termToAnchor("Term  With  Spaces")).toBe("term-with-spaces");
  });

  test("strips non-alphanumeric punctuation from anchors", () => {
    expect(termToAnchor("Read/Write")).toBe("read-write");
    expect(termToAnchor("Artifact's Lock")).toBe("artifacts-lock");
  });
});

describe("extractGlossaryTerms", () => {
  test("extracts rows from a Term/Definition table", () => {
    const terms = extractGlossaryTerms(FIXTURE_CONTEXT);
    expect(terms).toHaveLength(3);
    expect(terms[0]).toEqual({ term: "Route", definition: "A fully resolved navigation target with context and view state" });
    expect(terms[1]).toEqual({ term: "Deep Link", definition: "URL-encoded target: `?view=wai&section=language`" });
    expect(terms[2]).toEqual({ term: "Back Navigation", definition: "Browser back button restores previous route without full reload" });
  });

  test("returns empty array when no Term/Definition table is present", () => {
    expect(extractGlossaryTerms(CONTEXT_NO_TABLE)).toEqual([]);
  });

  test("detects table with bold markers in header: **Term** and **Definition**", () => {
    const md = `| **Term** | **Definition** |\n|----------|----------------|\n| Foo | Bar definition |`;
    const terms = extractGlossaryTerms(md);
    expect(terms).toHaveLength(1);
    expect(terms[0]).toEqual({ term: "Foo", definition: "Bar definition" });
  });

  test("is case-insensitive for column headers", () => {
    const md = `| TERM | DEFINITION |\n|------|------------|\n| Alpha | First letter |`;
    const terms = extractGlossaryTerms(md);
    expect(terms).toHaveLength(1);
    expect(terms[0]!.term).toBe("Alpha");
  });

  test("strips bold markers from term values", () => {
    const md = `| Term | Definition |\n|------|------------|\n| **Bounded Context** | A modular domain boundary |`;
    const terms = extractGlossaryTerms(md);
    expect(terms[0]!.term).toBe("Bounded Context");
  });
});

const HEADING_DEFINITION_CONTEXT = `# Artifacts Context

## Artifact

**Definition:** A dated Markdown file that captures reasoning at a specific point in time.

**Anti-terms:** Do not use "document", "note", or "file"

**Related:** Phase, Frontmatter

---

## Frontmatter

**Definition:** YAML metadata at the top of an artifact file.

**Anti-terms:** Do not call it "header" or "metadata block".

**Related:** Artifact

---

## Artifact lock

**Definition:** A SHA-256 hash sidecar written alongside an artifact to freeze its content.
`;

describe("extractGlossaryTerms — heading-definition format", () => {
  test("extracts terms from ## Heading + **Definition:** blocks", () => {
    const terms = extractGlossaryTerms(HEADING_DEFINITION_CONTEXT);
    expect(terms).toHaveLength(3);
    expect(terms[0]).toEqual({
      term: "Artifact",
      definition: "A dated Markdown file that captures reasoning at a specific point in time.",
    });
    expect(terms[1]).toEqual({
      term: "Frontmatter",
      definition: "YAML metadata at the top of an artifact file.",
    });
    expect(terms[2]).toEqual({
      term: "Artifact lock",
      definition: "A SHA-256 hash sidecar written alongside an artifact to freeze its content.",
    });
  });

  test("ignores sections without a **Definition:** line", () => {
    const md = `## Introduction\n\nSome prose, no definition.\n\n## Foo\n\n**Definition:** A real term.\n`;
    const terms = extractGlossaryTerms(md);
    expect(terms).toHaveLength(1);
    expect(terms[0]!.term).toBe("Foo");
  });

  test("preserves trailing period in definition text", () => {
    const md = `## Bar\n\n**Definition:** The bar concept.\n`;
    const [term] = extractGlossaryTerms(md);
    expect(term?.definition).toBe("The bar concept.");
  });

  test("skips top-level h1 heading", () => {
    const md = `# Context Title\n\n## Foo\n\n**Definition:** A foo.\n`;
    const terms = extractGlossaryTerms(md);
    expect(terms).toHaveLength(1);
    expect(terms[0]!.term).toBe("Foo");
  });
});

describe("renderGlossary", () => {
  test("renders a <dl> with <dt>/<dd> pairs for each term", () => {
    const terms = extractGlossaryTerms(FIXTURE_CONTEXT);
    const html = renderGlossary(terms);
    expect(html).toContain("<dl");
    expect(html).toContain("<dt");
    expect(html).toContain("<dd");
    expect(html).toContain(">Route<");
    expect(html).toContain(">Deep Link<");
  });

  test("gives each term a named anchor derived from the term slug", () => {
    const terms = extractGlossaryTerms(FIXTURE_CONTEXT);
    const html = renderGlossary(terms);
    expect(html).toContain('id="route"');
    expect(html).toContain('id="deep-link"');
    expect(html).toContain('id="back-navigation"');
  });

  test("renders empty dl when no terms", () => {
    const html = renderGlossary([]);
    expect(html).toContain("<dl");
    expect(html).not.toContain("<dt");
  });

  test("renders available prose without error when no table is present", () => {
    const terms = extractGlossaryTerms(CONTEXT_NO_TABLE);
    expect(() => renderGlossary(terms)).not.toThrow();
    const html = renderGlossary(terms);
    expect(html).toContain("<dl");
  });

  test("escapes HTML special characters in term and definition", () => {
    const html = renderGlossary([{ term: "A < B", definition: "x & y" }]);
    expect(html).not.toContain("<B>");
    expect(html).not.toContain("x & y");
    expect(html).toContain("&lt;");
    expect(html).toContain("&amp;");
  });
});

describe("glossary rendering: all bounded-context files", () => {
  const contextsDir = join(
    import.meta.dir,
    "../../.wai/resources/ubiquitous-language/contexts",
  );
  const contextFiles = readdirSync(contextsDir).filter((f) => f.endsWith(".md"));

  test("at least 5 context files are present", () => {
    expect(contextFiles.length).toBeGreaterThanOrEqual(5);
  });

  for (const filename of contextFiles) {
    test(`${filename}: renders without error`, () => {
      const content = readFileSync(join(contextsDir, filename), "utf-8");
      const terms = extractGlossaryTerms(content);
      expect(() => renderGlossary(terms)).not.toThrow();
    });

    test(`${filename}: term anchors are unique`, () => {
      const content = readFileSync(join(contextsDir, filename), "utf-8");
      const terms = extractGlossaryTerms(content);
      const anchors = terms.map((t) => termToAnchor(t.term));
      const uniqueAnchors = new Set(anchors);
      expect(uniqueAnchors.size).toBe(anchors.length);
    });

    test(`${filename}: rendered html contains a <dl>`, () => {
      const content = readFileSync(join(contextsDir, filename), "utf-8");
      const terms = extractGlossaryTerms(content);
      const html = renderGlossary(terms);
      expect(html).toContain("<dl");
    });
  }
});
