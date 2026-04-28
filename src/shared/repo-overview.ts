import type { GitHubTreeEntry } from "./github-api";

export interface KnowledgeSources {
  openspec: boolean;
  beads: boolean;
  wai: boolean;
  docs: boolean;
  readme: boolean;
  language: boolean;
}

export interface EntryPoint {
  label: string;
  path: string;
  kind: "openspec" | "beads" | "wai" | "docs" | "readme" | "tree" | "language";
}

const README_PATTERN = /^readme(\.\w+)?$/i;

export function detectKnowledgeSources(entries: GitHubTreeEntry[]): KnowledgeSources {
  let openspec = false;
  let beads = false;
  let wai = false;
  let docs = false;
  let readme = false;
  let language = false;

  for (const entry of entries) {
    if (entry.path.startsWith("openspec/")) openspec = true;
    if (entry.path.startsWith(".beads/")) beads = true;
    if (entry.path === ".wai" || entry.path.startsWith(".wai/")) wai = true;
    if (entry.path.startsWith("docs/")) docs = true;
    if (README_PATTERN.test(entry.path)) readme = true;
    if (entry.type === "blob" && entry.path.startsWith(".wai/resources/ubiquitous-language/contexts/") && entry.path.endsWith(".md")) language = true;
  }

  return { openspec, beads, wai, docs, readme, language };
}

export function suggestEntryPoints(
  sources: KnowledgeSources,
  entries: GitHubTreeEntry[],
): EntryPoint[] {
  const suggestions: EntryPoint[] = [];

  if (sources.openspec) {
    const hasCanonicalSpecs = entries.some(
      (e) => e.type === "blob" && e.path.startsWith("openspec/specs/"),
    );
    suggestions.push({
      label: "Specs",
      path: hasCanonicalSpecs ? "openspec/specs/" : "openspec/changes/",
      kind: "tree",
    });
  }

  if (sources.beads) {
    suggestions.push({
      label: "Issues",
      path: ".beads/issues.jsonl",
      kind: "beads",
    });
  }

  if (sources.wai) {
    suggestions.push({
      label: "Project memory",
      path: ".wai/",
      kind: "wai",
    });
  }

  if (sources.docs) {
    suggestions.push({
      label: "Documentation",
      path: "docs/",
      kind: "docs",
    });
  }

  if (sources.language) {
    suggestions.push({
      label: "Language",
      path: ".wai/resources/ubiquitous-language/",
      kind: "language",
    });
  }

  if (sources.readme) {
    const readmeEntry = entries.find((e) => README_PATTERN.test(e.path));
    if (readmeEntry) {
      suggestions.push({ label: "README", path: readmeEntry.path, kind: "readme" });
    }
  }

  return suggestions;
}
