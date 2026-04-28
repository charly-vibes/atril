# Change: add OpenSpec-aware navigation panel

## Why
Clicking "Specs" from the overview drops users into a generic file tree where `openspec/` is collapsed alongside `.wai/`, `docs/`, and root files. To reach any spec, users must expand `openspec/` then `specs/` then a capability folder then find `spec.md` -- four clicks through opaque directory names with no descriptions, no status indicators, and no distinction between specs, changes, and archived content. Once reading a spec, the tree disappears entirely: there is no sidebar, no sibling navigation, and no way to jump to another spec without going back to the tree and re-drilling.

The current file tree also creates confusion in the changes view: `design.md`, `proposal.md`, and `tasks.md` from different changes are interleaved as flat entries, making it impossible to understand which change is which or what status each is in.

## What Changes
- Add a persistent OpenSpec-aware navigation panel (sidebar) that appears when the user enters the specs/changes reading flow
- Render specs as a flat list with one-line purpose descriptions extracted from the first paragraph after the `## Purpose` heading in each `spec.md`
- Render changes grouped by change name with status indicators (active vs archived) and the list of affected specs underneath each change
- Keep the navigator visible alongside the document content in a split-pane layout so users can jump between specs and changes without losing their place
- Eliminate the need to expand `openspec/ > specs/ > capability/ > spec.md` by auto-resolving the spec entry point for each capability
- Make the overview source pills (SPECS, ISSUES, MEMORY, DOCS, README) clickable to navigate directly to the corresponding view (affects repo-overview capability)

## Deferred
- Content-aware search within the navigator (beyond path-based filtering)
- Drag-to-resize or collapsible navigator panel
- Keyboard navigation shortcuts (j/k, Enter, Esc)

## Related Changes
- Complementary to `add-spec-change-cross-links`, which adds bidirectional linking between specs and changes. Both share a spec-change index data structure that should be designed for reuse. Either change can be implemented independently.

## Impact
- Affected specs: spec-viewer, repo-overview
- Affected code: `src/main.ts` (screen management, navigation), `src/shared/file-tree.ts` (new OpenSpec-aware tree builder), `src/styles.css` (split-pane layout), `src/index.html` (navigator panel markup)
