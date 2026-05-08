---
tags: [pipeline-run:ticket-cycle-2026-05-08-atril, pipeline-step:commit]
---

Ticket atril-dvg done. Implemented focus management after view transitions: extracted getScreenFocusSelector() into src/shared/focus-management.ts, wired into showScreen() in main.ts. Back buttons focused on content-screen transitions; active category card focused on overview. 400 tests pass. Committed as a6e113c and 80d8bdd, pushed.
