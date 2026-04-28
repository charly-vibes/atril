## Context
OpenSpec organizes knowledge in two parallel trees: `specs/` (canonical capabilities) and `changes/` (pending modifications). The relationship between them is encoded structurally -- a change that affects the `cli-core` spec has a delta file at `changes/<change-name>/specs/cli-core/spec.md`. atril already has access to the full file tree and can derive these relationships without additional API calls.

## Goals / Non-Goals
- Goals:
  - Surface the spec-to-change relationship contextually while reading
  - Make affected-spec references in change proposals navigable
  - Link change spec deltas back to their canonical spec
  - Auto-link inline spec name references in OpenSpec documents
- Non-Goals:
  - Building a full dependency graph between specs and changes
  - Diff rendering or merge preview functionality
  - Modifying the OpenSpec file format or requiring new metadata

## Decisions
- Decision: derive spec-change relationships from the file tree structure rather than parsing proposal.md content
  - Alternatives considered:
    - Parse the `## Impact` section of proposal.md for "Affected specs:" list: rejected as primary source because the file tree is more reliable (a change might list specs in Impact but not have delta files, or vice versa). The tree structure is the source of truth; Impact text is supplementary.
- Decision: show pending changes as a compact indicator below the spec title rather than inline within the spec content
  - Alternatives considered:
    - Inject change indicators next to each affected requirement: rejected because changes affect specs at the capability level, not individual requirements, and requirement-level mapping would require deep content parsing
    - Show changes only in the navigator panel: rejected because users should see the relationship even when the navigator is collapsed or absent
- Decision: auto-link inline spec references by matching known capability names wrapped in backticks or following "See also:" patterns
  - Alternatives considered:
    - Require explicit Markdown links in spec content: rejected because most existing spec content uses plain text references and upstream repos should not need to change their authoring style for atril to work well
    - Link every word that matches a capability name: rejected because it would create false positives (e.g., "core" matching `cli-core`)

## Risks / Trade-offs
- Auto-linking inline references may produce false positives if capability names overlap with common words
  - Mitigation: only match full capability names (e.g., `cli-core` not `core`), and only when they appear in backticks or after "See also:" patterns
- Showing "N pending changes" on a spec that has only archived changes would be misleading
  - Mitigation: only count active changes (under `changes/`, not `changes/archive/`)

## Migration Plan
1. Build spec-change relationship index from the cached file tree
2. Add pending-change indicators to the spec document header
3. Add canonical-spec links to change spec delta breadcrumbs
4. Implement inline reference auto-linking in the document renderer
5. Tidy styles and verify with both test repositories

## Open Questions
- Whether the pending-change indicator should show change names or just a count
