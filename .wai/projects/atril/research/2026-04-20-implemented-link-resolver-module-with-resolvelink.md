---
tags: [pipeline-run:ticket-cycle-2026-04-20-phase2, pipeline-step:implement]
---

Implemented link-resolver module with resolveLink() and extractLinks(). 17 tests covering: relative paths, parent-relative, root-relative, anchor-only, file+anchor combo, external URLs, unresolved fallbacks, markdown link extraction (inline + reference-style), image exclusion.
