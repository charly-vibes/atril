# Project Context

## Purpose

atril is the read-only presentation layer for the wai ecosystem. It renders artifacts produced by wai, beads, and openspec in a format optimized for human reading -- clean typography, intuitive navigation, and responsive design.

The name comes from the Spanish word for a music stand: the object that holds the score so musicians can focus on playing.

## Tech Stack

- Vanilla JavaScript (no frameworks)
- Vanilla CSS (no preprocessors)
- HTML (self-contained single-file viewers)
- GitHub Pages (static hosting)
- GitHub REST API (unauthenticated, content fetching)

## Project Conventions

### Code Style

- Each viewer is a single HTML file with embedded CSS and JS
- No build step, no bundling, no transpilation
- Shared design tokens extracted into a common base where possible

### Architecture Patterns

- URL parameters for deep linking and state sharing
- In-memory session caching of API responses to conserve rate limit
- Progressive enhancement: core content readable without JS where feasible

### Testing Strategy

- TDD: write failing test first, make it pass, tidy in separate commit
- Manual testing against live GitHub repositories
- Visual regression for typography and layout

### Git Workflow

- Feature branches off main
- Conventional commits (type: description)
- beads for issue tracking, openspec for change proposals

## Domain Context

atril sits alongside three other tools in the wai ecosystem:

| Tool | Role |
|------|------|
| **wai** | Captures *why* decisions were made |
| **bd** (beads) | Tracks *what* needs to be done |
| **openspec** | Defines *what the system should look like* |
| **atril** | Presents *how you read* specs and issues |

Both viewers were originally prototyped in [charly-vibes/jams](https://github.com/charly-vibes/jams) and promoted to this dedicated repository.

### Future Goals (not yet specified)

- **Cross-viewer navigation**: jump from a spec to its related beads issues and back
- **wai CLI integration**: deep links from `wai` CLI output (e.g., `wai status` prints an atril URL)

## Important Constraints

- No frameworks: vanilla JavaScript and CSS only
- Self-contained: each viewer is a single HTML file
- No server: GitHub Pages static deployment only
- Unauthenticated GitHub API: ~60 requests/hour rate limit
- Read-only: viewers never create or modify data
- No build step: files must be deployable as-is

## External Dependencies

- **GitHub REST API**: fetching repository contents, file trees, raw content
- **GitHub Pages**: static file hosting at `charly-vibes.github.io/atril/`
- **Google Fonts** (optional CDN): Source Serif 4, JetBrains Mono, DM Sans
