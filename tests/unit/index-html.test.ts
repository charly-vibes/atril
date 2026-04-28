import { describe, expect, test } from "bun:test";

const indexHtml = await Bun.file("src/index.html").text();

describe("index.html", () => {
  test("declares an inline SVG favicon to avoid browser favicon 404s", () => {
    expect(indexHtml).toContain('rel="icon"');
    expect(indexHtml).toContain('type="image/svg+xml"');
    expect(indexHtml).toContain('href="data:image/svg+xml,');
  });
});
