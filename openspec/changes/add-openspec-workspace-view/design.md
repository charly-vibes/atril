# Design: OpenSpec workspace view

## Context

OpenSpec work is not limited to canonical specs. An author/reviewer must read project-level conventions in `openspec/project.md`, inspect current truth under `openspec/specs/`, review proposed futures under `openspec/changes/`, and occasionally consult archived changes under `openspec/changes/archive/`.

The current Specs entry path can leave users without visible project context and treats important OpenSpec artifacts as raw files. Existing proposed work (`add-openspec-navigator`) improves semantic navigation, but this change captures the broader product model: the Specs view is an OpenSpec workspace, and active changes are first-class review objects.

## Goals

- Make the Specs entry point represent the whole `openspec/` workspace.
- Provide an orienting landing page for author/reviewer workflows.
- Make `openspec/project.md` selectable and visible as project context.
- Make active changes first-class objects with grouped proposal/tasks/design/deltas.
- Support navigation loops: project -> spec -> related change -> affected spec -> archive/history.
- Keep a raw files escape hatch for uncommon documents and troubleshooting.

## Non-Goals

- Running `openspec validate` in the browser.
- Editing or creating OpenSpec files.
- Inferring implementation state beyond what is available in repository files.
- Replacing the generic repository file tree for non-OpenSpec content.

## User Model

Primary user: OpenSpec author/reviewer.

They need to answer four questions:

| State | Question | Workspace area |
| --- | --- | --- |
| Project context | What rules and context govern this repo? | Project |
| Current truth | What is specified now? | Specs |
| Proposed future | What is changing? | Changes |
| History | What changed before? | Archive |

## Information Architecture

The workspace should expose these top-level areas as semantic workspace sections. The implementation may choose tabs, cards, or a sidebar/list-detail layout, but the overview must make each section directly selectable without raw directory traversal:

1. **Overview** — summary of OpenSpec workspace contents and recommended entry points.
2. **Project** — project-level documents: `openspec/project.md` when present and `openspec/AGENTS.md` when present.
3. **Specs** — canonical capabilities under `openspec/specs/`.
4. **Changes** — active proposals under `openspec/changes/*`, excluding archive.
5. **Archive** — completed changes under `openspec/changes/archive/*`; collapsed or hidden when empty.
6. **Files** — raw `openspec/` tree fallback.

The external route/link may remain labeled "Specs" for continuity from the repository overview, but once entered the visible page heading should say "OpenSpec Workspace".

## Decisions

- Decision: default entry should be an overview, not a single opened document.
  - Rationale: authors/reviewers need orientation before choosing project context, specs, or changes.
- Decision: `project.md` should be selectable, not automatically expanded inline.
  - Rationale: it is a first-class document and should be shareable/navigable like specs and proposals.
- Decision: `openspec/AGENTS.md` should appear under Project documents when present, and also remain reachable from Files.
  - Rationale: authors/reviewers use it as workspace operating guidance, but it is not a substitute for `project.md`.
- Decision: active changes should be first-class and prominent.
  - Rationale: author/reviewer work is often centered on proposals, tasks, design notes, and deltas.
- Decision: archive should be available but visually lower priority, and hidden or collapsed when empty rather than occupying primary overview space.
  - Rationale: history is useful context but less urgent than active changes.
- Decision: raw files remain as an escape hatch.
  - Rationale: OpenSpec workspaces may include supporting documents not covered by semantic sections.

## Relationship to Active Changes

**Sequencing decision (2026-05-07)**: merge — this change absorbs `add-openspec-navigator` and `add-spec-change-cross-links` into a single unified implementation rather than treating them as separate sequential deliverables. All three share the same OpenSpec index and information architecture; implementing them separately would create duplicate scans and redundant rendering paths.

This change supersedes the unresolved scope question in `add-openspec-navigator` about whether `openspec/project.md` belongs in the OpenSpec navigation experience. The workspace view requires Project documents to be first-class, so the navigator rendering is one presentation of the workspace model rather than an independent feature.

This change absorbs `add-spec-change-cross-links`: cross-links provide document-level relationships within the same workspace overview. Both must reuse the same OpenSpec index; they are delivered together in this change.

This change builds on the repository-entry behavior from `add-unified-repo-reader`: the existing Specs pill may continue to route users into OpenSpec content, but the landing experience becomes the workspace overview.

## Risks / Trade-offs

- Risk: overlap with `add-openspec-navigator` creates duplicate implementation work.
  - Mitigation: implement the workspace model as the product-level information architecture, and treat navigator rendering as one possible presentation of the same sections.
- Risk: too many top-level sections overwhelm readers.
  - Mitigation: use overview cards and progressive disclosure; archive can be collapsed by default.
- Risk: some repositories have partial OpenSpec workspaces.
  - Mitigation: show explicit empty/missing states for absent `project.md`, specs, changes, or archives.

## Resolved Questions

- UI label: the repository entry link may remain "Specs", but the entered page heading is "OpenSpec Workspace".
- `openspec/AGENTS.md` placement: show under Project documents when present and keep reachable in Files.
- Archive grouping: initially group by raw archived change directory name; date parsing can be added later if needed.
