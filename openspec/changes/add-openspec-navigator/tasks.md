## 1. OpenSpec tree data model
- [ ] 1.1 Add failing test for extracting spec capabilities from a cached file tree (detect `openspec/specs/*/spec.md` pattern)
- [ ] 1.2 Add failing test for extracting changes from a cached file tree (detect `openspec/changes/*/proposal.md` and `openspec/changes/archive/*/proposal.md`)
- [ ] 1.3 Implement OpenSpec tree builder that separates specs, active changes, and archived changes from the generic file tree
- [ ] 1.4 Add failing test for extracting the purpose description from a spec.md file (first paragraph after `## Purpose`)
- [ ] 1.5 Implement purpose extraction with fallback to capability directory name

## 2. Navigator panel markup and layout
- [ ] 2.1 Add navigator panel element to `index.html` alongside the file-screen
- [ ] 2.2 Add split-pane CSS layout with navigator on the left and document content on the right
- [ ] 2.3 Add responsive collapse behavior for viewports below 768px with a toggle button
- [ ] 2.4 Verify the navigator panel does not appear for non-OpenSpec views (README, docs, `.wai`, beads)

## 3. Navigator rendering
- [ ] 3.1 Add failing test for status badge rendering (active vs archived indicators)
- [ ] 3.2 Render specs section as a flat list with capability name and one-line description
- [ ] 3.3 Render active changes section grouped by change name, showing affected spec names underneath
- [ ] 3.4 Render archived changes section collapsed by default with a toggle
- [ ] 3.5 Add active-item highlighting to indicate the currently viewed spec or change artifact

## 4. Navigator interaction
- [ ] 4.1 Wire click handlers on spec items to navigate to the spec's `spec.md` while keeping the navigator visible
- [ ] 4.2 Wire click handlers on change items to navigate to the change's `proposal.md` while keeping the navigator visible
- [ ] 4.3 Wire click handlers on affected-spec items under a change to navigate to the change's spec delta
- [ ] 4.4 Verify browser back/forward preserves navigator state and active-item highlighting

## 5. Overview pills navigation
- [ ] 5.1 Make overview source pills (SPECS, ISSUES, MEMORY, DOCS, README) clickable when the corresponding source is detected
- [ ] 5.2 Wire SPECS pill to navigate directly into the OpenSpec navigator view
- [ ] 5.3 Verify pills that represent missing sources remain non-interactive (grayed out)

## 6. Tidy
- [ ] 6.1 Tidy navigator rendering and tree-building abstractions after green tests
- [ ] 6.2 Run `openspec validate add-openspec-navigator --strict`
