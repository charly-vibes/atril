# Design: add ubiquitous language explorer

## 1. URL parameter schema

The language explorer is a **sub-mode** of the existing wai reading mode, not a new top-level
view. It nests under `?view=wai` using a `section=` discriminator:

| URL | What it loads |
|-----|--------------|
| `?view=wai&section=language` | Bounded context overview |
| `?view=wai&section=language&context=<slug>` | Glossary view for one context |
| `?view=wai&section=language&context=<slug>&term=<term-slug>` | Glossary view scrolled to term |

`<slug>` is the context filename without the `.md` extension (e.g. `navigation`, `design`).
`<term-slug>` is the lowercased, hyphenated term after stripping Markdown bold markers (see §3).

When `section=` is absent, the wai reading mode defaults to its existing artifact browsing view,
so this change is backwards-compatible with existing wai URLs.

**Edge case rules** (mirrored in spec.md):
- `?term=X` without `?context=` → fall back to overview, ignore term
- `?context=nonexistent` → fall back to overview with "context not found" message

## 2. One-line purpose extraction

Context files (`contexts/*.md`) follow a uniform structure (H1 title → H2 sections with tables).
They do **not** contain prose paragraphs suitable for extraction. The purpose is already available
in the README.md context table:

```markdown
| Context | Purpose |
|---------|---------|
| navigation | URL routing and state preservation |
...
```

**Decision:** Read purposes from the README.md context table, not from context files.

Implementation: parse the README once (on Language entry point load), build a `Map<slug, purpose>`
keyed by the lowercase context filename stem. Reuse this map when rendering the overview.

## 3. Anchor slug generation

Term cells in context files use Markdown bold formatting: `| **Knowledge Source** | ... |`.
Applying a slug formula directly to the raw cell yields `**knowledge-source**` (wrong).

**Slug formula:**

```
slug = term
  .replace(/\*\*/g, '')   // strip bold markers
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-')
```

Named anchors are set as `id` attributes on `<dt>` elements inside the `<dl>` glossary structure
(see §4). Fragment links in deep-link URLs use the same formula.

## 4. Lazy loading vs. eager fetch

The platform operates under a ~60 req/hour unauthenticated GitHub API limit. With 7 bounded
contexts, eager-loading all context files on Language entry point load costs 7 API calls in
addition to the tree fetch.

**Decision:** Lazy-load context files — fetch a context file only when the user selects it from
the overview. Use the platform's existing in-memory caching strategy (per-session, keyed by
`owner/repo/ref/path`) so that re-visiting a context does not refetch.

The README.md (for purpose extraction) is fetched once on Language entry point load and cached.
Total cost per session: 1 (README) + N context file opens (max 7), vs. 8 eager.

## 5. Glossary DOM structure

Glossary terms SHALL be rendered as HTML definition lists to satisfy both testability and
accessibility:

```html
<dl class="glossary">
  <dt id="knowledge-source"><strong>Knowledge Source</strong></dt>
  <dd>A category identified by presence of specific paths …</dd>
</dl>
```

Unit tests assert presence of `<dl>`, `<dt id="...">`, and `<dd>` elements — no "visually
distinct" ambiguity. Screen readers announce `<dt>`/`<dd>` pairs natively.

Table-detection heuristic: a Markdown table whose first row contains headers `Term` and
`Definition` (case-insensitive, after stripping bold markers) is treated as a glossary table.
Tables without these headers are rendered as plain prose (no glossary structure, no anchors).
