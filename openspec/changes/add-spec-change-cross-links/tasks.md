## 1. Spec-change relationship index
- [ ] 1.1 Add failing test for building a spec-to-changes mapping from a file tree (given `changes/foo/specs/cli-core/spec.md`, map `cli-core` -> `[foo]`)
- [ ] 1.2 Add failing test for excluding archived changes from the active mapping
- [ ] 1.3 Implement spec-change index builder that scans `openspec/changes/*/specs/` and `openspec/changes/archive/*/specs/` from the cached tree

## 2. Pending-change indicators on specs
- [ ] 2.1 Add failing test for rendering a pending-change indicator when viewing a spec with active changes
- [ ] 2.2 Implement pending-change indicator below the spec title showing change names that affect the current capability
- [ ] 2.3 Wire click handler on change names in the indicator to navigate to the change's proposal.md
- [ ] 2.4 Verify no indicator is shown for specs with no active changes

## 3. Canonical spec links on change deltas
- [ ] 3.1 Add failing test for rendering a "View canonical spec" link when viewing a change spec delta
- [ ] 3.2 Implement link to canonical `openspec/specs/<capability>/spec.md` in the change delta breadcrumb or header
- [ ] 3.3 Verify graceful fallback when the canonical spec does not exist (new capability being proposed)

## 4. Inline spec reference auto-linking
- [x] 4.1 Add failing test for auto-linking backtick-wrapped capability names in rendered OpenSpec documents
- [x] 4.2 Add failing test for auto-linking "See also:" pattern references
- [x] 4.3 Implement inline reference detection and linking in the document renderer for OpenSpec files
- [x] 4.4 Verify no false positives for partial name matches or non-OpenSpec documents

## 5. Tidy
- [ ] 5.1 Tidy cross-link rendering and index-building abstractions after green tests
- [ ] 5.2 Run `openspec validate add-spec-change-cross-links --strict`
