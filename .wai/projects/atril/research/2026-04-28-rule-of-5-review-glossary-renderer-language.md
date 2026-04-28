---
tags: [pipeline-run:ticket-cycle-2026-04-28-add-ubiquitous-language-explorer, pipeline-step:review]
---

# Rule of 5 Review — glossary-renderer & language-overview tests

**Files reviewed:**
- `tests/unit/glossary-renderer.test.ts`
- `tests/unit/language-overview.test.ts`

**Convergence:** Stage 5 | **Verdict:** NEEDS_REVISION | **All 48 tests pass**

## Issues Found

### MEDIUM (2)

**[EDGE-001]** No XSS contract tests for `renderGlossary` / `renderLanguageOverview`
- Both use `escapeHtml()` but no test asserts `<`, `&`, `"` are escaped
- Fix: add `renderGlossary([{ term: "A < B", definition: "x & y" }])` → no raw `<`; same for `renderLanguageOverview`

**[EDGE-002]** `termToAnchor` contract undefined for non-space punctuation (`/`, `'`, accents)
- Terms like "Read/Write" or "Artifact's Lock" produce invalid HTML fragment ids silently
- Fix: decide contract (strip? replace with `-`?), add test, document

### LOW (5)

**[DRAFT-001]** Dead code: `blob()` helper + `GitHubTreeEntry` import in `language-overview.test.ts:3,5-7`
- Leftover from prior API shape where function accepted `GitHubTreeEntry[]` instead of `string[]`
- Fix: remove both

**[CORR-001/CLAR-001]** Misleading test name `glossary-renderer.test.ts:132`
- "trims trailing punctuation-only differences" implies stripping that doesn't occur
- Fix: rename to "preserves trailing period in definition text"

**[EXCL-002]** Incomplete assertion in bullet-list test `language-overview.test.ts:87-102`
- Asserts `toHaveLength(3)` but only checks `contexts[0]` and `contexts[1]`
- Fix: assert `contexts[2]` or narrow length assertion

**[EXCL-001]** File-count lower bound too weak `glossary-renderer.test.ts:186`
- `expect(contextFiles.length).toBeGreaterThan(0)` doesn't guard against silent deletions
- Fix: `toBeGreaterThanOrEqual(5)` (7 context files currently exist)

## Recommended Actions

1. Remove `blob()` fn and `GitHubTreeEntry` import (dead code cleanup)
2. Add HTML-escaping tests for `renderGlossary` and `renderLanguageOverview`
3. Define and test `termToAnchor` for punctuation beyond spaces/`**`
4. Fix misleading test name; assert `contexts[2]` in bullet-list test

