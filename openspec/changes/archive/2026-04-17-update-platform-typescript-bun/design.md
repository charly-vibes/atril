## Context
atril was specified with vanilla JavaScript constraints inherited from jams, where each viewer was a single self-contained HTML file. As atril grows into a unified repository reader with shared routing, GitHub API clients, and multiple viewer modes, a build pipeline and type system become necessary. No application code exists yet, so this is a clean adoption with zero migration cost.

## Goals / Non-Goals
- Goals:
  - TypeScript as the sole application language
  - Bun as runtime, bundler, package manager, and test runner
  - Shared modules for cross-viewer code (API client, routing, design tokens)
  - `dist/` output deployable to GitHub Pages
  - Playwright for browser-level testing
- Non-Goals:
  - Adopting a UI framework (React, Vue, Svelte, etc.)
  - Server-side rendering or server-side processing
  - Node.js compatibility layer

## Decisions
- Decision: Bun as the sole toolchain (no Node.js, no Vite, no webpack)
  - Alternatives considered:
    - Vite + Node.js: mature ecosystem but adds toolchain complexity; Bun covers build/test/run natively
    - Deno: viable but less mature bundling story and smaller package ecosystem
- Decision: No UI framework — TypeScript with DOM APIs directly
  - Alternatives considered:
    - Lit/Web Components: adds a dependency for template management; premature until component count justifies it
    - Preact/Solid: lightweight but still a framework dependency for what is primarily a document reader
- Decision: Playwright for browser tests (not happy-dom or jsdom)
  - Alternatives considered:
    - happy-dom: fast but incomplete DOM simulation; insufficient for testing scroll, navigation, and visual rendering
    - jsdom: slower than happy-dom with similar limitations

## Risks / Trade-offs
- Bun is younger than Node.js; some npm packages may have edge-case incompatibilities
  - Mitigation: atril has minimal dependencies; test early with `bun install` and `bun test`
- No UI framework means manual DOM management at scale
  - Mitigation: the app is a document reader, not an interactive editor; DOM complexity stays bounded

## Open Questions
- Exact `dist/` structure (flat vs viewer-scoped routes) depends on the unified repo reader routing design
