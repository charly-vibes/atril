import type { GitHubTreeEntry } from "./github-api";
import { escapeHtml } from "./html-utils";

export interface WaiArtifactGroup {
  id: string;
  label: string;
  mode: "project" | "location";
  paths: string[];
  children?: WaiArtifactGroup[];
}

const INTERNAL_PATTERNS = [
  /^\.wai\/config\.toml$/,
  /^\.wai\/\./, // dotfiles at wai root (.gitignore, .pipeline-run)
  /^\.wai\/[^/]+\/\.[^/]+$/, // dotfiles one level deep
  /^\.wai\/projects\/[^/]+\/\.[^/]+$/, // .state, .pending-resume
  /^\.wai\/pipeline-runs\//, // pipeline run state
  /^\.wai\/resources\/agent-config\//, // agent config/skills
  /^\.wai\/resources\/pipelines\//, // pipeline definitions
];

function isWaiArtifact(path: string): boolean {
  if (!path.startsWith(".wai/")) return false;
  for (const pattern of INTERNAL_PATTERNS) {
    if (pattern.test(path)) return false;
  }
  return true;
}

function comparePaths(a: string, b: string): number {
  return a.localeCompare(b);
}

const SUB_CATEGORY_LABELS: Record<string, string> = {
  handoffs: "Handoffs",
  plans: "Plans",
  research: "Research",
  reviews: "Reviews",
};

const SUB_CATEGORY_ORDER = ["handoffs", "research", "plans", "reviews"];

export function buildWaiArtifactGroups(entries: GitHubTreeEntry[]): WaiArtifactGroup[] {
  const artifactPaths = entries
    .filter((entry) => entry.type === "blob" && isWaiArtifact(entry.path))
    .map((entry) => entry.path)
    .sort(comparePaths);

  if (artifactPaths.length === 0) return [];

  // Classify into PARA buckets
  const projectMap = new Map<string, Map<string, string[]>>(); // project → category → paths
  const resourcePaths: string[] = [];
  const archivePaths: string[] = [];
  const areaPaths: string[] = [];
  const otherPaths: string[] = [];

  for (const path of artifactPaths) {
    const projectMatch = path.match(/^\.wai\/projects\/([^/]+)\/([^/]+)\//);
    if (projectMatch) {
      const project = projectMatch[1]!;
      const category = projectMatch[2]!;
      if (!projectMap.has(project)) projectMap.set(project, new Map());
      const catMap = projectMap.get(project)!;
      const existing = catMap.get(category) ?? [];
      existing.push(path);
      catMap.set(category, existing);
      continue;
    }

    const simpleProjectMatch = path.match(/^\.wai\/projects\/([^/]+)\//);
    if (simpleProjectMatch) {
      const project = simpleProjectMatch[1]!;
      if (!projectMap.has(project)) projectMap.set(project, new Map());
      const catMap = projectMap.get(project)!;
      const existing = catMap.get("other") ?? [];
      existing.push(path);
      catMap.set("other", existing);
      continue;
    }

    if (path.startsWith(".wai/resources/")) {
      resourcePaths.push(path);
    } else if (path.startsWith(".wai/areas/")) {
      areaPaths.push(path);
    } else if (path.startsWith(".wai/archive/")) {
      archivePaths.push(path);
    } else {
      otherPaths.push(path);
    }
  }

  const groups: WaiArtifactGroup[] = [];

  // Projects — each project with sub-category children
  if (projectMap.size > 0) {
    const projectChildren: WaiArtifactGroup[] = [];

    for (const project of [...projectMap.keys()].sort(comparePaths)) {
      const catMap = projectMap.get(project)!;
      const sortedCats = [...catMap.keys()].sort((a, b) => {
        const ai = SUB_CATEGORY_ORDER.indexOf(a);
        const bi = SUB_CATEGORY_ORDER.indexOf(b);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return a.localeCompare(b);
      });

      const children: WaiArtifactGroup[] = sortedCats.map((cat) => ({
        id: `project:${project}:${cat}`,
        label: SUB_CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1),
        mode: "project" as const,
        paths: [...catMap.get(cat)!].sort(comparePaths),
      }));

      projectChildren.push({
        id: `project:${project}`,
        label: project,
        mode: "project",
        paths: [],
        children,
      });
    }

    groups.push({
      id: "para:projects",
      label: "Projects",
      mode: "project",
      paths: [],
      children: projectChildren,
    });
  }

  // Areas
  if (areaPaths.length > 0) {
    groups.push({
      id: "para:areas",
      label: "Areas",
      mode: "location",
      paths: areaPaths,
    });
  }

  // Resources
  if (resourcePaths.length > 0) {
    groups.push({
      id: "para:resources",
      label: "Resources",
      mode: "location",
      paths: resourcePaths,
    });
  }

  // Archive
  if (archivePaths.length > 0) {
    groups.push({
      id: "para:archive",
      label: "Archive",
      mode: "location",
      paths: archivePaths,
    });
  }

  // Root-level wai files
  if (otherPaths.length > 0) {
    groups.push({
      id: "para:other",
      label: "Other",
      mode: "location",
      paths: otherPaths,
    });
  }

  return groups;
}

/** Extract a human-readable title from a WAI artifact filename. */
function readableTitle(path: string): string {
  const filename = path.split("/").pop() ?? path;
  // Strip extension
  const base = filename.replace(/\.\w+$/, "");
  // Strip leading date (YYYY-MM-DD-)
  const withoutDate = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  // Replace hyphens with spaces, capitalize first letter
  const title = withoutDate.replace(/-/g, " ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function renderArtifactList(paths: string[]): string {
  if (paths.length === 0) return "";
  return `<ul class="wai-artifact-list">
    ${paths.map((path) => `
      <li>
        <button type="button" class="wai-artifact-link" data-path="${escapeHtml(path)}">
          <span class="wai-artifact-name">${escapeHtml(readableTitle(path))}</span>
        </button>
      </li>`).join("")}
  </ul>`;
}

function renderGroup(group: WaiArtifactGroup, headingLevel: "h3" | "h4" | "h5"): string {
  const childHtml = group.children
    ? group.children.map((child) => renderGroup(child, headingLevel === "h3" ? "h4" : "h5")).join("")
    : "";

  return `
    <section class="wai-group" data-group-id="${escapeHtml(group.id)}">
      <${headingLevel}>${escapeHtml(group.label)}</${headingLevel}>
      ${renderArtifactList(group.paths)}
      ${childHtml}
    </section>`;
}

export function renderWaiOverview(groups: WaiArtifactGroup[]): string {
  if (groups.length === 0) {
    return `
      <section class="wai-panel empty">
        <h3>No WAI artifacts available</h3>
        <p>This repository exposes a .wai directory but no readable artifacts were detected.</p>
      </section>`;
  }

  return `
    <section class="wai-panel">
      ${groups.map((g) => renderGroup(g, "h3")).join("")}
    </section>`;
}
