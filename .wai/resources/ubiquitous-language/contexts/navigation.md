# Bounded Context: Navigation

URL-based routing across views and repositories. Preserves state across view transitions.

## Key Concepts

| Term | Definition |
|------|------------|
| **Route** | A fully resolved navigation target: `RepoContext + ViewType + view-specific params` |
| **RepoContext** | `{ owner, repo, branch }` — the repository being viewed |
| **ViewType** | One of: `overview`, `file`, `beads`, `history`, `wai`, `tree` — see ViewType table below |
| **Deep Link** | URL-encoded navigation: `?owner=&repo=&branch=&file=&view=` |
| **View Transition** | Switching ViewType while preserving RepoContext |
| **File Selection** | The currently active file path within the tree |

## ViewType Values

| ViewType | Description |
|----------|-------------|
| `overview` | Landing page showing all detected knowledge sources for the repository |
| `file` | Renders a single Markdown file selected from the file tree |
| `beads` | Issue tracker view — filters, dependency graph, issue detail |
| `history` | Git commit log for the repository |
| `wai` | Project memory view — renders `.wai/` memory files |
| `tree` | Raw file tree browser with no document rendering |

## URL Parameters

| Param | Type | Description |
|-------|------|-------------|
| `owner` | string | GitHub username or organization |
| `repo` | string | Repository name |
| `branch` | string | Branch or tag name |
| `file` | string | File path within the tree |
| `view` | ViewType | Active view |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Parse Route** | Extract and validate URL parameters into a Route object |
| **Serialize Route** | Convert Route back to URL query string for sharing |
| **Switch View** | Change ViewType while preserving owner/repo/branch |
| **Switch Branch** | Change branch; preserve file path if it exists on the new branch |
| **Deep Link** | Navigate directly to a specific file and view via URL |

## Invariants

- RepoContext is always present before any view renders
- Branch changes preserve file selection where the path still exists
- All navigation state is serializable to a URL (no hidden state)
- An invalid branch in the URL falls back to the default branch with a user-facing warning
