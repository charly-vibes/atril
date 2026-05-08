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
  const items = entries.map((entry) => {
    const slash = entry.path.lastIndexOf("/");
    let name = slash === -1 ? entry.path : entry.path.slice(slash + 1);
    let dir = slash === -1 ? "" : entry.path.slice(0, slash);

    if (name === "spec.md" && dir.includes("/specs/") && entry.path.startsWith("openspec/")) {
      name = dir.slice(dir.lastIndexOf("/") + 1);
      dir = dir.slice(0, dir.lastIndexOf("/"));
    }

    return { path: entry.path, name, dir };
  });

  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const bucket = groups.get(item.dir) ?? [];
    bucket.push(item);
    groups.set(item.dir, bucket);
  }

  if (groups.size === 1) {
    const [commonDir, groupItems] = [...groups.entries()][0]!;
    const label = commonDir || "(root)";
    const listItems = groupItems!
      .map(
        ({ path, name }) => `<li>
        <button type="button" class="tree-search-item" data-path="${escapeHtml(path)}">
          <span class="tree-search-name">${escapeHtml(name)}</span>
        </button>
      </li>`,
      )
      .join("");
    return `<ul class="tree-search-results"><li class="tree-search-section-header">${escapeHtml(label)}</li>${listItems}</ul>`;
  }

  const sections = [...groups.entries()]
    .map(([dir, groupItems]) => {
      const dirLabel = dir || "(root)";
      const header = `<li class="tree-search-section-header">${escapeHtml(dirLabel)}</li>`;
      const listItems = groupItems
        .map(
          ({ path, name }) => `<li>
          <button type="button" class="tree-search-item" data-path="${escapeHtml(path)}">
            <span class="tree-search-name">${escapeHtml(name)}</span>
          </button>
        </li>`,
        )
        .join("");
      return `${header}${listItems}`;
    })
    .join("");

  return `<ul class="tree-search-results">${sections}</ul>`;
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

function getCapabilityFromSpecPath(path: string): string | undefined {
  const match = path.match(/^openspec\/specs\/([^/]+)\/spec\.md$/);
  return match ? match[1] : undefined;
}

export function renderPendingChangeIndicator(
  path: string,
  capabilityAffectedBy: Record<string, string[]>,
  changeFiles: Record<string, string[]>,
): string {
  const capability = getCapabilityFromSpecPath(path);
  if (!capability) return "";

  const affectingChanges = capabilityAffectedBy[capability] ?? [];
  if (affectingChanges.length === 0) return "";

  const items = affectingChanges.map((changeId) => {
    const proposalPath = `openspec/changes/${changeId}/proposal.md`;
    const hasProposal = (changeFiles[changeId] ?? []).includes(proposalPath);
    return hasProposal
      ? `<li><button type="button" class="pending-change-link" data-path="${escapeHtml(proposalPath)}">${escapeHtml(changeId)}</button></li>`
      : `<li><span class="pending-change-name">${escapeHtml(changeId)}</span></li>`;
  });

  return `<div class="pending-changes-indicator"><ul class="pending-change-list">${items.join("")}</ul></div>`;
}

export function renderFileActions(): string {
  return `<button type="button" id="file-history">History</button>
    <button type="button" class="copy-link-button" data-copy-scope="file" aria-label="Copy link to current file">🔗</button>`;
}

const inactiveBadgeTitles: Record<string, string> = {
  openspec: "No specs found in this repository",
  beads: "No issues found in this repository",
  wai: "No memory found in this repository",
  docs: "No docs found in this repository",
  readme: "No README found in this repository",
  language: "No language glossary found in this repository",
};

export function renderSourceBadges(sources: KnowledgeSources, suggestions: EntryPoint[]): string {
  const sourceLabels: Array<[keyof KnowledgeSources, string]> = [
    ["openspec", "Specs"],
    ["beads", "Issues"],
    ["wai", "Memory"],
    ["language", "Language"],
    ["docs", "Docs"],
    ["readme", "README"],
  ];

  const routes = new Map<string, EntryPoint>();
  for (const suggestion of suggestions) {
    if (suggestion.kind === "tree" && (suggestion.path === "openspec/specs/" || suggestion.path === "openspec/changes/")) {
      routes.set("openspec", suggestion);
      continue;
    }

    routes.set(suggestion.kind, suggestion);
  }

  return sourceLabels
    .map(([key, label]) => {
      if (!sources[key]) {
        const title = inactiveBadgeTitles[key] ?? `No ${label.toLowerCase()} found in this repository`;
        return `<span class="source-badge" data-active="false" title="${title}">${label}</span>`;
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
