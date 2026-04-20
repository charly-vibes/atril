import { parseRepoInput, type RepoRef } from "./shared/github";
import { GitHubClient, GitHubApiError } from "./shared/github-api";
import {
  detectKnowledgeSources,
  suggestEntryPoints,
  type KnowledgeSources,
  type EntryPoint,
} from "./shared/repo-overview";

const $ = (id: string) => document.getElementById(id);

const screens = {
  entry: $("entry-screen")!,
  overview: $("overview-screen")!,
  loading: $("loading-screen")!,
  error: $("error-screen")!,
};

const form = $("repo-form") as HTMLFormElement;
const input = $("repo-input") as HTMLInputElement;
const repoError = $("repo-error")!;
const errorMessage = $("error-message")!;
const errorBack = $("error-back")!;

const client = new GitHubClient();

function showScreen(name: keyof typeof screens) {
  for (const [key, el] of Object.entries(screens)) {
    (el as HTMLElement).hidden = key !== name;
  }
}

function renderOverview(ref: RepoRef, branch: string, sources: KnowledgeSources, suggestions: EntryPoint[]) {
  const header = $("overview-header")!;
  header.innerHTML = `<h2>${ref.owner}/${ref.repo}</h2><span class="branch">${branch}</span>`;

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
              `<li class="suggestion-item" data-path="${s.path}" data-kind="${s.kind}">
                <span class="label">${s.label}</span>
                <span class="path">${s.path}</span>
              </li>`,
          )
          .join("")}
      </ul>`;
  }
}

async function loadRepo(ref: RepoRef) {
  showScreen("loading");

  try {
    const branch = await client.getDefaultBranch(ref.owner, ref.repo);
    const tree = await client.getTree(ref.owner, ref.repo, branch);
    const sources = detectKnowledgeSources(tree.entries);
    const suggestions = suggestEntryPoints(sources, tree.entries);

    renderOverview(ref, branch, sources, suggestions);
    showScreen("overview");
  } catch (err) {
    if (err instanceof GitHubApiError) {
      errorMessage.textContent = err.message;
    } else {
      errorMessage.textContent = "Failed to load repository. Check your connection.";
    }
    showScreen("error");
  }
}

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

errorBack.addEventListener("click", () => {
  showScreen("entry");
  input.focus();
});
