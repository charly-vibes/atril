# Change: add ubiquitous language explorer

## Why

Atril renders `.wai/` project memory, but the ubiquitous language — the canonical vocabulary
that ties every tool and conversation in the wai ecosystem together — lives buried under
`.wai/resources/ubiquitous-language/` with no special treatment. A reader browsing that path
today sees raw Markdown tables with no indication that these are bounded-context definitions,
no way to navigate between contexts, and no deep-linking to individual terms.

The ubiquitous language is meant to be *used*: in identifiers, PR descriptions, commit messages,
and conversations. A reader who cannot quickly find the canonical definition of "Knowledge Source"
or "Route" is likely to invent vocabulary instead. Surfacing the language as a first-class
explorer closes that gap.

## What Changes

- Detect `.wai/resources/ubiquitous-language/README.md` as a signal that the repository has
  a ubiquitous language; surface it as a dedicated **Language** entry point in the wai reading mode
- Render the bounded-context index (the README) as a navigable overview listing each context
  with its name and one-line purpose
- Render each bounded-context file (`contexts/*.md`) as a **glossary view**: term-definition
  table rows styled as definition pairs, with each term receiving a named anchor for deep linking
- Add term-anchor deep links so a URL like `?view=wai&section=language&context=navigation&term=route`
  jumps directly to the definition of "Route" in the navigation bounded context

## Deferred

- Full-text search across all terms and definitions
- Cross-context term references (clicking a term that appears in multiple contexts)
- Automatic term highlighting when the same word appears in a rendered spec or wai document

## Related Changes

- Extends the wai-viewer capability introduced in `add-unified-repo-reader`
- The deep-link pattern follows the same URL parameter conventions as `add-unified-repo-reader`

## Impact

- Affected specs: `wai-viewer`
- Affected code: `src/main.ts` (Language entry point routing), `src/shared/file-tree.ts`
  (ubiquitous language detection), new `src/views/language-explorer.ts` (bounded context list
  and glossary rendering), `src/styles.css` (glossary term styling)
