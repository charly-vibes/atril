import { describe, expect, test } from "bun:test";

const mainTs = await Bun.file("src/main.ts").text();
const styles = await Bun.file("src/styles.css").text();

describe("theme toggle button label", () => {
  test("prefixes the Light label with a sun icon when switching from dark mode", () => {
    // When current theme is dark, the button shows the next mode: Light
    expect(mainTs).toContain('☀ Light');
  });

  test("prefixes the Dark label with a crescent icon when switching from light mode", () => {
    // When current theme is light, the button shows the next mode: Dark
    expect(mainTs).toContain('☾ Dark');
  });

  test("prefixes the Auto label with a half-circle icon", () => {
    // When neither light nor dark, the button shows Auto
    expect(mainTs).toContain('◑ Auto');
  });
});

describe("theme toggle button visibility", () => {
  test("has opacity 0.8 at rest so it is discoverable without hover", () => {
    const themeToggleBlock = styles.match(/#theme-toggle\s*\{[^}]*\}/)?.[0] ?? "";
    expect(themeToggleBlock).toContain("opacity: 0.8;");
  });

  test("reaches full opacity on hover", () => {
    const themeToggleHoverBlock = styles.match(/#theme-toggle:hover\s*\{[^}]*\}/)?.[0] ?? "";
    expect(themeToggleHoverBlock).toContain("opacity: 1;");
  });
});
