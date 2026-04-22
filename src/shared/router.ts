/** Shared repository context preserved across view transitions. */
export interface RepoContext {
  owner: string;
  repo: string;
  branch: string;
}

export type ViewType = "overview" | "file" | "beads" | "history" | "wai" | "tree";
export type BeadsMode = "graph" | "focus";

export type RouteTarget =
  | { view: "overview" }
  | { view: "file"; path?: string; anchor?: string }
  | {
      view: "beads";
      mode?: BeadsMode;
      issueId?: string;
      missingDependencyId?: string;
    }
  | { view: "history"; path?: string }
  | { view: "wai" }
  | { view: "tree"; search?: string };

/** A fully resolved route: context + target. */
export interface Route {
  context: RepoContext;
  target: RouteTarget;
}

interface BuildOptions {
  omitDefaultBranch?: string;
}

const VALID_VIEWS = new Set<ViewType>(["overview", "file", "beads", "history", "wai", "tree"]);
const VALID_BEADS_MODES = new Set<BeadsMode>(["graph", "focus"]);

/**
 * Build a URL query string from a repo context and route target.
 * Returns the full "?key=value&..." string.
 */
export function buildRoute(
  ctx: RepoContext,
  target: RouteTarget,
  options?: BuildOptions,
): string {
  const params = new URLSearchParams();
  params.set("owner", ctx.owner);
  params.set("repo", ctx.repo);
  if (!(options?.omitDefaultBranch && ctx.branch === options.omitDefaultBranch)) {
    params.set("branch", ctx.branch);
  }
  params.set("view", target.view);
  if (target.view === "file") {
    if (target.path) params.set("path", target.path);
    if (target.anchor) params.set("anchor", target.anchor);
  }
  if (target.view === "history") {
    if (target.path) params.set("path", target.path);
  }
  if (target.view === "beads") {
    const mode = target.mode ?? "graph";
    params.set("mode", mode);
    if (target.issueId) params.set("issue", target.issueId);
    if (target.missingDependencyId) {
      params.set("missingDependency", target.missingDependencyId);
    }
  }
  if (target.view === "tree") {
    if (target.search) params.set("search", target.search);
  }
  return "?" + params.toString();
}

/**
 * Parse a URL search params object into a Route.
 * Returns null if required fields are missing or invalid.
 */
export function parseRoute(params: URLSearchParams): Route | null {
  const owner = params.get("owner");
  const repo = params.get("repo");
  if (!owner || !repo) return null;

  const branch = params.get("branch") ?? "";
  const view = (params.get("view") ?? "overview") as ViewType;

  if (!VALID_VIEWS.has(view)) return null;

  const context: RepoContext = { owner, repo, branch };

  if (view === "file") {
    const target: RouteTarget = { view };
    const path = params.get("path");
    if (path) target.path = path;

    const anchor = params.get("anchor");
    if (anchor) target.anchor = anchor;

    return { context, target };
  }

  if (view === "beads") {
    const requestedMode = (params.get("mode") ?? "graph") as BeadsMode;
    const mode = VALID_BEADS_MODES.has(requestedMode) ? requestedMode : "graph";
    const issueId = params.get("issue") ?? undefined;
    const missingDependencyId = params.get("missingDependency") ?? undefined;

    if (mode === "focus" && issueId) {
      return {
        context,
        target: {
          view,
          mode,
          issueId,
          ...(missingDependencyId ? { missingDependencyId } : {}),
        },
      };
    }

    return { context, target: { view, mode: "graph" } };
  }

  if (view === "history") {
    const path = params.get("path") ?? undefined;
    return { context, target: path ? { view, path } : { view } };
  }

  if (view === "wai") {
    return { context, target: { view } };
  }

  if (view === "tree") {
    const search = params.get("search") ?? undefined;
    return { context, target: search ? { view, search } : { view } };
  }

  return { context, target: { view: "overview" } };
}
