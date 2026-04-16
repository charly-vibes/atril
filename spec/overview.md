# Overview

## Vision

atril is the read-only presentation layer for the wai ecosystem. It takes the artifacts produced by wai, beads, and openspec and renders them in a format optimized for human reading — clean typography, intuitive navigation, and responsive design.

The name comes from the Spanish word for a music stand: the object that holds the score so musicians can focus on playing. In the same way, atril holds your project's documentation and issues so you can focus on understanding them.

## Relationship to wai

The wai ecosystem has three complementary tools:

| Tool | Purpose |
|------|---------|
| **wai** | Captures *why* decisions were made (reasoning, context, handoffs) |
| **bd** (beads) | Tracks *what* needs to be done (issues, tasks, dependencies) |
| **openspec** | Defines *what the system should look like* (specs, requirements) |

**atril** adds a fourth role: *how you read specs and issues*. It is a pure viewer — it does not create or modify data. It fetches artifacts from GitHub and presents them.

## Components

### Spec Viewer (`/spec-viewer`)

Reads OpenSpec documents from GitHub repositories.

**Core capabilities:**
- Render Markdown, YAML, JSON, TOML files with clean typography
- Hierarchical file tree navigation with search
- Branch switching with file persistence
- Auto-generated table of contents for long documents
- Deep linking via URL parameters (`?repo=`, `&branch=`, `&file=`)
- Relative image resolution via GitHub raw content

**Design priorities:**
- Optimized for tablet reading (generous touch targets, responsive layout)
- Source Serif 4 for body, JetBrains Mono for code, DM Sans for UI
- Warm color palette, dark/light theme support

### Beads Viewer (`/beads-viewer`)

Visualizes issue trackers created with the `bd` CLI.

**Core capabilities:**
- Load `.beads/issues.jsonl` from GitHub repositories
- Filter by status (open/closed/in_progress), type (task/bug/feature/epic), priority (P0-P4)
- Search issues by title and description
- Two viewing modes:
  - **List/Detail**: sidebar browse with full metadata display
  - **Graph**: interactive dependency visualization with pan/zoom
- Branch selection with fallback to `beads-sync` branch
- Shareable URLs for specific repos and issues
- Data freshness indicator

**Design priorities:**
- Same design system as Spec Viewer (shared fonts, palette, theme)
- Dependency graph readable at a glance
- Quick filtering to find what you need

## Technical Constraints

- **No frameworks**: vanilla JavaScript and CSS only
- **Self-contained**: each viewer is a single HTML file with embedded CSS/JS
- **GitHub Pages deployment**: static files, no server
- **Unauthenticated GitHub API**: ~60 requests/hour rate limit
- **No data mutation**: read-only viewers, never write to repositories

## Provenance

Both viewers were originally built as prototypes in [charly-vibes/jams](https://github.com/charly-vibes/jams):

- Spec Viewer: [live prototype](https://charly-vibes.github.io/jams/spec-viewer/)
- Beads Viewer: [live prototype](https://charly-vibes.github.io/jams/beads-viewer/)

This repository promotes them to a dedicated project where they can evolve with tighter integration to the wai ecosystem.

## What Changes

Moving from jams to atril enables:

- **Shared design system**: Extract common styles, fonts, and theme logic into a shared base instead of duplicating across two HTML files
- **Tighter wai integration**: Deep links from `wai` CLI output (e.g. `wai status` could print an atril URL)
- **Cross-viewer navigation**: Jump from a spec to its related beads issues and back
- **GitHub Pages at a dedicated domain**: `charly-vibes.github.io/atril/` instead of nested under jams
- **Independent release cadence**: Viewers can evolve without being coupled to unrelated jams apps
