import { describe, expect, test } from "bun:test";

const indexHtml = await Bun.file("src/index.html").text();
const mainTs = await Bun.file("src/main.ts").text();

describe("error screen HTML structure", () => {
  test("has an error-hint element for contextual recovery hints", () => {
    expect(indexHtml).toContain('id="error-hint"');
  });

  test("button is labelled 'Try again' instead of 'Back'", () => {
    expect(indexHtml).toContain(">Try again<");
  });
});

describe("error screen logic in main.ts", () => {
  test("tracks lastAttemptedRepo so the error renderer can pre-fill the input", () => {
    expect(mainTs).toContain("lastAttemptedRepo");
  });

  test("references errorHint element for setting hint text", () => {
    expect(mainTs).toContain("errorHint");
  });

  test("sets a 'repository not found' hint for 404 errors", () => {
    expect(mainTs).toContain("Check the owner/repo spelling and try again.");
  });

  test("sets a generic temporary-issue hint for non-404 errors", () => {
    expect(mainTs).toContain("This may be a temporary GitHub API issue. Wait a moment and try again.");
  });

  test("pre-fills the repo input with lastAttemptedRepo on Try Again click", () => {
    // The error-back handler must write lastAttemptedRepo back into the input
    expect(mainTs).toMatch(/errorBack.*[\s\S]{0,400}input\.value\s*=\s*lastAttemptedRepo|lastAttemptedRepo[\s\S]{0,400}input\.value/);
  });
});
