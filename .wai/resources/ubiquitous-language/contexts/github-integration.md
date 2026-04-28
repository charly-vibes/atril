# Bounded Context: GitHub Integration

Handles all communication with the GitHub API. Atril accesses public repositories without authentication (~60 requests/hour rate limit).

## Key Concepts

| Term | Definition |
|------|------------|
| **Trees API** | GitHub endpoint returning the full recursive file tree for a branch |
| **Contents API** | GitHub endpoint returning the raw content of a specific file |
| **Rate Limit** | ~60 unauthenticated API requests per hour per IP |
| **Truncated Response** | `{ truncated: true }` — tree is too large to return completely |
| **Session Cache** | In-memory cache of API responses; cleared on page reload |
| **Tree Entry** | `{ path, type (blob\|tree), sha }` — one node returned by the Trees API |
| **Default Branch** | The repository's primary branch (e.g., `main`, `master`); fetched on first load |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Fetch Tree** | `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` |
| **Fetch File** | `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}` |
| **Detect Default Branch** | `GET /repos/{owner}/{repo}` → `.default_branch` |
| **Cache Response** | Store API result in session cache keyed by URL |
| **Detect Rate Limit** | Check HTTP 403 + message for rate limit exceeded |
| **Detect Truncation** | Check `tree.truncated === true` after tree fetch |

## Invariants

- Viewers support public repositories only; private repositories are not supported
- All API responses are cached in-memory to minimize request count
- Rate limit errors surface a clear user-facing message (not a silent failure)
- Truncated trees surface a warning rather than silently showing incomplete data
