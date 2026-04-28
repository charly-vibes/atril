import { describe, expect, test } from "bun:test";

const mainTs = await Bun.file("src/main.ts").text();
const styles = await Bun.file("src/styles.css").text();

describe("branch toggle affordance", () => {
  test("renders a visible chevron in the branch toggle label", () => {
    expect(mainTs).toContain('<span class="branch-chevron" aria-hidden="true">▾</span>');
  });

  test("shows a border and padding at rest without requiring hover", () => {
    const branchToggleBlock = styles.match(/\.branch-toggle\s*\{[^}]*\}/)?.[0] ?? "";

    expect(branchToggleBlock).toContain("border: 1px solid var(--color-border);");
    expect(branchToggleBlock).toContain("padding: 2px 6px;");
  });
});
