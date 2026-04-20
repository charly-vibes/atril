---
tags: [pipeline-run:ticket-cycle-2026-04-20-task-2-2, pipeline-step:implement]
---

Implemented repository-aware link routing: router.ts (buildRoute/parseRoute with URL param serialization), updated main.ts with navigate(), file viewer screen, suggestion-click and in-document link resolution via resolveLink, browser history support (popstate + deep linking). 11 router tests + 65 total green.
