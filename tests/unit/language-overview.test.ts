import { describe, expect, test } from "bun:test";
import { listBoundedContexts, renderLanguageOverview } from "../../src/views/language-explorer";
import type { GitHubTreeEntry } from "../../src/shared/github-api";

function blob(path: string): GitHubTreeEntry {
  return { path, type: "blob", sha: "abc" };
}

const FIXTURE_README = `# Ubiquitous Language

## Bounded Contexts

| Context | File | Purpose |
|---------|------|---------|
| navigation | [navigation.md](contexts/navigation.md) | URL routing, state preservation, deep links |
| design | [design.md](contexts/design.md) | Typography, color palette, theme switching |
`;

const FIXTURE_CONTEXT_PATHS = [
  ".wai/resources/ubiquitous-language/contexts/navigation.md",
  ".wai/resources/ubiquitous-language/contexts/design.md",
];

describe("listBoundedContexts", () => {
  test("returns one entry per context file with name, path, and purpose", () => {
    const contexts = listBoundedContexts(FIXTURE_README, FIXTURE_CONTEXT_PATHS);
    expect(contexts).toHaveLength(2);

    expect(contexts[0]).toEqual({
      name: "navigation",
      path: ".wai/resources/ubiquitous-language/contexts/navigation.md",
      purpose: "URL routing, state preservation, deep links",
    });

    expect(contexts[1]).toEqual({
      name: "design",
      path: ".wai/resources/ubiquitous-language/contexts/design.md",
      purpose: "Typography, color palette, theme switching",
    });
  });

  test("uses filename (without .md) when context name is absent from README table", () => {
    const readme = `# Language\n\n| Context | File | Purpose |\n|---------|------|---------|`;
    const paths = [".wai/resources/ubiquitous-language/contexts/unknown-context.md"];
    const contexts = listBoundedContexts(readme, paths);
    expect(contexts).toHaveLength(1);
    expect(contexts[0]!.name).toBe("unknown-context");
    expect(contexts[0]!.purpose).toBe("");
  });

  test("returns empty array when context paths list is empty", () => {
    expect(listBoundedContexts(FIXTURE_README, [])).toEqual([]);
  });

  test("matches context by filename regardless of order in README table", () => {
    const reversedReadme = `# Language

## Bounded Contexts

| Context | File | Purpose |
|---------|------|---------|
| design | [design.md](contexts/design.md) | Typography, color palette, theme switching |
| navigation | [navigation.md](contexts/navigation.md) | URL routing, state preservation, deep links |
`;
    const contexts = listBoundedContexts(reversedReadme, FIXTURE_CONTEXT_PATHS);
    const navCtx = contexts.find((c) => c.name === "navigation");
    expect(navCtx?.purpose).toBe("URL routing, state preservation, deep links");
  });
});

describe("renderLanguageOverview", () => {
  test("renders a list of bounded contexts with names and purposes", () => {
    const contexts = [
      { name: "navigation", path: ".wai/resources/ubiquitous-language/contexts/navigation.md", purpose: "URL routing, state preservation" },
      { name: "design", path: ".wai/resources/ubiquitous-language/contexts/design.md", purpose: "Typography, color palette" },
    ];
    const html = renderLanguageOverview(contexts);
    expect(html).toContain("navigation");
    expect(html).toContain("URL routing, state preservation");
    expect(html).toContain("design");
    expect(html).toContain("Typography, color palette");
    expect(html).toContain('data-context="navigation"');
    expect(html).toContain('data-context="design"');
  });

  test("renders empty state when no bounded contexts", () => {
    const html = renderLanguageOverview([]);
    expect(html).toContain("No bounded contexts defined");
  });
});
