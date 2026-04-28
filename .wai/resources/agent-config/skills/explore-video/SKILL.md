---
name: explore-video
description: Record a Playwright walkthrough video of the atril site to validate navigation and UX across all views.
---

# Explore Video

Record a headless Playwright video that exercises every major view of the atril site
against a real GitHub repository. Use this after significant UI changes to produce a
visual record of what works and catch navigation dead-ends.

## Script location

```
.wai/resources/scripts/explore-video.ts
```

## Prerequisites

- Dev server running on `http://localhost:3000` (or start it: `bun run dev`)
- Playwright chromium installed: `bunx playwright install chromium`

## Run

```bash
bun run .wai/resources/scripts/explore-video.ts
```

Output lands in `exploration/videos/`. Multiple `.webm` segments are produced
(one per `page.goto()` call). Concatenate with ffmpeg:

```bash
cd exploration/videos
ls -lt *.webm | awk 'NR<=N{print $NF}' | tac | \
  awk '{print "file \047" $0 "\047"}' > /tmp/concat.txt
ffmpeg -y -f concat -safe 0 -i /tmp/concat.txt -c copy atril-exploration.webm
```

Replace `N` with the number of segments from the latest run (check timestamps).

## What is covered

| Step | View | What is validated |
|------|------|-------------------|
| 1 | Landing | Repo entry form renders |
| 2 | Overview | All entry-point badges and suggestion list visible |
| 3 | Specs | `openspec/changes/` file list (or `openspec/specs/` if canonical) |
| 4 | Spec file | Collapsible requirement/scenario sections |
| 5 | Memory | `.wai/` grouped artifact browsing |
| 6 | Docs | `docs/` file list and document render |
| 7 | README | Markdown render |
| 8 | History | Recent commits list |
| 9 | Tree search | Fuzzy file search (`spec.md`, `proposal`) |
| 10 | File tree | Collapsible directory browsing |
| 11 | Breadcrumb | Click segment to navigate up |
| 12 | Theme toggle | Light ↔ dark |

## Updating the script

Edit `.wai/resources/scripts/explore-video.ts`. Key constants at the top:

```ts
const BASE  = "http://localhost:3000";
const REPO  = "charly-vibes/dont";   // change to test another repo
const QUERY = `owner=charly-vibes&repo=dont&branch=main`;
```

When buttons are ambiguous (badge + suggestion both present), use `.first()` or
a more specific selector (e.g. `page.locator("#tree-search")`).
