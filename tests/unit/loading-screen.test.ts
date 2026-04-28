import { describe, expect, test } from "bun:test";

const styles = await Bun.file("src/styles.css").text();

describe("loading screen styles", () => {
  test("centers the loading screen content with flexbox", () => {
    expect(styles).toContain("#loading-screen {");
    expect(styles).toContain("display: flex;");
    expect(styles).toContain("align-items: center;");
    expect(styles).toContain("justify-content: center;");
    expect(styles).toContain("min-height: 100vh;");
  });

  test("animates the loading message to indicate activity", () => {
    expect(styles).toContain(".loading {");
    expect(styles).toContain("animation: loading-pulse");
    expect(styles).toContain("@keyframes loading-pulse");
  });
});
