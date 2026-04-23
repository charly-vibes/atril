import type { BeadsIssue, BeadsLoadResult } from "./beads-loader";
import type { GitHubTreeEntry } from "./github-api";
import { resolveIssueReferences, type IssueReference } from "./issue-reference";
import { escapeHtml } from "./html-utils";

export interface BeadsFilters {
  status?: string;
  type?: string;
  priority?: number;
  search?: string;
}

const PRIORITY_LABELS: Record<number, string> = {
  0: "P0",
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};

const STATUS_LABELS: Record<string, string> = {
  open: "open",
  in_progress: "in progress",
  closed: "closed",
};

function formatPriority(p: number): string {
  return PRIORITY_LABELS[p] ?? `P${p}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderIssueListItem(issue: BeadsIssue, selected: boolean): string {
  const priority = formatPriority(issue.priority);
  const status = STATUS_LABELS[issue.status] ?? issue.status;
  const selectedClass = selected ? " selected" : "";
  return `<li class="beads-list-item${selectedClass}" data-issue-id="${escapeHtml(issue.id)}">
    <span class="beads-item-title">${escapeHtml(issue.title)}</span>
    <span class="beads-item-meta">
      <span class="beads-badge beads-status-${escapeHtml(issue.status)}">${escapeHtml(status)}</span>
      <span class="beads-badge beads-priority">${escapeHtml(priority)}</span>
      <span class="beads-badge beads-type">${escapeHtml(issue.issue_type)}</span>
    </span>
  </li>`;
}

function renderReferences(refs: IssueReference[]): string {
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
  return `<div class="beads-refs">
    <h4>Referenced artifacts</h4>
    <ul>${items.join("")}</ul>
  </div>`;
}

function renderIssueDetail(issue: BeadsIssue, treeEntries?: GitHubTreeEntry[]): string {
  const priority = formatPriority(issue.priority);
  const status = STATUS_LABELS[issue.status] ?? issue.status;

  const metaRows: string[] = [
    `<tr><th>Status</th><td><span class="beads-badge beads-status-${escapeHtml(issue.status)}">${escapeHtml(status)}</span></td></tr>`,
    `<tr><th>Priority</th><td>${escapeHtml(priority)}</td></tr>`,
    `<tr><th>Type</th><td>${escapeHtml(issue.issue_type)}</td></tr>`,
  ];

  if (issue.assignee) {
    metaRows.push(`<tr><th>Assignee</th><td>${escapeHtml(issue.assignee)}</td></tr>`);
  }
  if (issue.created_at) {
    metaRows.push(`<tr><th>Created</th><td>${escapeHtml(formatDate(issue.created_at))}</td></tr>`);
  }
  if (issue.closed_at) {
    metaRows.push(`<tr><th>Closed</th><td>${escapeHtml(formatDate(issue.closed_at))}</td></tr>`);
  }

  const deps = issue.dependencies?.length
    ? `<div class="beads-deps">
        <h4>Dependencies</h4>
        <ul>${issue.dependencies.map((d) =>
          `<li><button class="beads-dep-link" data-issue-id="${escapeHtml(d.depends_on_id)}">${escapeHtml(d.depends_on_id)}</button> <span class="beads-dep-type">(${escapeHtml(d.type)})</span></li>`
        ).join("")}</ul>
      </div>`
    : "";

  const issueText = [issue.title, issue.description ?? ""].join("\n");
  const refs = treeEntries ? resolveIssueReferences(issueText, treeEntries) : [];

  return `<article class="beads-detail">
    <h3>${escapeHtml(issue.title)}</h3>
    <table class="beads-meta">${metaRows.join("")}</table>
    ${issue.description ? `<div class="beads-description"><p>${escapeHtml(issue.description).replace(/\n/g, "<br>")}</p></div>` : ""}
    ${deps}
    ${renderReferences(refs)}
  </article>`;
}

/** Filter issues by status, type, priority, and/or search text. */
export function filterIssues(issues: BeadsIssue[], filters: BeadsFilters): BeadsIssue[] {
  return issues.filter((issue) => {
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.type && issue.issue_type !== filters.type) return false;
    if (filters.priority !== undefined && issue.priority !== filters.priority) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inTitle = issue.title.toLowerCase().includes(q);
      const inDesc = (issue.description ?? "").toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }
    return true;
  });
}

function renderFilterToolbar(filters: BeadsFilters): string {
  const statusOptions = ["", "open", "in_progress", "closed"];
  const typeOptions = ["", "task", "bug", "feature", "epic"];
  const priorityOptions = ["", "0", "1", "2", "3", "4"];

  const statusSelect = `<select class="beads-filter" data-filter="status">
    ${statusOptions.map((v) => `<option value="${v}"${filters.status === v ? " selected" : ""}>${v || "All statuses"}</option>`).join("")}
  </select>`;

  const typeSelect = `<select class="beads-filter" data-filter="type">
    ${typeOptions.map((v) => `<option value="${v}"${filters.type === v ? " selected" : ""}>${v || "All types"}</option>`).join("")}
  </select>`;

  const prioritySelect = `<select class="beads-filter" data-filter="priority">
    ${priorityOptions.map((v) => {
      const selected = filters.priority !== undefined && String(filters.priority) === v ? " selected" : (v === "" && filters.priority === undefined ? " selected" : "");
      return `<option value="${v}"${selected}>${v ? `P${v}` : "All priorities"}</option>`;
    }).join("")}
  </select>`;

  const searchInput = `<input class="beads-search" type="text" placeholder="Search issues…" value="${escapeHtml(filters.search ?? "")}" />`;

  return `<div class="beads-toolbar">
    ${searchInput}
    ${statusSelect}
    ${typeSelect}
    ${prioritySelect}
  </div>`;
}

/** Render the issue list view. If selectedId matches an issue, show its detail panel. */
export function renderBeadsListView(
  result: BeadsLoadResult,
  selectedId?: string,
  filters?: BeadsFilters,
  treeEntries?: GitHubTreeEntry[],
): string {
  if (result.issues.length === 0) {
    return `<section class="beads-panel empty">
      <h3>No issues found</h3>
      <p>The issues file was loaded from the <code>${escapeHtml(result.branch)}</code> branch but contained no issues.</p>
    </section>`;
  }

  const activeFilters = filters ?? {};
  const filtered = filterIssues(result.issues, activeFilters);

  const selected = selectedId
    ? result.issues.find((i) => i.id === selectedId)
    : undefined;

  const listItems = filtered.length > 0
    ? filtered
        .map((issue) => renderIssueListItem(issue, issue.id === selectedId))
        .join("")
    : `<li class="beads-empty-filter">No issues match the current filters</li>`;

  const detail = selected
    ? renderIssueDetail(selected, treeEntries)
    : `<div class="beads-detail-placeholder"><p>Select an issue to view details</p></div>`;

  const freshness = `<p class="beads-freshness">Loaded from <code>${escapeHtml(result.branch)}</code> · ${escapeHtml(formatDate(result.fetchedAt))}</p>`;

  return `<section class="beads-list-view">
    ${freshness}
    ${renderFilterToolbar(activeFilters)}
    <div class="beads-layout">
      <ul class="beads-list">${listItems}</ul>
      <div class="beads-detail-panel">${detail}</div>
    </div>
  </section>`;
}
