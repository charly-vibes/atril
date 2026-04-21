import type { CommitHistoryEntry } from "./github-api";
import { escapeHtml } from "./html-utils";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().replace(".000Z", "Z");
}

export function renderHistoryOverview(commits: CommitHistoryEntry[], path?: string): string {
  if (commits.length === 0) {
    return `
      <section class="history-panel empty">
        <h3>No history available</h3>
        <p>${path ? `No commits were found for <code>${escapeHtml(path)}</code>.` : "No recent commits were found for this repository."}</p>
      </section>`;
  }

  const scope = path
    ? `<p class="history-scope">Showing recent commits for <code>${escapeHtml(path)}</code>.</p>`
    : `<p class="history-scope">Showing up to 30 recent commits for this repository.</p>`;

  const items = commits
    .map((commit) => {
      const changedPaths = commit.changedPaths?.length
        ? `<ul class="changed-paths">${commit.changedPaths
            .slice(0, 5)
            .map((changedPath) => `<li><button type="button" class="changed-path-link" data-path="${escapeHtml(changedPath)}">${escapeHtml(changedPath)}</button></li>`)
            .join("")}</ul>`
        : `<p class="changed-paths-empty">Changed paths unavailable for this commit.</p>`;

      return `
        <li class="history-item">
          <h4>${escapeHtml(commit.message)}</h4>
          <p class="history-meta">
            <span class="author">${escapeHtml(commit.authorName)}</span>
            <span class="timestamp">${escapeHtml(formatTimestamp(commit.authoredAt))}</span>
            <span class="sha">${escapeHtml(commit.sha.slice(0, 7))}</span>
          </p>
          ${changedPaths}
        </li>`;
    })
    .join("");

  return `
    <section class="history-panel">
      <h3>Recent commits</h3>
      ${scope}
      <ol class="history-list">${items}</ol>
    </section>`;
}
