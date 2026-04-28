## Context
atril renders repository content with a generic file tree that treats all directories equally. OpenSpec content has a known semantic structure (specs as capabilities, changes as proposals with lifecycle state) that the tree ignores. Users exploring specs must navigate raw filesystem paths, and once reading a document they lose all navigation context.

The beads viewer already demonstrates a good pattern: a persistent list panel alongside a detail panel. The OpenSpec navigator should follow the same split-pane approach but with semantically-structured content instead of a flat issue list.

## Goals / Non-Goals
- Goals:
  - Provide a persistent sidebar visible alongside rendered spec/change content
  - Show specs as a flat list with human-readable labels and one-line descriptions
  - Show changes grouped by change name with active/archived status
  - Enable single-click navigation between specs and changes without losing reading position
  - Make overview pills function as navigation entry points
- Non-Goals:
  - Replacing the generic file tree for non-OpenSpec content (docs, `.wai`, etc.)
  - Editing or modifying spec content
  - Full-text content search (path-based filtering is sufficient for the navigator)
  - Responsive mobile layout for the split-pane (tablet-first is sufficient)

## Decisions
- Decision: use a split-pane layout with navigator on the left and document on the right, similar to the beads list/detail pattern
  - Alternatives considered:
    - Overlay drawer that slides in: rejected because persistent visibility is the core value -- users need to see both tree and content simultaneously
    - Tab-based navigation between specs: rejected because it hides the overall structure and doesn't support quick scanning
- Decision: extract spec descriptions from the first paragraph after the `## Purpose` heading in each `spec.md`, falling back to the capability directory name
  - Alternatives considered:
    - Require frontmatter metadata in each spec: rejected because it would require modifying all upstream repos and break the convention that spec.md is pure Markdown
    - Parse `openspec/project.md` for descriptions: rejected because project.md doesn't reliably list all capabilities with descriptions
- Decision: derive change status from filesystem location (`changes/` = active, `changes/archive/` = archived) rather than parsing metadata
  - Alternatives considered:
    - Read proposal.md frontmatter for status: rejected because OpenSpec changes don't have status frontmatter by convention
- Decision: the navigator panel only appears when the user is viewing OpenSpec content (specs or changes), not for generic file browsing
  - Alternatives considered:
    - Always show the navigator: rejected because it's irrelevant for non-OpenSpec views (README, docs, `.wai`)

## Risks / Trade-offs
- Additional GitHub API calls to fetch `spec.md` purpose text for each capability on first load (one call per capability — e.g., 21 calls for wai, consuming ~35% of the unauthenticated rate-limit budget)
  - Mitigation: fetch content lazily after rendering the navigator skeleton with capability names from the cached tree API, cache in session so descriptions are only fetched once per repo
- Split-pane layout reduces document reading width on smaller viewports
  - Mitigation: auto-collapse navigator below a viewport threshold (e.g., 768px) with a toggle button to re-expand
- Requires fetching and parsing all spec.md files to build the navigator, which increases initial load time for repos with many specs
  - Mitigation: lazy-load descriptions after rendering the navigator skeleton with capability names

## Migration Plan
1. Add navigator panel markup to `index.html` alongside the existing file-screen
2. Build OpenSpec tree data structure from the cached file tree (separate specs and changes, extract metadata)
3. Render the navigator panel with two sections: Specs and Changes
4. Wire up click handlers to navigate to spec.md or change artifacts while keeping the navigator visible
5. Make overview pills clickable to navigate to the appropriate view
6. Tidy CSS for split-pane layout, responsive collapse, and active-item highlighting

## Open Questions
- Whether the navigator should show a third section for the `openspec/project.md` project context file
