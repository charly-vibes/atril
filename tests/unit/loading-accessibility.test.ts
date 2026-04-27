import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { beginAsyncUpdate, endAsyncUpdate } from "../../src/shared/loading-accessibility";

describe("loading accessibility", () => {
  test("marks dynamic content region busy while loading and clears it afterward", () => {
    const region = new Map<string, string>();
    const status = { textContent: "" };
    const target = {
      setAttribute(name: string, value: string) {
        region.set(name, value);
      },
      removeAttribute(name: string) {
        region.delete(name);
      },
    };

    beginAsyncUpdate(target, status, "Loading repository…");
    expect(region.get("aria-busy")).toBe("true");
    expect(status.textContent).toBe("Loading repository…");

    endAsyncUpdate(target, status, "Repository loaded.");
    expect(region.has("aria-busy")).toBe(false);
    expect(status.textContent).toBe("Repository loaded.");
  });

  test("declares the loading screen as a polite live region", () => {
    const html = readFileSync("src/index.html", "utf8");

    expect(html).toContain('id="loading-screen"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
  });
});
