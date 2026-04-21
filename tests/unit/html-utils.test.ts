import { describe, expect, test } from "bun:test";
import { escapeHtml } from "../../src/shared/html-utils";

describe("escapeHtml", () => {
  test("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  test("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  test("escapes double quotes", () => {
    expect(escapeHtml('class="foo"')).toBe("class=&quot;foo&quot;");
  });

  test("handles all special characters together", () => {
    expect(escapeHtml('<a href="x&y">')).toBe(
      "&lt;a href=&quot;x&amp;y&quot;&gt;",
    );
  });

  test("returns plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  test("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});
