import { describe, expect, test } from "bun:test";
import {
  buildRoute,
  parseRoute,
  type RepoContext,
} from "../../src/shared/router";

describe("buildRoute", () => {
  const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "main" };

  test("builds URL params for a file route", () => {
    const params = buildRoute(ctx, { view: "file", path: "docs/guide.md" });
    expect(params).toBe("?owner=acme&repo=widgets&branch=main&view=file&path=docs%2Fguide.md");
  });

  test("builds URL params with anchor", () => {
    const params = buildRoute(ctx, { view: "file", path: "docs/guide.md", anchor: "setup" });
    expect(params).toContain("path=docs%2Fguide.md");
    expect(params).toContain("anchor=setup");
  });

  test("builds URL params for overview route", () => {
    const params = buildRoute(ctx, { view: "overview" });
    expect(params).toBe("?owner=acme&repo=widgets&branch=main&view=overview");
  });

  test("omits branch when it matches default", () => {
    const params = buildRoute(ctx, { view: "overview" }, { omitDefaultBranch: "main" });
    expect(params).not.toContain("branch=");
  });
});

describe("parseRoute", () => {
  test("parses full file route from URL params", () => {
    const params = new URLSearchParams("owner=acme&repo=widgets&branch=main&view=file&path=docs/guide.md");
    const route = parseRoute(params);
    expect(route).toEqual({
      context: { owner: "acme", repo: "widgets", branch: "main" },
      target: { view: "file", path: "docs/guide.md" },
    });
  });

  test("parses route with anchor", () => {
    const params = new URLSearchParams("owner=acme&repo=widgets&branch=main&view=file&path=docs/guide.md&anchor=setup");
    const route = parseRoute(params);
    expect(route?.target.anchor).toBe("setup");
  });

  test("parses overview route", () => {
    const params = new URLSearchParams("owner=acme&repo=widgets&branch=main&view=overview");
    const route = parseRoute(params);
    expect(route?.target.view).toBe("overview");
  });

  test("returns null for missing owner/repo", () => {
    const params = new URLSearchParams("view=overview");
    expect(parseRoute(params)).toBeNull();
  });

  test("returns null for invalid view", () => {
    const params = new URLSearchParams("owner=acme&repo=widgets&view=unknown");
    expect(parseRoute(params)).toBeNull();
  });

  test("defaults to overview when view is missing but context is valid", () => {
    const params = new URLSearchParams("owner=acme&repo=widgets&branch=main");
    const route = parseRoute(params);
    expect(route?.target.view).toBe("overview");
  });
});

describe("round-trip", () => {
  const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "dev" };

  test("buildRoute → parseRoute preserves all fields", () => {
    const target = { view: "file" as const, path: "src/index.ts", anchor: "main" };
    const url = buildRoute(ctx, target);
    const parsed = parseRoute(new URLSearchParams(url.slice(1)));
    expect(parsed?.context).toEqual(ctx);
    expect(parsed?.target).toEqual(target);
  });
});
