## 1. Repository entry and overview
- [x] 1.1 Add failing tests or validation checks for repository slug and GitHub URL normalization
- [x] 1.2 Implement repository entry flow that accepts `owner/repo` and GitHub repository URLs
- [x] 1.3 Implement repository overview with detected knowledge sources and recommended entry points
- [x] 1.4 Validate overview behavior against repositories with and without OpenSpec, beads, `.wai`, and docs

## 2. Shared navigation and document cross-references
- [x] 2.1 Add failing tests for internal repository link resolution and anchor navigation
- [x] 2.2 Implement repository-aware link routing for supported document views
- [ ] 2.3 Surface related OpenSpec artifacts from spec documents without losing repository context
- [ ] 2.4 Verify graceful fallback for unresolved links and missing targets

## 3. beads dependency exploration improvements
- [ ] 3.1 Add failing tests for focused dependency inspection modes and missing dependency handling
- [ ] 3.2 Implement at least one focused dependency view in addition to the existing graph mode
- [ ] 3.3 Add issue-to-artifact navigation for resolvable references
- [ ] 3.4 Manually validate dependency readability on repositories with dense graphs

## 4. wai reading mode
- [ ] 4.1 Add failing tests for `.wai` detection and grouped artifact browsing
- [ ] 4.2 Implement `.wai` overview and grouped browsing by project, artifact type, or location
- [ ] 4.3 Implement readable rendering for `.wai` artifacts with preserved repository context
- [ ] 4.4 Manually validate behavior on repositories without `.wai`

## 5. History reading mode
- [ ] 5.1 Add failing tests for recent commit loading and path-specific history lookup
- [ ] 5.2 Implement history overview with recent commits and changed paths
- [ ] 5.3 Implement path-aware history from a selected document or artifact view
- [ ] 5.4 Validate caching and error handling under GitHub API rate-limit constraints

## 6. Tidy and documentation
- [ ] 6.1 Tidy shared repository-context and routing abstractions after green tests
- [ ] 6.2 Update README and supporting docs to describe the unified repository reader UX
- [ ] 6.3 Run `openspec validate add-unified-repo-reader --strict`
