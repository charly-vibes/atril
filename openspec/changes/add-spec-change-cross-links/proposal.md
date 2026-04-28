# Change: add bidirectional cross-links between specs and changes

## Why
OpenSpec has a strong structural relationship between specs (what IS built) and changes (what SHOULD change), but atril does not surface this relationship at all. Reading a spec like `cli-core`, there is no indication that two pending changes will modify it. Reading a change proposal, the "Affected specs" listed in the Impact section are plain text -- not navigable links. Change spec diffs show "ADDED Requirements" with no link back to the canonical spec to see the full current state. Inline references like "See also: onboarding spec" in prose are plain text too.

This forces users to manually correlate specs and changes by memorizing names and navigating back and forth through the file tree, which is the central friction when trying to understand the state and trajectory of a project's specifications.

## What Changes
- When viewing a spec, show a contextual indicator listing pending changes that affect it (derived from change directory structure under `openspec/changes/*/specs/<capability>/`)
- When viewing a change spec delta, add a link to the canonical spec to provide full context for the diff
- Auto-detect and link inline references to spec capability names within rendered OpenSpec documents

## Deferred
- Side-by-side diff view between canonical spec and change spec delta
- Automated detection of conflicting changes that affect the same spec
- Linking between changes (e.g., change A depends on change B)

## Related Changes
- Complementary to `add-openspec-navigator`, which adds a persistent sidebar for spec/change navigation. Both share a spec-change index data structure that should be designed for reuse. This change is independent and works without the navigator — the pending-change indicator is displayed directly on the spec document header.

## Impact
- Affected specs: spec-viewer
- Affected code: `src/shared/document-renderer.ts` (inline reference linking), `src/main.ts` (contextual indicators, navigation handlers), `src/styles.css` (indicator and link styling)
