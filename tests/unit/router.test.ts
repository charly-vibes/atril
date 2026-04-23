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

describe("history routes (OpenSpec add-unified-repo-reader:5.2)", () => {
  const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "main" };

  test("builds a repository history route that preserves repository context", () => {
    const params = buildRoute(ctx, { view: "history" });
    expect(params).toBe("?owner=acme&repo=widgets&branch=main&view=history");
  });

  test("builds a path-specific history route for later document-driven navigation", () => {
    const params = buildRoute(ctx, { view: "history", path: "docs/guide.md" });
    expect(params).toBe("?owner=acme&repo=widgets&branch=main&view=history&path=docs%2Fguide.md");
  });

  test("parses a repository history route", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=history"));
    expect(route).toEqual({
      context: ctx,
      target: { view: "history" },
    });
  });

  test("parses a path-specific history route", () => {
    const route = parseRoute(
      new URLSearchParams("owner=acme&repo=widgets&branch=main&view=history&path=docs/guide.md"),
    );
    expect(route).toEqual({
      context: ctx,
      target: { view: "history", path: "docs/guide.md" },
    });
  });
});

describe("wai routes (OpenSpec add-unified-repo-reader:4.2)", () => {
  const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "main" };

  test("builds a wai overview route that preserves repository context", () => {
    const params = buildRoute(ctx, { view: "wai" } as any);
    expect(params).toBe("?owner=acme&repo=widgets&branch=main&view=wai");
  });

  test("parses a wai overview route", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai"));
    expect(route).toEqual({
      context: ctx,
      target: { view: "wai" },
    });
  });
});

describe("beads routes", () => {
  const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "main" };

  test("defaults to list mode when no mode specified", () => {
    const params = buildRoute(ctx, { view: "beads" });
    expect(params).toContain("mode=list");
  });

  test("parses beads route without mode as list", () => {
    const route = parseRoute(
      new URLSearchParams("owner=acme&repo=widgets&branch=main&view=beads"),
    );
    expect(route).toEqual({
      context: ctx,
      target: { view: "beads", mode: "list" },
    });
  });

  test("builds list mode with selected issue", () => {
    const params = buildRoute(ctx, {
      view: "beads",
      mode: "list",
      issueId: "atril-abc",
    });
    expect(params).toContain("mode=list");
    expect(params).toContain("issue=atril-abc");
  });

  test("parses list mode with selected issue", () => {
    const route = parseRoute(
      new URLSearchParams("owner=acme&repo=widgets&branch=main&view=beads&mode=list&issue=atril-abc"),
    );
    expect(route).toEqual({
      context: ctx,
      target: { view: "beads", mode: "list", issueId: "atril-abc" },
    });
  });

  test("builds a focused dependency route that preserves repository context beyond graph mode", () => {
    const params = buildRoute(ctx, {
      view: "beads",
      mode: "focus",
      issueId: "atril-3x9",
    });
    expect(params).toBe(
      "?owner=acme&repo=widgets&branch=main&view=beads&mode=focus&issue=atril-3x9",
    );
  });

  test("parses a focused dependency route for a selected issue neighborhood", () => {
    const params = new URLSearchParams(
      "owner=acme&repo=widgets&branch=main&view=beads&mode=focus&issue=atril-3x9",
    );
    const route = parseRoute(params);
    expect(route).toEqual({
      context: ctx,
      target: { view: "beads", mode: "focus", issueId: "atril-3x9" },
    });
  });

  test("preserves selected issue context when a dependency reference is missing", () => {
    const params = new URLSearchParams(
      "owner=acme&repo=widgets&branch=main&view=beads&mode=focus&issue=atril-3x9&missingDependency=atril-404",
    );
    const route = parseRoute(params);
    expect(route).toEqual({
      context: ctx,
      target: {
        view: "beads",
        mode: "focus",
        issueId: "atril-3x9",
        missingDependencyId: "atril-404",
      },
    });
  });

  test("falls back to graph mode when a focused dependency route has no selected issue", () => {
    const params = new URLSearchParams(
      "owner=acme&repo=widgets&branch=main&view=beads&mode=focus",
    );
    const route = parseRoute(params);
    expect(route).toEqual({
      context: ctx,
      target: { view: "beads", mode: "graph" },
    });
  });

  test("builds explicit graph mode route", () => {
    const params = buildRoute(ctx, { view: "beads", mode: "graph" });
    expect(params).toContain("mode=graph");
  });

  test("parses explicit graph mode route", () => {
    const route = parseRoute(
      new URLSearchParams("owner=acme&repo=widgets&branch=main&view=beads&mode=graph"),
    );
    expect(route).toEqual({
      context: ctx,
      target: { view: "beads", mode: "graph" },
    });
  });
});
