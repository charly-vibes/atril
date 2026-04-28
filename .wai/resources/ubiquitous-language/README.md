# Ubiquitous Language — Atril

Atril is a read-only presentation layer that renders GitHub-hosted project artifacts (specifications, issues, documentation, and project memory) in tablet-optimized, navigable web viewers. The name is Spanish for "music stand" — atril holds your project's knowledge readable without friction.

## How to Use This Language

These terms are **canonical**. Use them in identifiers, PR titles, commit messages, issue descriptions, and code comments. Avoid synonyms — if a concept has a name here, use that name exactly. When a term is ambiguous or missing, add it to the relevant bounded context file rather than inventing local vocabulary.

## System Summary

Atril consists of **single-file viewers** — HTML+CSS+JS embedded in one `.html` file, deployed to GitHub Pages with no build step. Each viewer targets a knowledge artifact category. Viewers access public GitHub repositories without authentication, subject to API rate limits.

## Core Objects

| Term | Definition |
|------|------------|
| **Repository** | A GitHub repository containing project artifacts (specs, issues, docs, project memory) |
| **Artifact** | Any knowledge asset in the repository: spec, issue, document, or `.wai/` memory file |
| **Tree Entry** | A file or directory node returned by the GitHub Trees API (`{ path, type, sha }`) |
| **Viewer** | A single-file HTML application that renders one artifact category (spec-viewer, beads-viewer) |
| **Knowledge Source** | A category identified by the presence of specific paths: `openspec/` → openspec, `.beads/` → beads, `.wai/` → wai, `docs/` → docs, `README.md` → readme |
| **Route** | A fully resolved navigation target: `RepoContext + ViewType + view-specific state` |
| **RepoContext** | The repository being viewed: `{ owner, repo, branch }` |
| **ViewType** | One of: `overview`, `file`, `beads`, `history`, `wai`, `tree` |

## OpenSpec Domain

| Term | Definition |
|------|------------|
| **Capability** | A named feature defined in `openspec/specs/<capability>/spec.md` |
| **Specification** | A Markdown document defining normative requirements for a capability |
| **Requirement** | A normative statement: "The system SHALL [behavior]", uniquely identified by capability + name |
| **Scenario** | A concrete example under a requirement — `#### Scenario: <name>` with WHEN/THEN structure |
| **Change** | A proposed modification (add/modify/remove/rename) to one or more capabilities |
| **Change ID** | Kebab-case, verb-led identifier (e.g., `add-unified-repo-reader`) |
| **Delta Spec** | Incremental spec under `changes/<id>/specs/` using `## ADDED\|MODIFIED\|REMOVED\|RENAMED Requirements` |
| **Archived Change** | A completed change moved to `changes/archive/<date>-<change-id>/` after deployment |
| **Capability Affinity** | Mapping of which capabilities are affected by which changes (bidirectional) |

## beads Domain

| Term | Definition |
|------|------------|
| **Issue** | A tracked work item: `{ id, title, status, priority, type, dependencies }` |
| **Status** | `open`, `in_progress`, or `closed` |
| **Priority** | P0 (critical) → P4 (backlog) |
| **Type** | `task`, `bug`, `feature`, or `epic` |
| **Dependency** | A directed relationship: issue A depends on issue B (B must close before A can start) |
| **Issue Reference** | Artifact reference extracted from issue text (Markdown link or OpenSpec shorthand) |

## Navigation

| Term | Definition |
|------|------------|
| **Deep Link** | URL-encoded navigation target (`?owner=&repo=&branch=&file=&view=`) |
| **File Tree** | Hierarchical repository structure filtered to: `openspec/`, `.wai/`, `docs/`, top-level `.md` files |
| **Link Resolution** | Multi-strategy: relative path → root-relative → anchor → external URL |
| **Truncated Response** | GitHub API `truncated: true` — tree too large to fetch completely |

## Rendering

| Term | Definition |
|------|------------|
| **Markdown Rendering** | GFM via `marked` library with heading anchors, syntax highlighting, and image resolution |
| **Table of Contents** | Auto-generated for documents with 3+ headings |
| **Design Token** | CSS custom property (`--color-bg`, `--color-fg`, etc.) applied consistently across viewers |
| **Theme** | Dark or light mode; detected via `prefers-color-scheme`, persisted in `localStorage` |

## Bounded Contexts

| Context | File | Purpose |
|---------|------|---------|
| spec-viewer | [spec-viewer.md](contexts/spec-viewer.md) | Document rendering, tree navigation, file content fetching |
| beads-viewer | [beads-viewer.md](contexts/beads-viewer.md) | Issue loading, filtering, dependency graph visualization |
| wai | [wai.md](contexts/wai.md) | Project memory rendering, `.wai/` tree navigation |
| openspec | [openspec.md](contexts/openspec.md) | Spec structure, change proposals, capability indexing |
| navigation | [navigation.md](contexts/navigation.md) | URL routing, state preservation, deep links |
| github-integration | [github-integration.md](contexts/github-integration.md) | API clients, rate limiting, authentication |
| design | [design.md](contexts/design.md) | Typography, color palette, theme switching, accessibility |

## Wai Ecosystem

Atril is part of a four-tool system:

| Tool | Role | Access |
|------|------|--------|
| **wai** | *Why* — research, reasoning, design decisions | read/write |
| **bd / beads** | *What to do* — issue tracking (tasks, bugs, features) | read/write |
| **openspec** | *What it should look like* — specifications and change proposals | read/write |
| **atril** | *How you read it* — renders all of the above | **read-only** |
