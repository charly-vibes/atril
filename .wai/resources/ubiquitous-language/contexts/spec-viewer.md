# Bounded Context: Spec Viewer

Renders Markdown documents from a GitHub repository. Responsible for the full document pipeline: fetch → parse → render → display.

## Key Concepts

| Term | Definition |
|------|------------|
| **File Tree** | Hierarchical view of repository structure, filtered to artifact directories |
| **Tree Node** | `{ name, path, type (blob\|tree), children }` |
| **File Content** | Raw text of a blob fetched from GitHub Contents API |
| **Rendered Document** | HTML produced from raw Markdown, including heading anchors, TOC, and resolved images |
| **Table of Contents** | Auto-generated navigation for documents with 3+ headings |
| **Heading Anchor** | Slugified heading text used as a stable fragment ID (`#my-heading`) |
| **Relative Image** | Image with a `src` relative to the current file path; resolved to absolute GitHub raw URL |
| **OpenSpec Document** | A spec.md rendered with special treatment: Requirements and Scenarios as collapsible `<details>` |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Load Repository** | Fetch default branch and full tree from GitHub API |
| **Browse Tree** | Navigate hierarchical file structure with fuzzy search filtering |
| **Switch Branch** | Change active branch; preserve selected file path where possible |
| **Render Document** | Parse GFM → HTML via `marked`; inject heading anchors, TOC, resolved images |
| **Resolve Links** | Determine navigability: relative path, root-relative, anchor, or external URL |
| **Detect Truncation** | Surface warning when GitHub API returns `truncated: true` |

## Invariants

- All images in rendered documents resolve to absolute URLs (no broken images)
- Heading IDs are stable slugs (lowercase, spaces → hyphens, special chars stripped)
- File tree shows, where present: `openspec/`, `.wai/`, `docs/`, and top-level `.md` files
- If no recognized knowledge sources exist, only top-level `.md` files are shown; knowledge source navigation tabs are hidden
