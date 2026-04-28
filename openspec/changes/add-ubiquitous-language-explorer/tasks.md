## 1. Detection and entry point

- [ ] 1.1 Write failing tests for ubiquitous language detection (presence/absence of `.wai/resources/ubiquitous-language/README.md`)
- [ ] 1.2 Implement detection logic in the shared file-tree module; expose a `hasUbiquitousLanguage(tree)` predicate
- [ ] 1.3 Wire the Language entry point into the wai reading mode: show it only when detection passes
- [ ] 1.4 Validate entry point visibility on repos with and without the ubiquitous language path

## 2. Bounded context overview

- [ ] 2.1 Write failing tests for context listing: enumerate files in `contexts/`, extract one-line purposes
- [ ] 2.2 Implement context-listing view that fetches the `contexts/` subtree and renders entries with names and purposes
- [ ] 2.3 Implement navigation from an overview entry to its glossary view (URL update, no full reload)
- [ ] 2.4 Validate fallback when `contexts/` contains no `.md` files

## 3. Glossary rendering

- [ ] 3.1 Write failing tests for term-definition table detection and anchor generation
- [ ] 3.2 Implement glossary renderer: detect **Term** / **Definition** tables in context Markdown and render as styled definition pairs
- [ ] 3.3 Generate named anchors (`id` attributes) for each term by first stripping Markdown bold markers (`term.replace(/\*\*/g, '').trim().toLowerCase().replace(/\s+/g, '-')`)
- [ ] 3.4 Validate rendering for all seven bounded-context files in the existing ubiquitous language

## 4. Deep linking

- [ ] 4.1 Write failing tests for `context` and `term` URL parameter handling (valid, invalid, missing)
- [ ] 4.2 Implement URL parameter reading on load: route to correct context and scroll to term anchor
- [ ] 4.3 Implement invalid-context fallback: show overview with "context not found" message
- [ ] 4.4 Verify generated deep links round-trip correctly (link → reload → same position)

## 5. Tidy and validation

- [ ] 5.1 Tidy detection and rendering modules after green tests; no extraction unless a second consumer of the anchor utility exists
- [ ] 5.2 Run `openspec validate add-ubiquitous-language-explorer --strict`
- [ ] 5.3 Manual smoke test: open the language explorer against charly-vibes/atril (which contains the ubiquitous language); verify detection, overview listing, one glossary render, and a deep link round-trip with `?view=wai&section=language&context=navigation&term=route`
