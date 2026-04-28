import { describe, expect, test } from "bun:test";
import { renderReadableDocument } from "../../src/shared/document-renderer";

describe("renderReadableDocument (OpenSpec add-unified-repo-reader:4.3)", () => {
  test("renders markdown wai artifacts as readable HTML with repository-relative links", () => {
    const html = renderReadableDocument(
      ".wai/projects/atril/research/findings.md",
      "# Findings\n\nSee the [plan](../plan/next-steps.md) and [README](../../../README.md#intro).",
    );

    expect(html).toContain('<h1 id="findings">Findings</h1>');
    expect(html).toContain("<p>See the <a href=\"../plan/next-steps.md\">plan</a> and <a href=\"../../../README.md#intro\">README</a>.</p>");
  });

  test("renders org wai artifacts as readable HTML with org links preserved for navigation", () => {
    const html = renderReadableDocument(
      ".wai/projects/atril/research/findings.org",
      "* Findings\nSee [[../plan/next-steps.org][next steps]] and [[https://example.com][external]].",
    );

    expect(html).toContain('<h1 id="findings">Findings</h1>');
    expect(html).toContain("<p>See <a href=\"../plan/next-steps.org\">next steps</a> and <a href=\"https://example.com\">external</a>.</p>");
  });

  test("adds stable heading ids so same-document anchors can resolve", () => {
    const markdown = renderReadableDocument(
      ".wai/projects/atril/research/findings.md",
      "# Key Finding\n\nJump to [section](#key-finding).",
    );
    const org = renderReadableDocument(
      ".wai/projects/atril/research/findings.org",
      "* Key Finding\nSee [[#key-finding][section]].",
    );

    expect(markdown).toContain('<h1 id="key-finding">Key Finding</h1>');
    expect(markdown).toContain('<a href="#key-finding">section</a>');
    expect(org).toContain('<h1 id="key-finding">Key Finding</h1>');
    expect(org).toContain('<a href="#key-finding">section</a>');
  });

  test("renders unsupported files as escaped preformatted text", () => {
    const html = renderReadableDocument(
      ".wai/config.toml",
      'title = "<unsafe>"',
    );

    expect(html).toContain("<pre");
    expect(html).toContain("&lt;unsafe&gt;");
  });

  test("renders OpenSpec requirements and scenarios expanded by default", () => {
    const html = renderReadableDocument(
      "openspec/specs/spec-viewer/spec.md",
      "### Requirement: Rendering\n\nText.\n\n#### Scenario: Basic view\n\nMore.",
    );

    expect(html).toContain('<details open class="openspec-details openspec-details-requirement">');
    expect(html).toContain('class="openspec-heading openspec-heading-requirement"');
    expect(html).toContain('<details open class="openspec-details openspec-details-scenario">');
    expect(html).toContain('class="openspec-heading openspec-heading-scenario"');
    expect(html).toContain('>Rendering</h3>');
    expect(html).not.toContain('>Requirement: Rendering</h3>');
  });

  test("auto-links backtick-wrapped capability names in OpenSpec documents", () => {
    const html = renderReadableDocument(
      "openspec/changes/add-spec-change-cross-links/proposal.md",
      "Depends on `cli-core` and `spec-viewer`.",
      [
        { path: "openspec/specs/cli-core/spec.md", type: "blob", sha: "abc" },
        { path: "openspec/specs/spec-viewer/spec.md", type: "blob", sha: "def" },
      ],
    );

    expect(html).toContain('<a href="openspec/specs/cli-core/spec.md">cli-core</a>');
    expect(html).toContain('<a href="openspec/specs/spec-viewer/spec.md">spec-viewer</a>');
  });

  test("auto-links capability names in See also patterns for OpenSpec documents", () => {
    const html = renderReadableDocument(
      "openspec/specs/spec-viewer/spec.md",
      "See also: cli-core, repo-reader.",
      [
        { path: "openspec/specs/cli-core/spec.md", type: "blob", sha: "abc" },
        { path: "openspec/specs/repo-reader/spec.md", type: "blob", sha: "def" },
      ],
    );

    expect(html).toContain('See also: <a href="openspec/specs/cli-core/spec.md">cli-core</a>, <a href="openspec/specs/repo-reader/spec.md">repo-reader</a>.');
  });

  test("does not auto-link partial matches, fenced code blocks, or non-OpenSpec documents", () => {
    const openSpecHtml = renderReadableDocument(
      "openspec/specs/spec-viewer/spec.md",
      "Use `cli` but not cli-corex.\n\n```md\n`cli-core`\nSee also: cli-core\n```",
      [
        { path: "openspec/specs/cli-core/spec.md", type: "blob", sha: "abc" },
        { path: "openspec/specs/cli/spec.md", type: "blob", sha: "def" },
      ],
    );
    const nonOpenSpecHtml = renderReadableDocument(
      "docs/guide.md",
      "See also: cli-core and `cli-core`.",
      [
        { path: "openspec/specs/cli-core/spec.md", type: "blob", sha: "abc" },
      ],
    );

    expect(openSpecHtml).toContain('<a href="openspec/specs/cli/spec.md">cli</a>');
    expect(openSpecHtml).not.toContain('href="openspec/specs/cli-core/spec.md">cli-corex</a>');
    expect(openSpecHtml).toContain('`cli-core`');
    expect(openSpecHtml).not.toContain('<pre><code><a href="openspec/specs/cli-core/spec.md">cli-core</a>');
    expect(nonOpenSpecHtml).not.toContain('href="openspec/specs/cli-core/spec.md"');
  });

  test("generates a TOC when a markdown document has 3 or more headings", () => {
    const html = renderReadableDocument(
      "docs/guide.md",
      "## Overview\n\nIntro.\n\n## Setup\n\nInstall.\n\n## Usage\n\nRun it.",
    );

    expect(html).toContain('<nav class="doc-toc">');
    expect(html).toContain('href="#overview"');
    expect(html).toContain('href="#setup"');
    expect(html).toContain('href="#usage"');
  });

  test("does not generate a TOC when a markdown document has fewer than 3 headings", () => {
    const html = renderReadableDocument(
      "docs/guide.md",
      "## Overview\n\nIntro.\n\n## Setup\n\nInstall.",
    );

    expect(html).not.toContain('<nav class="doc-toc">');
  });

  test("TOC appears before the first heading in the rendered output", () => {
    const html = renderReadableDocument(
      "docs/guide.md",
      "## Overview\n\nIntro.\n\n## Setup\n\nInstall.\n\n## Usage\n\nRun it.",
    );

    const tocPos = html.indexOf('<nav class="doc-toc">');
    const firstHeadingPos = html.indexOf('<h2');
    expect(tocPos).toBeGreaterThanOrEqual(0);
    expect(tocPos).toBeLessThan(firstHeadingPos);
  });

  test("TOC indents deeper headings relative to the shallowest heading in the document", () => {
    const html = renderReadableDocument(
      "docs/guide.md",
      "## Overview\n\nIntro.\n\n### Details\n\nMore.\n\n## Summary\n\nDone.\n\n### Conclusion\n\nFin.",
    );

    expect(html).toContain('<nav class="doc-toc">');
    // h2 headings are top-level (no indent class)
    expect(html).toContain('href="#overview"');
    expect(html).toContain('href="#summary"');
    // h3 headings are indented
    expect(html).toContain('class="toc-indent-1"');
    expect(html).toContain('href="#details"');
    expect(html).toContain('href="#conclusion"');
  });
});
