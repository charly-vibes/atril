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

  test("renders OpenSpec requirements and scenarios with collapsible classes", () => {
    const html = renderReadableDocument(
      "openspec/specs/spec-viewer/spec.md",
      "### Requirement: Rendering\n\nText.\n\n#### Scenario: Basic view\n\nMore.",
    );

    expect(html).toContain('class="openspec-details openspec-details-requirement"');
    expect(html).toContain('class="openspec-heading openspec-heading-requirement"');
    expect(html).toContain('class="openspec-details openspec-details-scenario"');
    expect(html).toContain('class="openspec-heading openspec-heading-scenario"');
    expect(html).toContain('>Rendering</h3>');
    expect(html).not.toContain('>Requirement: Rendering</h3>');
  });
});
