---
tags: [pipeline-run:ticket-cycle-2026-04-20-task-2-4]
---

Completed atril-dth as the RED phase for history mode. Added failing tests for GitHubClient.getCommitHistory covering repository-wide history, path-specific history, empty results, separate cache keys, and 404 error handling. Confirmed failure using a focused TypeScript check because bun is unavailable in the current shell PATH.
