# Bounded Context: beads Viewer

Loads and displays issue tracking data from `.beads/issues.jsonl` in a GitHub repository. Responsible for issue parsing, filtering, and dependency visualization.

## Key Concepts

| Term | Definition |
|------|------------|
| **Issues File** | `.beads/issues.jsonl` — one JSON object per line; malformed lines are skipped |
| **Issue** | A work item: `{ id, title, description, status, priority, type, dependencies }` |
| **Status** | `open`, `in_progress`, or `closed` |
| **Priority** | P0 (critical) → P4 (backlog) |
| **Type** | `task`, `bug`, `feature`, `epic` |
| **Dependency** | `{ issue_id, depends_on_id, type }` — directed: A depends on B means B must close first; known types: `blocks`, `relates-to` |
| **Dependency Graph** | Visual representation of dependency relationships with pan/zoom |
| **Issue Reference** | Artifact pointer in issue text — either a Markdown link or an OpenSpec shorthand name |
| **Branch Fallback** | Load `.beads/issues.jsonl` from default branch; fall back to `beads-sync` branch if absent |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Load Issues** | Fetch `.beads/issues.jsonl` from GitHub, applying branch fallback |
| **Parse Issues** | Parse JSONL; skip and log malformed lines |
| **Filter Issues** | Apply status / type / priority filters simultaneously; search by title and description |
| **Visualize Dependencies** | Render dependency graph; handle cycles and missing issue references |
| **Resolve Issue References** | Extract and validate artifact references from issue text |

## Invariants

- Malformed JSONL lines are logged and skipped (never crash the viewer)
- Dependency cycles are rendered without infinite loops
- Filtering is additive: all active filters apply simultaneously
