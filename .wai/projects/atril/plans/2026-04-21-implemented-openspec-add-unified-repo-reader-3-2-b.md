---
tags: [pipeline-run:ticket-cycle-2026-04-20-task-2-4]
---

Implemented OpenSpec add-unified-repo-reader:3.2 by extending repository routing with a beads view that supports graph and focused modes. Added a minimal beads screen in the unified reader so issue suggestions open graph mode, focus routes preserve repository context, and missing dependencies degrade with a fallback message instead of a broken route. Verified with router tests and a build.
