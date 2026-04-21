import { parseRepoInput, type RepoRef } from "./shared/github";
import { GitHubClient, GitHubApiError, type TreeResult } from "./shared/github-api";
import {
  detectKnowledgeSources,
  suggestEntryPoints,
  type KnowledgeSources,
  type EntryPoint,
} from "./shared/repo-overview";
import { resolveLink } from "./shared/link-resolver";
import { buildRoute, parseRoute, type RepoContext, type RouteTarget } from "./shared/router";
import { renderHistoryOverview } from "./shared/history-overview";
import { buildWaiArtifactGroups, renderWaiOverview } from "./shared/wai-overview";
import { renderReadableDocument } from "./shared/document-renderer";

const $ = (id: string) => document.getElementById(id);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const screens = {
  entry: $("entry-screen")!,
  overview: $("overview-screen")!,
  file: $("file-screen")!,
  beads: $("beads-screen")!,
  history: $("history-screen")!,
  wai: $("wai-screen")!,
  loading: $("loading-screen")!,
  error: $("error-screen")!,
};

const form = $("repo-form") as HTMLFormElement;
const input = $("repo-input") as HTMLInputElement;
const repoError = $("repo-error")!;
const errorMessage = $("error-message")!;
const errorBack = $("error-back")!;
const fileBack = $("file-back")!;
const fileBreadcrumb = $("file-breadcrumb")!;
const fileHistory = $("file-history")!;
const fileContent = $("file-content")!;
const beadsBack = $("beads-back")!;
const beadsBreadcrumb = $("beads-breadcrumb")!;
const beadsContent = $("beads-content")!;
const historyBack = $("history-back")!;
const historyBreadcrumb = $("history-breadcrumb")!;
const historyContent = $("history-content")!;
const waiBack = $("wai-back")!;
const waiBreadcrumb = $("wai-breadcrumb")!;
const waiContent = $("wai-content")!;

const client = new GitHubClient();

/** Current repo context, set after initial load. */
let currentContext: RepoContext | null = null;
let currentTree: TreeResult | null = null;

function showScreen(name: keyof typeof screens) {
  for (const [key, el] of Object.entries(screens)) {
    (el as HTMLElement).hidden = key !== name;
  }
}

function navigate(ctx: RepoContext, target: RouteTarget) {
  const url = buildRoute(ctx, target);
  history.pushState(null, "", url);
  currentContext = ctx;
  routeTo(target);
}

function routeTo(target: RouteTarget) {
  if (target.view === "overview") {
    showScreen("overview");
  } else if (target.view === "file" && target.path) {
    showFileView(target.path, target.anchor);
  } else if (target.view === "beads") {
    showBeadsView(target);
  } else if (target.view === "history") {
    showHistoryView(target.path);
  } else if (target.view === "wai") {
    showWaiView();
  }
}

function showBeadsView(target: Extract<RouteTarget, { view: "beads" }>) {
  const mode = target.mode ?? "graph";

  if (mode === "focus" && target.issueId) {
    beadsBreadcrumb.textContent = `Issues / ${target.issueId}`;
    beadsContent.innerHTML = `
      <section class="beads-panel">
        <h3>Focused dependency view</h3>
        <p>Selected issue: <strong>${escapeHtml(target.issueId)}</strong></p>
        <p>This focused mode preserves repository context while narrowing the dependency view to a single issue neighborhood.</p>
        <ul>
          <li>Direct blockers and dependents can be inspected without a full graph.</li>
          <li>Navigation back to the broader graph mode keeps the same repository selected.</li>
        </ul>
        ${target.missingDependencyId ? `<p class="warning">Missing dependency: ${escapeHtml(target.missingDependencyId)}. The issue remains selected so the UI can show a fallback instead of breaking navigation.</p>` : ""}
      </section>`;
    showScreen("beads");
    return;
  }

  beadsBreadcrumb.textContent = "Issues / graph";
  beadsContent.innerHTML = `
    <section class="beads-panel">
      <h3>Dependency graph</h3>
      <p>Graph mode remains available as the broader dependency exploration view.</p>
      <p>Use a focused dependency route to inspect one issue together with its direct blockers and dependents.</p>
    </section>`;
  showScreen("beads");
}

async function showHistoryView(path?: string) {
  if (!currentContext) return;
  showScreen("loading");

  historyBreadcrumb.textContent = path ? `History / ${path}` : "History / recent commits";

  try {
    const commits = await client.getCommitHistory(
      currentContext.owner,
      currentContext.repo,
      currentContext.branch,
      path,
    );
    historyContent.innerHTML = renderHistoryOverview(commits, path);
    showScreen("history");
  } catch (err) {
    if (err instanceof GitHubApiError) {
      errorMessage.textContent = err.message;
    } else {
      errorMessage.textContent = "Failed to load history.";
    }
    showScreen("error");
  }
}

function showWaiView() {
  if (!currentContext || !currentTree) return;

  waiBreadcrumb.textContent = "WAI / grouped artifacts";
  waiContent.innerHTML = renderWaiOverview(buildWaiArtifactGroups(currentTree.entries));
  showScreen("wai");
}

async function showFileView(path: string, anchor?: string) {
  if (!currentContext) return;
  showScreen("loading");

  fileBreadcrumb.textContent = path;

  try {
    const content = await client.getFileContent(
      currentContext.owner,
      currentContext.repo,
      currentContext.branch,
      path,
    );
    fileContent.innerHTML = renderReadableDocument(path, content);
    showScreen("file");

    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
    }
  } catch (err) {
    if (err instanceof GitHubApiError) {
      errorMessage.textContent = err.message;
    } else {
      errorMessage.textContent = "Failed to load file.";
    }
    showScreen("error");
  }
}

function renderOverview(ref: RepoRef, branch: string, sources: KnowledgeSources, suggestions: EntryPoint[]) {
  const header = $("overview-header")!;
  header.innerHTML = `<h2>${escapeHtml(ref.owner)}/${escapeHtml(ref.repo)}</h2><span class="branch">${escapeHtml(branch)}</span>`;

  const sourcesEl = $("overview-sources")!;
  const sourceLabels: [keyof KnowledgeSources, string][] = [
    ["openspec", "Specs"],
    ["beads", "Issues"],
    ["wai", "Memory"],
    ["docs", "Docs"],
    ["readme", "README"],
  ];
  sourcesEl.innerHTML = sourceLabels
    .map(
      ([key, label]) =>
        `<span class="source-badge" data-active="${sources[key]}">${label}</span>`,
    )
    .join("");

  const overviewActions = $("overview-actions")!;
  overviewActions.innerHTML = `<button id="open-history" type="button">Open history</button>`;

  const suggestionsEl = $("overview-suggestions")!;
  const emptyEl = $("overview-empty")!;

  if (suggestions.length === 0) {
    suggestionsEl.innerHTML = "";
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
    suggestionsEl.innerHTML = `
      <h3>Start reading</h3>
      <ul class="suggestion-list">
        ${suggestions
          .map(
            (s) =>
              `<li class="suggestion-item" data-path="${escapeHtml(s.path)}" data-kind="${escapeHtml(s.kind)}">
                <span class="label">${escapeHtml(s.label)}</span>
                <span class="path">${escapeHtml(s.path)}</span>
              </li>`,
          )
          .join("")}
      </ul>`;
  }
}

async function loadRepo(ref: RepoRef, initialTarget?: RouteTarget) {
  showScreen("loading");

  try {
    const branch = await client.getDefaultBranch(ref.owner, ref.repo);
    const tree = await client.getTree(ref.owner, ref.repo, branch);

    currentContext = { owner: ref.owner, repo: ref.repo, branch };
    currentTree = tree;

    const sources = detectKnowledgeSources(tree.entries);
    const suggestions = suggestEntryPoints(sources, tree.entries);

    renderOverview(ref, branch, sources, suggestions);

    const target = initialTarget ?? { view: "overview" as const };
    navigate(currentContext, target);
  } catch (err) {
    if (err instanceof GitHubApiError) {
      errorMessage.textContent = err.message;
    } else {
      errorMessage.textContent = "Failed to load repository. Check your connection.";
    }
    showScreen("error");
  }
}

// Entry form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ref = parseRepoInput(input.value);
  if (!ref) {
    repoError.textContent = "Enter a valid owner/repo slug or GitHub URL";
    return;
  }
  repoError.textContent = "";
  loadRepo(ref);
});

// Suggestion clicks → navigate to file
document.addEventListener("click", (e) => {
  const item = (e.target as HTMLElement).closest(".suggestion-item") as HTMLElement | null;
  if (item && currentContext) {
    const path = item.dataset.path;
    const kind = item.dataset.kind;
    if (kind === "beads") {
      navigate(currentContext, { view: "beads", mode: "graph" });
      return;
    }
    if (kind === "wai") {
      navigate(currentContext, { view: "wai" });
      return;
    }
    if (path) {
      navigate(currentContext, { view: "file", path });
    }
  }
});

document.addEventListener("click", (e) => {
  const historyButton = (e.target as HTMLElement).closest("#open-history");
  if (historyButton && currentContext) {
    navigate(currentContext, { view: "history" });
  }
});

waiContent.addEventListener("click", (e) => {
  const historyItem = (e.target as HTMLElement).closest(".wai-artifact-history") as HTMLElement | null;
  if (historyItem) {
    const path = historyItem.dataset.path;
    if (path && currentContext) {
      navigate(currentContext, { view: "history", path });
    }
    return;
  }

  const item = (e.target as HTMLElement).closest(".wai-artifact-link") as HTMLElement | null;
  const path = item?.dataset.path;
  if (path && currentContext) {
    navigate(currentContext, { view: "file", path });
  }
});

// Link clicks within file content → resolve and navigate
fileContent.addEventListener("click", (e) => {
  const link = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
  if (!link || !currentContext || !currentTree) return;

  const href = link.getAttribute("href");
  if (!href) return;

  const currentPath = fileBreadcrumb.textContent ?? "";
  const resolved = resolveLink(href, currentPath, currentTree.entries);

  if (resolved.kind === "file") {
    e.preventDefault();
    navigate(currentContext, { view: "file", path: resolved.path, anchor: resolved.anchor });
  } else if (resolved.kind === "anchor") {
    // Let browser handle same-page anchor navigation
  } else if (resolved.kind === "external") {
    // Let browser handle external links (opens in new tab via target)
  }
  // unresolved: do nothing, link stays inert
});

// File history button → path-specific history
fileHistory.addEventListener("click", () => {
  const path = fileBreadcrumb.textContent;
  if (path && currentContext) {
    navigate(currentContext, { view: "history", path });
  }
});

// Changed path links in history view → path-specific history
historyContent.addEventListener("click", (e) => {
  const link = (e.target as HTMLElement).closest(".changed-path-link") as HTMLElement | null;
  const path = link?.dataset.path;
  if (path && currentContext) {
    navigate(currentContext, { view: "history", path });
  }
});

// File back button → overview
fileBack.addEventListener("click", () => {
  if (currentContext) {
    navigate(currentContext, { view: "overview" });
  }
});

beadsBack.addEventListener("click", () => {
  if (currentContext) {
    navigate(currentContext, { view: "overview" });
  }
});

historyBack.addEventListener("click", () => {
  if (currentContext) {
    navigate(currentContext, { view: "overview" });
  }
});

waiBack.addEventListener("click", () => {
  if (currentContext) {
    navigate(currentContext, { view: "overview" });
  }
});

// Error back → entry
errorBack.addEventListener("click", () => {
  showScreen("entry");
  input.focus();
});

// Browser back/forward → re-route
window.addEventListener("popstate", () => {
  const route = parseRoute(new URLSearchParams(location.search));
  if (route) {
    currentContext = route.context;
    routeTo(route.target);
  } else {
    showScreen("entry");
  }
});

// On page load, check for existing route in URL
const initialRoute = parseRoute(new URLSearchParams(location.search));
if (initialRoute) {
  loadRepo(
    { owner: initialRoute.context.owner, repo: initialRoute.context.repo },
    initialRoute.target,
  );
}
