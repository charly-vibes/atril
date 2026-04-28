import { describe, expect, test } from "bun:test";
import { buildRoute, parseRoute, type RepoContext, type RouteTarget } from "../../src/shared/router";

const ctx: RepoContext = { owner: "acme", repo: "widgets", branch: "main" };

describe("language deep link: buildRoute", () => {
  test("builds a wai language overview URL", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language" } as RouteTarget);
    expect(url).toContain("view=wai");
    expect(url).toContain("section=language");
    expect(url).not.toContain("context=");
    expect(url).not.toContain("term=");
  });

  test("builds a URL for a specific bounded context", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language", context: "navigation" } as RouteTarget);
    expect(url).toContain("section=language");
    expect(url).toContain("context=navigation");
    expect(url).not.toContain("term=");
  });

  test("builds a URL for a specific term within a context", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language", context: "navigation", term: "route" } as RouteTarget);
    expect(url).toContain("section=language");
    expect(url).toContain("context=navigation");
    expect(url).toContain("term=route");
  });
});

describe("language deep link: parseRoute", () => {
  test("parses a language overview route (section=language, no context)", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai&section=language"));
    expect(route).not.toBeNull();
    expect(route!.target).toMatchObject({ view: "wai", section: "language" });
    expect((route!.target as any).context).toBeUndefined();
    expect((route!.target as any).term).toBeUndefined();
  });

  test("parses a bounded-context deep link", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai&section=language&context=navigation"));
    expect(route!.target).toMatchObject({ view: "wai", section: "language", context: "navigation" });
  });

  test("parses a term deep link with both context and term", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai&section=language&context=navigation&term=route"));
    expect(route!.target).toMatchObject({ view: "wai", section: "language", context: "navigation", term: "route" });
  });

  test("ignores term when context is absent", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai&section=language&term=route"));
    expect(route!.target).toMatchObject({ view: "wai", section: "language" });
    expect((route!.target as any).term).toBeUndefined();
    expect((route!.target as any).context).toBeUndefined();
  });

  test("plain wai route without section remains unchanged", () => {
    const route = parseRoute(new URLSearchParams("owner=acme&repo=widgets&branch=main&view=wai"));
    expect(route!.target).toEqual({ view: "wai" });
  });
});

describe("language deep link: round-trip", () => {
  test("overview URL round-trips through buildRoute → parseRoute", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language" });
    const route = parseRoute(new URLSearchParams(url.slice(1)));
    expect(route!.target).toMatchObject({ view: "wai", section: "language" });
  });

  test("context URL round-trips", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language", context: "navigation" });
    const route = parseRoute(new URLSearchParams(url.slice(1)));
    expect(route!.target).toMatchObject({ view: "wai", section: "language", context: "navigation" });
    expect((route!.target as any).term).toBeUndefined();
  });

  test("context+term URL round-trips", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language", context: "navigation", term: "route" });
    const route = parseRoute(new URLSearchParams(url.slice(1)));
    expect(route!.target).toMatchObject({ view: "wai", section: "language", context: "navigation", term: "route" });
  });

  test("invalid context: ?context= with unknown name is preserved in URL (validation is in view layer)", () => {
    const url = buildRoute(ctx, { view: "wai", section: "language", context: "nonexistent" });
    const route = parseRoute(new URLSearchParams(url.slice(1)));
    expect(route!.target).toMatchObject({ view: "wai", section: "language", context: "nonexistent" });
  });
});
