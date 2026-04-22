import { parseRepoInput, type RepoRef } from "./shared/github";
import { GitHubClient, GitHubApiError, type TreeResult } from "./shared/github-api";
import {
  detectKnowledgeSources,
  suggestEntryPoints,
  type KnowledgeSources,
  type EntryPoint,
} from "./shared/repo-overview";
import { resolveLink } from "./shared/link-resolver";
import { resolveIssueReferences, type IssueReference } from "./shared/issue-reference";
import { buildRoute, parseRoute, type RepoContext, type RouteTarget } from "./shared/router";
import { renderHistoryOverview } from "./shared/history-overview";
import { buildWaiArtifactGroups, renderWaiOverview } from "./shared/wai-overview";
import { renderReadableDocument } from "./shared/document-renderer";
import { escapeHtml } from "./shared/html-utils";
import { buildFileTree, fuzzyFilterEntries, filterRelevantEntries, type TreeNode } from "./shared/file-tree";

const $ = (id: string) => document.getElementById(id);

const screens = {
  entry: $("entry-screen")!,
  overview: $("overview-screen")!,
  file: $("file-screen")!,
  beads: $("beads-screen")!,
  history: $("history-screen")!,
  wai: $("wai-screen")!,
  tree: $("tree-screen")!,
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
const treeBack = $("tree-back")!;
const treeBreadcrumb = $("tree-breadcrumb")!;
const treeSearch = $("tree-search") as HTMLInputElement;
const treeContent = $("tree-content")!;

const client = new GitHubClient();

/** Current repo context, set after initial load. */
let currentContext: RepoContext | null = null;
let currentTree: TreeResult | null = null;
let navDepth = 0;

function showScreen(name: keyof typeof screens) {
  for (const [key, el] of Object.entries(screens)) {
    (el as HTMLElement).hidden = key !== name;
  }
}

function navigate(ctx: RepoContext, target: RouteTarget) {
  const url = buildRoute(ctx, target);
  history.pushState(null, "", url);
  navDepth++;
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
  } else if (target.view === "tree") {
    showTreeView(target.search);
  }
}

function renderIssueReferences(refs: IssueReference[]): string {
  if (refs.length === 0) return "";

  const items = refs.map((ref) => {
    if (ref.status === "navigable" && ref.path) {
      return `<li><button class="issue-ref-link" data-path="${escapeHtml(ref.path)}">${escapeHtml(ref.text)}</button> <span class="ref-path">${escapeHtml(ref.path)}</span></li>`;
    }
    if (ref.status === "external") {
      return `<li><span class="ref-external">${escapeHtml(ref.text)}</span> <span class="ref-hint">(external)</span></li>`;
    }
    return `<li><span class="ref-unresolved">${escapeHtml(ref.text)}</span> <span class="ref-hint">(no destination available)</span></li>`;
  });

  return `
    <div class="issue-references">
      <h4>Referenced artifacts</h4>
      <ul>${items.join("")}</ul>
    </div>`;
}

function showBeadsView(target: Extract<RouteTarget, { view: "beads" }>) {
  const mode = target.mode ?? "graph";

  if (mode === "focus" && target.issueId) {
    beadsBreadcrumb.textContent = `Issues / ${target.issueId}`;

    // Issue body is not available on the route target — resolve from ID/dependency
    // strings only. Full description resolution requires API integration (future work).
    const issueText = target.issueId + (target.missingDependencyId ? ` ${target.missingDependencyId}` : "");
    const refs = currentTree
      ? resolveIssueReferences(issueText, currentTree.entries)
      : [];

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
        ${renderIssueReferences(refs)}
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

  if (path) {
    historyBreadcrumb.innerHTML = `History / ${renderBreadcrumb(path)}`;
  } else {
    historyBreadcrumb.textContent = "History / recent commits";
  }

  try {
    const commits = await client.getCommitHistory(
      currentContext.owner,
      currentContext.repo,
      currentContext.branch,
      path,
    );
    const slug = `${currentContext.owner}/${currentContext.repo}`;
    historyContent.innerHTML = renderHistoryOverview(commits, path, slug);
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

function showTreeView(search?: string) {
  if (!currentContext || !currentTree) return;

  treeBreadcrumb.textContent = `${currentContext.owner}/${currentContext.repo}`;
  treeSearch.value = search ?? "";

  if (search) {
    renderSearchResults(search);
  } else {
    renderTreeNodes();
  }

  showScreen("tree");

  if (!search) treeSearch.focus();
}

function renderTreeNodes() {
  if (!currentTree) return;
  const filtered = filterRelevantEntries(currentTree.entries);
  const tree = buildFileTree(filtered);
  treeContent.innerHTML = `<ul class="tree-list">${renderTreeLevel(tree)}</ul>`;
}

function renderTreeLevel(nodes: TreeNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "tree") {
        const children = node.children ?? [];
        return `<li>
          <div class="tree-item" data-type="tree" data-path="${escapeHtml(node.path)}">
            <span class="tree-icon">▶</span>
            <span class="tree-name">${escapeHtml(node.name)}</span>
          </div>
          <ul class="tree-children" hidden>${renderTreeLevel(children)}</ul>
        </li>`;
      }
      return `<li>
        <div class="tree-item" data-type="blob" data-path="${escapeHtml(node.path)}">
          <span class="tree-icon">·</span>
          <span class="tree-name">${escapeHtml(node.name)}</span>
        </div>
      </li>`;
    })
    .join("");
}

function renderSearchResults(query: string) {
  if (!currentTree) return;
  const filtered = filterRelevantEntries(currentTree.entries);
  const results = fuzzyFilterEntries(query, filtered);

  if (results.length === 0) {
    treeContent.innerHTML = `<p class="tree-empty">No files matching "${escapeHtml(query)}"</p>`;
    return;
  }

  treeContent.innerHTML = `<ul class="tree-search-results">${results
    .map((entry) => {
      const name = entry.path.slice(entry.path.lastIndexOf("/") + 1);
      const dir = entry.path.slice(0, entry.path.lastIndexOf("/"));
      return `<li class="tree-search-item" data-path="${escapeHtml(entry.path)}">
        <span class="tree-search-name">${escapeHtml(name)}</span>
        <span class="tree-search-path">${dir ? escapeHtml(dir) : ""}</span>
      </li>`;
    })
    .join("")}</ul>`;
}

function renderBreadcrumb(path: string): string {
  const parts = path.split("/");
  if (parts.length <= 1) return escapeHtml(path);

  const segments: string[] = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const dirPath = parts.slice(0, i + 1).join("/");
    segments.push(`<button class="breadcrumb-seg" data-dir="${escapeHtml(dirPath)}">${escapeHtml(parts[i])}</button>`);
  }
  segments.push(`<span>${escapeHtml(parts[parts.length - 1])}</span>`);
  return segments.join('<span class="breadcrumb-sep">/</span>');
}

async function showFileView(path: string, anchor?: string) {
  if (!currentContext) return;
  showScreen("loading");

  fileBreadcrumb.innerHTML = renderBreadcrumb(path);

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
  header.innerHTML = `<h2>${escapeHtml(ref.owner)}/${escapeHtml(ref.repo)}</h2>
    <button type="button" class="branch-toggle" title="Change branch">
      <span class="branch-label">${escapeHtml(branch)}</span>
    </button>
    <form class="branch-form" hidden>
      <input type="text" class="branch-input" value="${escapeHtml(branch)}" autocomplete="off" />
    </form>`;

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
  overviewActions.innerHTML = "";

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
        <li class="suggestion-item" data-kind="history">
          <span class="label">Recent history</span>
          <span class="path">Latest commits across the repository</span>
        </li>
      </ul>
      <div class="overview-search-container">
        <input id="overview-search" type="text" placeholder="Search files…" autocomplete="off" />
      </div>`;
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

// Overview search → navigate to tree with query
document.addEventListener("input", (e) => {
  const searchInput = e.target as HTMLInputElement;
  if (searchInput.id !== "overview-search" || !currentContext) return;
  const query = searchInput.value.trim();
  if (query) {
    navigate(currentContext, { view: "tree", search: query });
  }
});

// Branch toggle → show input, submit → reload with new branch
document.addEventListener("click", (e) => {
  const toggle = (e.target as HTMLElement).closest(".branch-toggle") as HTMLElement | null;
  if (toggle) {
    const form = toggle.nextElementSibling as HTMLFormElement | null;
    if (form) {
      toggle.hidden = true;
      form.hidden = false;
      const input = form.querySelector(".branch-input") as HTMLInputElement;
      input.focus();
      input.select();
    }
  }
});

document.addEventListener("submit", (e) => {
  const form = (e.target as HTMLElement).closest(".branch-form") as HTMLFormElement | null;
  if (!form || !currentContext) return;
  e.preventDefault();
  const input = form.querySelector(".branch-input") as HTMLInputElement;
  const newBranch = input.value.trim();
  if (!newBranch || newBranch === currentContext.branch) {
    form.hidden = true;
    (form.previousElementSibling as HTMLElement).hidden = false;
    return;
  }
  const ref = { owner: currentContext.owner, repo: currentContext.repo };
  // Override getDefaultBranch by loading tree directly with the chosen branch
  switchBranch(ref, newBranch);
});

async function switchBranch(ref: { owner: string; repo: string }, branch: string) {
  showScreen("loading");
  try {
    const tree = await client.getTree(ref.owner, ref.repo, branch);
    currentContext = { owner: ref.owner, repo: ref.repo, branch };
    currentTree = tree;
    const sources = detectKnowledgeSources(tree.entries);
    const suggestions = suggestEntryPoints(sources, tree.entries);
    renderOverview(ref, branch, sources, suggestions);
    navigate(currentContext, { view: "overview" });
  } catch (err) {
    if (err instanceof GitHubApiError) {
      errorMessage.textContent = `Branch "${branch}" not found or API error.`;
    } else {
      errorMessage.textContent = "Failed to switch branch.";
    }
    showScreen("error");
  }
}

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
    if (kind === "docs") {
      navigate(currentContext, { view: "tree", search: "docs/" });
      return;
    }
    if (kind === "tree") {
      navigate(currentContext, { view: "tree" });
      return;
    }
    if (kind === "history") {
      navigate(currentContext, { view: "history" });
      return;
    }
    if (path) {
      navigate(currentContext, { view: "file", path });
    }
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

// Breadcrumb directory segments → navigate to tree
for (const el of [fileBreadcrumb, historyBreadcrumb]) {
  el.addEventListener("click", (e) => {
    const seg = (e.target as HTMLElement).closest(".breadcrumb-seg") as HTMLElement | null;
    if (seg && currentContext) {
      const dir = seg.dataset.dir;
      if (dir) navigate(currentContext, { view: "tree", search: dir });
    }
  });
}

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

// Issue reference links in beads view → navigate to file
beadsContent.addEventListener("click", (e) => {
  const link = (e.target as HTMLElement).closest(".issue-ref-link") as HTMLElement | null;
  const path = link?.dataset.path;
  if (path && currentContext) {
    navigate(currentContext, { view: "file", path });
  }
});

// Tree: search input → filter or show tree
treeSearch.addEventListener("input", () => {
  const query = treeSearch.value.trim();
  if (query) {
    renderSearchResults(query);
  } else {
    renderTreeNodes();
  }
});

// Tree: click on directory → toggle, click on file → navigate
treeContent.addEventListener("click", (e) => {
  const dirItem = (e.target as HTMLElement).closest('.tree-item[data-type="tree"]') as HTMLElement | null;
  if (dirItem) {
    const children = dirItem.nextElementSibling as HTMLElement | null;
    if (children) {
      const wasHidden = children.hidden;
      children.hidden = !wasHidden;
      const icon = dirItem.querySelector(".tree-icon");
      if (icon) icon.textContent = wasHidden ? "▼" : "▶";
    }
    return;
  }

  const fileItem = (e.target as HTMLElement).closest('.tree-item[data-type="blob"]') as HTMLElement | null;
  if (fileItem && currentContext) {
    const path = fileItem.dataset.path;
    if (path) navigate(currentContext, { view: "file", path });
    return;
  }

  const searchItem = (e.target as HTMLElement).closest(".tree-search-item") as HTMLElement | null;
  if (searchItem && currentContext) {
    const path = searchItem.dataset.path;
    if (path) navigate(currentContext, { view: "file", path });
  }
});

// Back buttons → go back in history (preserves tree → file → back = tree)
for (const btn of [fileBack, beadsBack, historyBack, waiBack, treeBack]) {
  btn.addEventListener("click", () => {
    if (navDepth > 0) {
      history.back();
    } else if (currentContext) {
      navigate(currentContext, { view: "overview" });
    }
  });
}

// Error back → entry
errorBack.addEventListener("click", () => {
  showScreen("entry");
  input.focus();
});

// Browser back/forward → re-route
window.addEventListener("popstate", () => {
  if (navDepth > 0) navDepth--;
  const route = parseRoute(new URLSearchParams(location.search));
  if (route) {
    currentContext = route.context;
    routeTo(route.target);
  } else {
    showScreen("entry");
  }
});

// Theme toggle
const themeToggle = $("theme-toggle")!;

function applyTheme(theme: "light" | "dark" | "auto") {
  document.documentElement.removeAttribute("data-theme");
  if (theme !== "auto") {
    document.documentElement.setAttribute("data-theme", theme);
  }
  themeToggle.textContent = theme === "dark" ? "Light" : theme === "light" ? "Dark" : "Auto";
}

const savedTheme = localStorage.getItem("atril-theme") as "light" | "dark" | null;
applyTheme(savedTheme ?? "auto");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const isDark = current === "dark" ||
    (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  localStorage.setItem("atril-theme", next);
  applyTheme(next);
});

// On page load, check for existing route in URL
const initialRoute = parseRoute(new URLSearchParams(location.search));
if (initialRoute) {
  loadRepo(
    { owner: initialRoute.context.owner, repo: initialRoute.context.repo },
    initialRoute.target,
  );
}
