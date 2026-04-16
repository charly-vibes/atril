# Tutorial: Take your first spec tour in atril

This tutorial helps you understand the atril spec set in one short reading session. By the end, you will know where to find the product goals, platform constraints, and capability requirements.

## Before you begin

You should have this repository checked out locally.

## Step 1: Read the project overview

Open `openspec/project.md`.

This file tells you:
- what atril is for
- what technologies it uses
- what constraints shape the implementation
- how it fits into the wai ecosystem

As you read, notice that atril is intentionally:
- read-only
- static-hosted
- framework-free
- optimized for readable presentation

## Step 2: Read the platform constraints

Open `openspec/specs/platform/spec.md`.

This is the technical boundary for all viewers. It defines the requirements that every implementation must respect, including:
- vanilla JavaScript and CSS only
- self-contained single-file viewers
- GitHub Pages deployment
- unauthenticated GitHub API usage
- read-only behavior
- in-memory response caching

If you are unsure whether a feature belongs in atril, check this spec first.

## Step 3: Read the shared design rules

Open `openspec/specs/design-system/spec.md`.

This file defines what should feel consistent across viewers:
- typography
- color palette
- dark and light themes
- tablet-first layout
- shared design tokens

Read this after `platform/spec.md` so you can separate visual requirements from platform constraints.

## Step 4: Read one capability spec end to end

Open `openspec/specs/spec-viewer/spec.md`.

As you read, identify the pattern:
1. the capability purpose
2. a requirement
3. one or more scenarios that clarify expected behavior

This file describes how atril should render and navigate openspec content from GitHub repositories.

Pay special attention to these user-facing behaviors:
- file tree navigation
- branch switching
- table of contents generation
- deep linking
- error handling

## Step 5: Compare with the second capability

Open `openspec/specs/beads-viewer/spec.md`.

Now compare it with the spec viewer capability.

Notice what stays the same:
- requirement and scenario structure
- user-centered behaviors
- emphasis on readable presentation

Notice what changes:
- data source (`.beads/issues.jsonl`)
- issue filtering and search
- list/detail browsing
- dependency graph visualization
- freshness feedback

## Step 6: Build a mental model

At this point, you should be able to summarize atril like this:

- `openspec/project.md` explains the project context.
- `openspec/specs/platform/spec.md` defines the technical boundaries.
- `openspec/specs/design-system/spec.md` defines the shared visual language.
- `openspec/specs/spec-viewer/spec.md` defines one reader experience.
- `openspec/specs/beads-viewer/spec.md` defines another reader experience.

## What to do next

Now choose the path that matches your goal:

- If you want to review the specs for quality, read `docs/how-to/review-atril-specs.md`.
- If you want to understand the design rationale, read `docs/explanation/atril-in-the-wai-ecosystem.md` and `docs/explanation/why-atril-uses-single-file-viewers.md`.
- If you want the full documentation map, read `docs/reference/index.md`.
