# Change: unify atril into a repository reader

## Why
atril currently specifies separate viewers for openspec documents and beads issues. That is useful, but it does not yet match the intended reading flow: paste a GitHub repository slug or URL, orient quickly, and then move across specs, issues, `.wai` artifacts, docs, and history without losing context.

The jams prototypes also exposed UX gaps that matter for comprehension: relative links do not form a coherent in-app reading experience, beads dependency views need cleaner inspection modes, and git history is missing even though it often carries important explanatory context.

## What Changes
- Add a unified repository entry and overview experience that accepts a repository slug or GitHub URL
- Add first-class repository overview requirements for detecting specs, issues, `.wai`, docs, and history entry points
- Extend the spec viewer to resolve internal repository links and surface related OpenSpec artifacts in context
- Extend the beads viewer with cleaner dependency exploration modes and links to related repository artifacts
- Add a first-class wai viewer capability for exploring `.wai` artifacts as project memory
- Add a first-class history viewer capability for recent commits and path-specific history exploration

## Impact
- Affected specs: platform, spec-viewer, beads-viewer
- New specs: repo-overview, wai-viewer, history-viewer
- Affected code: future app shell, repository parsing, document routing, issue relationship views, wai browsing, git history retrieval
