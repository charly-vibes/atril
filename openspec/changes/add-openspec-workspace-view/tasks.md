## 0. Active change reconciliation

- [x] 0.1 Reconcile this change with `add-openspec-navigator`, ensuring `openspec/project.md` and `openspec/AGENTS.md` are included in the OpenSpec workspace/navigation model rather than excluded from OpenSpec context.
- [x] 0.2 Reuse or extend the same OpenSpec index planned by `add-spec-change-cross-links` instead of adding a duplicate tree scan.

## 1. Workspace model and tests

- [x] 1.1 Add failing tests for indexing the whole `openspec/` workspace: project documents, current specs, active changes, archived changes, and raw files.
- [x] 1.2 Add failing tests for partial workspaces with missing `project.md`, missing specs, missing active changes, missing active-change documents, malformed `tasks.md`, or missing archive.
- [x] 1.3 Implement or extend the OpenSpec index model to expose workspace sections without additional GitHub API calls beyond the cached tree.

## 2. Overview entry experience

- [x] 2.1 Add failing tests for the Specs entry route landing on an OpenSpec workspace overview instead of a raw file tree/spec-only bundle.
- [x] 2.2 Render overview sections for Project, Specs, Changes, Archive, and Files with counts and clear empty states; show the entered page heading as "OpenSpec Workspace" while preserving any external "Specs" entry label.
- [x] 2.3 Verify repositories without OpenSpec still show the existing non-OpenSpec fallback behavior.

## 3. Project documents

- [x] 3.1 Add failing tests that `openspec/project.md` appears as a selectable first-class document when present.
- [x] 3.2 Add failing tests that `openspec/AGENTS.md` appears under Project documents when present and remains reachable from raw Files.
- [x] 3.3 Render selected project documents with existing readable document rendering and deep-link state.
- [x] 3.4 Add a clear missing-state message when `openspec/project.md` is absent.

## 4. First-class changes

- [x] 4.1 Add failing tests for listing active changes as first-class review objects, grouped by change ID.
- [x] 4.2 For each active change, expose proposal, tasks, optional design, and affected spec delta documents.
- [x] 4.3 Show missing-document indicators for incomplete active changes instead of hiding them.
- [x] 4.4 Show task completion summary when `tasks.md` is present and parseable.
- [x] 4.5 Show a non-numeric tasks-available state when `tasks.md` has no parseable checkbox tasks.
- [ ] 4.6 Support navigation from change details to affected current specs when canonical specs exist.

## 5. Specs and archives

- [ ] 5.1 Keep current specs available as canonical capability documents under the Specs section.
- [ ] 5.2 Support navigation from a current spec to related active changes when indexed relationships exist.
- [ ] 5.3 Show archived changes in a lower-priority Archive section and hide or collapse the Archive section by default when empty.

## 6. Validation and review

- [x] 6.1 Run `openspec validate add-openspec-workspace-view --strict`.
- [x] 6.2 Run unit tests for workspace indexing, routing, and rendering.
- [ ] 6.3 Manually verify the workflow on a repository with `project.md`, `AGENTS.md`, current specs, active changes, incomplete changes, and archives.
- [ ] 6.4 Run `/ro5` or the Rule of 5 review on the implemented workflow before marking complete.
