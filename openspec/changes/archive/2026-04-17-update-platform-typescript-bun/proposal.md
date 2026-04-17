# Change: update platform from vanilla JS to TypeScript and Bun

## Why
The existing platform spec carries constraints from the jams prototypes (vanilla JS, no build tools, single-file HTML). atril is a standalone project that will benefit from TypeScript's type safety, Bun's fast build/test/runtime toolchain, and shared modules across viewers. The read-only, static-deployment, GitHub Pages goals remain unchanged.

## What Changes
- **BREAKING**: Remove "No Frameworks" and "Self-Contained Viewers" requirements
- Replace with TypeScript source, Bun as runtime/bundler/test runner, and `dist/` build output
- Add shared module architecture for code reuse across viewers
- Add testing requirements: Bun's built-in test runner for unit/integration tests, Playwright for browser/e2e tests
- Update design-system shared token delivery from embedded-per-file to shared CSS imports

## Impact
- Affected specs: platform, design-system
- Affected code: all future implementation (no code exists yet)
- New tooling: `bun install`, `bun build`, `bun test`, Playwright
