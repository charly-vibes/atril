## Context
atril is currently specified as a set of read-only viewers optimized for human reading on top of GitHub repositories. Existing capabilities cover OpenSpec documents and beads issue data, but the desired UX is broader: users should be able to paste a repository reference once and then navigate the repository's structured knowledge without switching tools or reconstructing context manually.

This change crosses several capabilities because the core unit of navigation becomes the repository rather than an individual viewer. It also introduces two new kinds of content that matter for repository understanding: `.wai` artifacts and git history.

## Goals / Non-Goals
- Goals:
  - Make repository input the primary entry flow
  - Give users a fast orientation view before deep reading
  - Preserve repository context while moving between specs, issues, wai artifacts, docs, and history
  - Improve dependency exploration for beads beyond a single global graph
  - Keep the system read-only and GitHub Pages compatible
- Non-Goals:
  - Editing or writing any repository data
  - Authenticated GitHub workflows
  - Full repository analytics or blame-style forensic tooling
  - Semantic understanding of every arbitrary cross-reference in prose

## Decisions
- Decision: introduce a dedicated `repo-overview` capability rather than overloading `platform` or `spec-viewer`
  - Alternatives considered:
    - Fold overview behavior into `platform`: rejected because platform should stay focused on technical constraints, not user-facing application behavior
    - Fold overview behavior into `spec-viewer`: rejected because the overview spans issues, wai, docs, and history beyond specs
- Decision: add separate `wai-viewer` and `history-viewer` capabilities
  - Alternatives considered:
    - Treat `.wai` and history as generic file browsing: rejected because the UX intent is first-class exploration, not only raw file access
    - Add one generic "repository explorer" capability: rejected because `.wai` and history have different interaction patterns and data sources
- Decision: extend existing viewers with cross-context navigation instead of replacing them
  - Alternatives considered:
    - Deprecate `spec-viewer` and `beads-viewer`: rejected because those capabilities remain useful deep-reading modes inside the unified shell

## Risks / Trade-offs
- Broader scope increases proposal and implementation complexity
  - Mitigation: stage implementation around entry/overview first, then viewer integration, then new content modes
- Git history adds new API usage pressure under unauthenticated GitHub rate limits
  - Mitigation: keep history requirements lightweight, read-only, and aligned with session caching
- Cross-reference navigation can become ambiguous when links are broken or partially resolvable
  - Mitigation: require graceful fallback and clear unresolved states instead of forcing aggressive inference

## Migration Plan
1. Add repository entry and overview without removing existing deep-linkable viewers
2. Extend spec and beads views to preserve shared repository context
3. Introduce wai and history views as additional read modes
4. Update project documentation after implementation to describe atril as a unified repository reader with specialized views

## Open Questions
- Whether the initial history view should be repository-wide only or also expose commit detail for selected files from day one
- Whether docs should remain a subset of spec-viewer navigation or eventually receive a dedicated documentation-focused capability
