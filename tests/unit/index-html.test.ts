import { describe, expect, test } from "bun:test";

const indexHtml = await Bun.file("src/index.html").text();

describe("index.html", () => {
  test("declares an inline SVG favicon to avoid browser favicon 404s", () => {
    expect(indexHtml).toContain('rel="icon"');
    expect(indexHtml).toContain('type="image/svg+xml"');
    expect(indexHtml).toContain('href="data:image/svg+xml,');
  });

  test("each content screen has a back button matching the focus-management selector", () => {
    for (const id of ["file-back", "beads-back", "history-back", "wai-back", "specs-back", "tree-back"]) {
      expect(indexHtml).toContain(`id="${id}"`);
    }
  });

  test("screen containers are wrapped in a main landmark element with id='content'", () => {
    expect(indexHtml).toContain('<main id="content">');
    expect((indexHtml.match(/<main/g) ?? []).length).toBe(1);
  });
});
