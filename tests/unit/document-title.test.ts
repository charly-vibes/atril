import { describe, expect, test } from "bun:test";
import { buildDocumentTitle } from "../../src/shared/document-title";
import type { RepoContext, RouteTarget } from "../../src/shared/router";

const ctx: RepoContext = {
  owner: "charly-vibes",
  repo: "atril",
  branch: "main",
};

function title(target: RouteTarget, options?: Parameters<typeof buildDocumentTitle>[2]) {
  return buildDocumentTitle(ctx, target, options);
}

describe("buildDocumentTitle", () => {
  test("uses repository label for overview", () => {
    expect(title({ view: "overview" })).toBe("charly-vibes/atril — atril");
  });

  test("uses basename for file view", () => {
    expect(title({ view: "file", path: "README.md" })).toBe(
      "README.md — charly-vibes/atril — atril",
    );
  });

  test("uses history label for repository history", () => {
    expect(title({ view: "history" })).toBe("History — charly-vibes/atril — atril");
  });

  test("uses file basename for path-scoped history", () => {
    expect(title({ view: "history", path: "src/main.ts" })).toBe(
      "History: main.ts — charly-vibes/atril — atril",
    );
  });

  test("uses selected issue for beads detail views", () => {
    expect(title({ view: "beads", mode: "list", issueId: "atril-b4n" })).toBe(
      "Issue atril-b4n — charly-vibes/atril — atril",
    );
  });

  test("uses loading and error labels when screen state overrides route", () => {
    expect(title({ view: "overview" }, { screen: "loading" })).toBe(
      "Loading — charly-vibes/atril — atril",
    );
    expect(title({ view: "overview" }, { screen: "error" })).toBe(
      "Error — charly-vibes/atril — atril",
    );
  });

  test("falls back to the app title on the entry screen", () => {
    expect(buildDocumentTitle(ctx, { view: "overview" }, { screen: "entry" })).toBe("atril");
    expect(buildDocumentTitle(null, undefined, { screen: "entry" })).toBe("atril");
  });
});
