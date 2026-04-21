import type { GitHubTreeEntry } from "./github-api";
import { escapeHtml } from "./html-utils";

export interface WaiArtifactGroup {
  id: string;
  label: string;
  mode: "project" | "location";
  paths: string[];
}

function isWaiArtifact(path: string): boolean {
  return path.startsWith(".wai/") && path !== ".wai/config.toml";
}

function comparePaths(a: string, b: string): number {
  return a.localeCompare(b);
}

export function buildWaiArtifactGroups(entries: GitHubTreeEntry[]): WaiArtifactGroup[] {
  const artifactPaths = entries
    .filter((entry) => entry.type === "blob" && isWaiArtifact(entry.path))
    .map((entry) => entry.path)
    .sort(comparePaths);

  if (artifactPaths.length === 0) return [];

  const projectGroups = new Map<string, string[]>();
  const locationGroups = new Map<string, string[]>();

  for (const path of artifactPaths) {
    const projectMatch = path.match(/^\.wai\/projects\/([^/]+)\//);
    if (projectMatch) {
      const project = projectMatch[1]!;
      const existing = projectGroups.get(project) ?? [];
      existing.push(path);
      projectGroups.set(project, existing);
      continue;
    }

    const location = path.startsWith(".wai/resources/")
      ? "resources"
      : path.startsWith(".wai/") && path.slice(".wai/".length).includes("/")
        ? path.slice(".wai/".length).split("/")[0]!
        : "root";
    const existing = locationGroups.get(location) ?? [];
    existing.push(path);
    locationGroups.set(location, existing);
  }

  const groups: WaiArtifactGroup[] = [];

  for (const project of [...projectGroups.keys()].sort(comparePaths)) {
    groups.push({
      id: `project:${project}`,
      label: `Project: ${project}`,
      mode: "project",
      paths: [...projectGroups.get(project)!].sort(comparePaths),
    });
  }

  const locationLabels: Record<string, string> = {
    resources: "Shared resources",
    root: "Workspace root",
  };

  for (const location of [...locationGroups.keys()].sort(comparePaths)) {
    groups.push({
      id: `location:${location}`,
      label: locationLabels[location] ?? `Location: ${location}`,
      mode: "location",
      paths: [...locationGroups.get(location)!].sort(comparePaths),
    });
  }

  return groups;
}

export function renderWaiOverview(groups: WaiArtifactGroup[]): string {
  if (groups.length === 0) {
    return `
      <section class="wai-panel empty">
        <h3>No WAI artifacts available</h3>
        <p>This repository exposes a .wai directory but no readable artifacts were detected.</p>
      </section>`;
  }

  const sections = groups
    .map(
      (group) => `
        <section class="wai-group" data-group-id="${escapeHtml(group.id)}">
          <h4>${escapeHtml(group.label)}</h4>
          <ul class="wai-artifact-list">
            ${group.paths
              .map(
                (path) => `
                  <li>
                    <button type="button" class="wai-artifact-link" data-path="${escapeHtml(path)}">
                      <span class="wai-artifact-name">${escapeHtml(path.split("/").pop() ?? path)}</span>
                      <span class="wai-artifact-path">${escapeHtml(path)}</span>
                    </button>
                    <button type="button" class="wai-artifact-history" data-path="${escapeHtml(path)}">History</button>
                  </li>`,
              )
              .join("")}
          </ul>
        </section>`,
    )
    .join("");

  return `
    <section class="wai-panel">
      <h3>WAI artifacts</h3>
      <p class="wai-scope">Grouped by project and shared location for repository memory browsing.</p>
      ${sections}
    </section>`;
}
