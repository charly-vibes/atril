import { escapeHtml } from "./html-utils";
import type { OpenSpecIndex } from "./openspec-index";

interface RenderOpenSpecWorkspaceOptions {
  renderedSpecsHtml?: string;
  taskSummaries?: Record<string, { done: number; total: number }>;
}

/** Count `- [x]` (done) and `- [ ]` (open) checkboxes in markdown task content. */
export function parseTaskSummary(content: string): { done: number; total: number } | null {
  const done = (content.match(/- \[x\]/gi) ?? []).length;
  const open = (content.match(/- \[ \]/g) ?? []).length;
  const total = done + open;
  return total === 0 ? null : { done, total };
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function listItems(values: string[], toLabel = (value: string) => value): string {
  if (values.length === 0) return "";
  return `<ul>${values.map((value) => `<li>${escapeHtml(toLabel(value))}</li>`).join("")}</ul>`;
}

function linkedPathItems(paths: string[], className: string, toLabel = (path: string) => path): string {
  if (paths.length === 0) return "";
  return `<ul>${paths.map((path) => {
    return `<li><button type="button" class="${className}" data-path="${escapeHtml(path)}">${escapeHtml(toLabel(path))}</button></li>`;
  }).join("")}</ul>`;
}

function projectDocumentItems(paths: string[]): string {
  return linkedPathItems(paths, "workspace-document-link", (path) => path.replace(/^openspec\//, ""));
}

function workspaceFileItems(paths: string[]): string {
  return linkedPathItems(paths, "workspace-file-link");
}

function projectEmptyState(projectDocuments: string[]): string {
  if (projectDocuments.includes("openspec/project.md")) return "";
  return `<p class="workspace-empty">No project.md yet — add openspec/project.md to describe project conventions and context.</p>`;
}

function renderChangeCard(
  changeId: string,
  files: string[],
  taskSummary?: { done: number; total: number },
): string {
  const fileSet = new Set(files);
  const base = `openspec/changes/${changeId}`;
  const proposalPath = `${base}/proposal.md`;
  const tasksPath = `${base}/tasks.md`;
  const designPath = `${base}/design.md`;
  const specDeltaPaths = files
    .filter((p) => p.startsWith(`${base}/specs/`) && p.endsWith("/spec.md"))
    .sort();

  function presentDoc(path: string, label: string): string {
    return `<li class="change-doc"><button type="button" class="workspace-document-link" data-path="${escapeHtml(path)}">${escapeHtml(label)}</button></li>`;
  }
  function missingDoc(name: string): string {
    return `<li class="change-doc change-doc-missing"><span class="missing-doc-name">${escapeHtml(name)}</span> <em class="missing-label">missing</em></li>`;
  }

  const items: string[] = [];
  items.push(fileSet.has(proposalPath) ? presentDoc(proposalPath, "proposal.md") : missingDoc("proposal.md"));
  items.push(fileSet.has(tasksPath) ? presentDoc(tasksPath, "tasks.md") : missingDoc("tasks.md"));
  if (fileSet.has(designPath)) items.push(presentDoc(designPath, "design.md"));
  for (const delta of specDeltaPaths) {
    const capability = delta.slice(`${base}/specs/`.length).replace("/spec.md", "");
    items.push(presentDoc(delta, `delta: ${capability}`));
  }

  const summaryHtml = taskSummary
    ? `<p class="change-task-summary">${taskSummary.done}/${taskSummary.total} tasks complete</p>`
    : "";

  return `<article class="change-card" data-change-id="${escapeHtml(changeId)}">
    <h3>${escapeHtml(changeId)}</h3>
    ${summaryHtml}
    <ul class="change-documents">${items.join("")}</ul>
  </article>`;
}

/**
 * Render the OpenSpec workspace landing page from the cached tree index.
 * The overview intentionally uses index data only; optional rendered spec content
 * may be passed by callers that preserve the legacy specs bundle below it.
 */
export function renderOpenSpecWorkspaceOverview(
  index: OpenSpecIndex,
  options: RenderOpenSpecWorkspaceOptions = {},
): string {
  const rawWorkspaceFiles = [...index.workspaceFiles].sort();
  const projectDocuments = [...index.projectDocuments]
    .filter((path) => path === "openspec/project.md" || path === "openspec/AGENTS.md")
    .sort();

  const specsContent = index.capabilities.length > 0
    ? listItems(index.capabilities)
    : `<p class="workspace-empty">No current specs found.</p>`;

  const changesContent = index.changes.length > 0
    ? index.changes
        .map((id) => renderChangeCard(id, index.changeFiles[id] ?? [], options.taskSummaries?.[id]))
        .join("")
    : `<p class="workspace-empty">No active changes found.</p>`;

  const archiveContent = index.archivedChanges.length > 0
    ? listItems(index.archivedChanges)
    : `<p class="workspace-empty">No archived changes found.</p>`;

  const projectContent = projectDocuments.length > 0
    ? projectDocumentItems(projectDocuments)
    : `<p class="workspace-empty">No project documents found.</p>`;

  const filesContent = rawWorkspaceFiles.length > 0
    ? workspaceFileItems(rawWorkspaceFiles)
    : `<p class="workspace-empty">No OpenSpec workspace files found.</p>`;

  const renderedSpecs = options.renderedSpecsHtml
    ? `<section class="workspace-specs-bundle" aria-label="Rendered specs bundle">${options.renderedSpecsHtml}</section>`
    : "";

  return `
    <section class="openspec-workspace-overview">
      <h1>OpenSpec Workspace</h1>
      <p class="workspace-intro">Project context, current specs, active changes, archive, and raw OpenSpec files in one workspace.</p>
      <div class="workspace-section-grid">
        <section class="workspace-section" data-workspace-section="project">
          <h2>Project</h2>
          <p class="workspace-count">${plural(projectDocuments.length, "document")}</p>
          ${projectEmptyState(projectDocuments)}
          ${projectContent}
        </section>
        <section class="workspace-section" data-workspace-section="specs">
          <h2>Specs</h2>
          <p class="workspace-count">${plural(index.capabilities.length, "capability", "capabilities")}</p>
          ${specsContent}
          ${renderedSpecs}
        </section>
        <section class="workspace-section" data-workspace-section="changes">
          <h2>Changes</h2>
          <p class="workspace-count">${plural(index.changes.length, "active change")}</p>
          ${changesContent}
        </section>
        <section class="workspace-section" data-workspace-section="archive">
          <h2>Archive</h2>
          <p class="workspace-count">${plural(index.archivedChanges.length, "archived change")}</p>
          ${archiveContent}
        </section>
        <section class="workspace-section" data-workspace-section="files">
          <h2>Files</h2>
          <p class="workspace-count">${plural(rawWorkspaceFiles.length, "workspace file")}</p>
          ${filesContent}
        </section>
      </div>
    </section>`;
}
