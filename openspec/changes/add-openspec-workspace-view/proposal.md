# Change: Add OpenSpec workspace view

## Why

The current Specs entry point behaves like a file/spec reader, so authors and reviewers do not get immediate access to the whole OpenSpec workspace. In particular, `openspec/project.md` is not presented as a selectable project-context document, active changes are not first-class review objects, and users must manually assemble the relationship between project context, current specs, proposed changes, and archives.

Authors and reviewers need the Specs view to answer: what project context governs this repository, what is current truth, what is changing, and what history exists?

## What Changes

- Reframe the Specs entry point as an OpenSpec workspace view covering the whole `openspec/` directory, not only `openspec/specs/`.
- Add an overview/landing experience that summarizes project documents, current specs, active changes, archived changes, and raw workspace files.
- Treat `openspec/project.md` and `openspec/AGENTS.md` as selectable first-class project documents rather than hidden context or automatic inline content.
- Treat active changes under `openspec/changes/*` as first-class review objects with proposal, tasks, optional design, spec delta documents grouped by change, and missing-document indicators for incomplete changes.
- Preserve author/reviewer workflows for moving between project context, current specs, active changes, archived changes, and raw files.
- Clarify that archives are available for historical reference but lower priority than active changes.

## Impact

- Affected specs: spec-viewer
- Related active changes: supersedes the `project.md` exclusion/open question in `add-openspec-navigator`; complements `add-spec-change-cross-links`; builds on `add-unified-repo-reader`
- Affected code: likely `src/main.ts`, `src/shared/openspec-index.ts`, navigation/rendering helpers, `src/index.html`, `src/styles.css`, and associated unit tests
