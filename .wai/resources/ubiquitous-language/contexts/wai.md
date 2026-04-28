# Bounded Context: Wai Viewer

Renders `.wai/` project memory files — research notes, design decisions, and reflections — from a GitHub repository.

## Key Concepts

| Term | Definition |
|------|------------|
| **Wai Tree** | Hierarchical view of `.wai/` directory contents: `resources/`, `reflections/`, memory files |
| **Memory File** | A Markdown file under `.wai/resources/` capturing research, reasoning, or design context |
| **Project Note** | A structured note under `.wai/` documenting why a decision was made |
| **Research Entry** | A memory file recording findings from a research spike or investigation |
| **Reflection** | A post-implementation note under `.wai/resources/reflections/` capturing what was learned |
| **Wai Index** | The set of all memory files discoverable in the `.wai/` tree |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Load Wai Tree** | Fetch the `.wai/` subtree from GitHub Trees API; filter to Markdown files |
| **Render Memory File** | Fetch and render a `.wai/` Markdown file as a document (same pipeline as spec-viewer) |
| **Browse Wai Tree** | Navigate the `.wai/` hierarchy in the file tree panel |

## Invariants

- `.wai/` content is read-only; atril never writes to project memory
- Memory files render using the same Markdown pipeline as all other documents
- If `.wai/` is absent from the repository, the wai viewer tab is hidden
