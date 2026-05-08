---
tags: [pipeline-run:ticket-cycle-2026-05-08-atril, pipeline-step:implement]
---

implemented atril-dvg: focus management after view transitions — extracted getScreenFocusSelector() into src/shared/focus-management.ts, wired into showScreen() in main.ts. Screens with explicit post-showScreen .focus() calls (entry, tree, beads filter restore) override the default.
