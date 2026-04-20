/** Shared repository context preserved across view transitions. */
export interface RepoContext {
  owner: string;
  repo: string;
  branch: string;
}

export type ViewType = "overview" | "file";

/** Navigation target within a repository. */
export interface RouteTarget {
  view: ViewType;
  path?: string;
  anchor?: string;
}

/** A fully resolved route: context + target. */
export interface Route {
  context: RepoContext;
  target: RouteTarget;
}

interface BuildOptions {
  omitDefaultBranch?: string;
}

const VALID_VIEWS = new Set<ViewType>(["overview", "file"]);

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
  if (target.path) params.set("path", target.path);
  if (target.anchor) params.set("anchor", target.anchor);
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
  const target: RouteTarget = { view };

  const path = params.get("path");
  if (path) target.path = path;

  const anchor = params.get("anchor");
  if (anchor) target.anchor = anchor;

  return { context, target };
}
