import type { CommitHistoryEntry } from "./github-api";
import { escapeHtml } from "./html-utils";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function renderHistoryOverview(commits: CommitHistoryEntry[], path?: string, repoSlug?: string): string {
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
      const lines = commit.message.split("\n");
      const title = lines[0] ?? "";
      const body = lines.slice(1).join("\n").trim();

      const changedPaths = commit.changedPaths?.length
        ? `<ul class="changed-paths">${commit.changedPaths
            .slice(0, 5)
            .map((changedPath) => `<li><button type="button" class="changed-path-link" data-path="${escapeHtml(changedPath)}">${escapeHtml(changedPath)}</button></li>`)
            .join("")}</ul>`
        : "";

      const hasDetails = body || changedPaths;
      const metaHtml = `<p class="history-meta"><span>${escapeHtml(commit.authorName)}</span> <span>${escapeHtml(formatDate(commit.authoredAt))}</span></p>`;
      const detailsContent = `${metaHtml}${body ? `<pre class="history-body">${escapeHtml(body)}</pre>` : ""}${changedPaths}`;
      const shortSha = escapeHtml(commit.sha.slice(0, 7));
      const shaHtml = repoSlug
        ? `<a class="history-sha" href="https://github.com/${escapeHtml(repoSlug)}/commit/${escapeHtml(commit.sha)}" target="_blank" rel="noopener">${shortSha}</a>`
        : `<span class="history-sha">${shortSha}</span>`;

      return `
        <li class="history-item">
          ${hasDetails ? `<details>
            <summary class="history-summary">
              ${shaHtml}
              <span class="history-title">${escapeHtml(title)}</span>
            </summary>
            ${detailsContent}
          </details>` : `<div class="history-summary">
            ${shaHtml}
            <span class="history-title">${escapeHtml(title)}</span>
            ${metaHtml}
          </div>`}
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
