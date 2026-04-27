import type { RepoContext, RouteTarget } from "./router";

interface BuildDocumentTitleOptions {
  screen?: "entry" | "loading" | "error";
}

const APP_TITLE = "atril";

function repoLabel(ctx: RepoContext) {
  return `${ctx.owner}/${ctx.repo}`;
}

function basename(path?: string) {
  if (!path) return undefined;
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function routeLabel(target: RouteTarget): string {
  if (target.view === "file") return basename(target.path) ?? "File";
  if (target.view === "history") {
    return target.path ? `History: ${basename(target.path)}` : "History";
  }
  if (target.view === "beads") {
    if (target.issueId) return `Issue ${target.issueId}`;
    return target.mode === "graph" ? "Issues graph" : "Issues";
  }
  if (target.view === "wai") return "WAI";
  if (target.view === "tree") return target.search ? `Files: ${target.search}` : "Files";
  return APP_TITLE;
}

export function buildDocumentTitle(
  ctx: RepoContext | null,
  target?: RouteTarget,
  options?: BuildDocumentTitleOptions,
) {
  if (options?.screen === "entry") return APP_TITLE;

  if (!ctx) {
    if (options?.screen === "loading") return `Loading — ${APP_TITLE}`;
    if (options?.screen === "error") return `Error — ${APP_TITLE}`;
    return APP_TITLE;
  }

  const repo = repoLabel(ctx);

  if (options?.screen === "loading") return `Loading — ${repo} — ${APP_TITLE}`;
  if (options?.screen === "error") return `Error — ${repo} — ${APP_TITLE}`;

  if (!target || target.view === "overview") {
    return `${repo} — ${APP_TITLE}`;
  }

  return `${routeLabel(target)} — ${repo} — ${APP_TITLE}`;
}
