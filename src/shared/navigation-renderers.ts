import type { TreeNode } from "./file-tree";
import type { GitHubTreeEntry } from "./github-api";
import { escapeHtml } from "./html-utils";
import type { EntryPoint, KnowledgeSources } from "./repo-overview";

export function renderTreeLevel(nodes: TreeNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "tree") {
        const children = node.children ?? [];
        return `<li>
          <button type="button" class="tree-item" data-type="tree" data-path="${escapeHtml(node.path)}">
            <span class="tree-icon">▶</span>
            <span class="tree-name">${escapeHtml(node.name)}</span>
          </button>
          <ul class="tree-children" hidden>${renderTreeLevel(children)}</ul>
        </li>`;
      }
      return `<li>
        <button type="button" class="tree-item" data-type="blob" data-path="${escapeHtml(node.path)}">
          <span class="tree-icon">·</span>
          <span class="tree-name">${escapeHtml(node.name)}</span>
        </button>
      </li>`;
    })
    .join("");
}

export function renderTreeSearchResults(entries: GitHubTreeEntry[]): string {
  return `<ul class="tree-search-results">${entries
    .map((entry) => {
      let name = entry.path.slice(entry.path.lastIndexOf("/") + 1);
      let dir = entry.path.slice(0, entry.path.lastIndexOf("/"));

      if (name === "spec.md" && dir.includes("/specs/") && entry.path.startsWith("openspec/")) {
        name = dir.slice(dir.lastIndexOf("/") + 1);
        dir = dir.slice(0, dir.lastIndexOf("/"));
      }

      return `<li>
        <button type="button" class="tree-search-item" data-path="${escapeHtml(entry.path)}">
          <span class="tree-search-name">${escapeHtml(name)}</span>
          <span class="tree-search-path">${dir ? escapeHtml(dir) : ""}</span>
        </button>
      </li>`;
    })
    .join("")}</ul>`;
}

export function renderBreadcrumb(path: string): string {
  const parts = path.split("/");
  if (parts.length <= 1) return escapeHtml(path);

  const segments: string[] = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const dirPath = parts.slice(0, i + 1).join("/");
    segments.push(`<button type="button" class="breadcrumb-seg" data-dir="${escapeHtml(dirPath)}">${escapeHtml(parts[i]!)}</button>`);
  }
  segments.push(`<span>${escapeHtml(parts[parts.length - 1]!)}</span>`);
  return segments.join('<span class="breadcrumb-sep">/</span>');
}

function getCanonicalSpecPath(path: string): string | undefined {
  const match = path.match(/^openspec\/changes\/[^/]+\/specs\/([^/]+)\/spec\.md$/);
  if (!match) return undefined;
  return `openspec/specs/${match[1]!}/spec.md`;
}

export function renderFileBreadcrumb(path: string, entries: GitHubTreeEntry[]): string {
  const breadcrumb = renderBreadcrumb(path);
  const canonicalSpecPath = getCanonicalSpecPath(path);
  if (!canonicalSpecPath) return breadcrumb;

  const hasCanonical = entries.some((entry) => entry.path === canonicalSpecPath && entry.type === "blob");
  if (!hasCanonical) return breadcrumb;

  return `${breadcrumb}<span class="breadcrumb-meta-sep">·</span><button type="button" class="canonical-spec-link" data-path="${escapeHtml(canonicalSpecPath)}">View canonical spec</button>`;
}

export function renderSourceBadges(sources: KnowledgeSources, suggestions: EntryPoint[]): string {
  const sourceLabels: Array<[keyof KnowledgeSources, string]> = [
    ["openspec", "Specs"],
    ["beads", "Issues"],
    ["wai", "Memory"],
    ["docs", "Docs"],
    ["readme", "README"],
  ];

  const routes = new Map<string, EntryPoint>();
  for (const suggestion of suggestions) {
    if (suggestion.kind === "tree" && suggestion.path === "openspec/specs/") {
      routes.set("openspec", suggestion);
    } else {
      routes.set(suggestion.kind, suggestion);
    }
  }

  return sourceLabels
    .map(([key, label]) => {
      if (!sources[key]) {
        return `<span class="source-badge" data-active="false">${label}</span>`;
      }

      const route = routes.get(key);
      const pathAttr = route?.path ? ` data-path="${escapeHtml(route.path)}"` : "";
      const kindAttr = route?.kind ? ` data-kind="${escapeHtml(route.kind)}"` : "";
      return `<button type="button" class="source-badge" data-active="true" data-source="${escapeHtml(key)}"${kindAttr}${pathAttr}>${label}</button>`;
    })
    .join("");
}

export function renderSuggestionList(suggestions: EntryPoint[]): string {
  return `<ul class="suggestion-list">
    ${suggestions
      .map(
        (s) => `<li>
          <button type="button" class="suggestion-item" data-path="${escapeHtml(s.path)}" data-kind="${escapeHtml(s.kind)}">
            <span class="label">${escapeHtml(s.label)}</span>
            <span class="path">${escapeHtml(s.path)}</span>
          </button>
        </li>`,
      )
      .join("")}
    <li>
      <button type="button" class="suggestion-item" data-kind="history">
        <span class="label">Recent history</span>
        <span class="path">Latest commits across the repository</span>
      </button>
    </li>
  </ul>`;
}
