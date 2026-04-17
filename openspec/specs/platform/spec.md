# Capability: Platform

## Purpose

Technical constraints and deployment model for atril. Defines the runtime environment, build philosophy, and API usage boundaries.
## Requirements
### Requirement: Static Deployment
The system SHALL be deployable on GitHub Pages as static files with no server-side processing. The deployable files are produced by the build pipeline and served from the `dist/` directory.

#### Scenario: GitHub Pages hosting
- **WHEN** the repository is configured for GitHub Pages to serve from the `dist/` directory or a deployment branch
- **THEN** the application is accessible at `charly-vibes.github.io/atril/` without additional server configuration

#### Scenario: CDN font unavailability
- **WHEN** CDN-hosted fonts cannot be loaded (network offline, CDN blocked)
- **THEN** the system falls back to system fonts and remains fully functional

### Requirement: Unauthenticated GitHub API

The system SHALL use the GitHub REST API without authentication, operating within the ~60 requests/hour rate limit.

#### Scenario: Operate within rate limit
- **WHEN** a user browses repositories
- **THEN** the system caches API responses for the session and avoids redundant requests to stay within the unauthenticated rate limit of ~60 requests/hour

#### Scenario: Handle rate limit exceeded
- **WHEN** the GitHub API returns a rate limit error
- **THEN** the system displays a clear message to the user indicating the rate limit has been reached

### Requirement: Read-Only Operation

The system SHALL never create, modify, or delete data in any repository. It is a pure viewer.

#### Scenario: No write operations
- **WHEN** the system interacts with the GitHub API
- **THEN** it only uses read endpoints (GET requests) and never issues write operations (POST, PUT, PATCH, DELETE)

### Requirement: Response Caching

The system SHALL cache GitHub API responses in-memory for the duration of a browsing session to minimize redundant requests.

#### Scenario: Cache tree and file responses
- **WHEN** the same repository tree listing or file content blob is requested more than once in a session
- **THEN** the system serves the cached response for both tree and content endpoints instead of making a new API call

#### Scenario: Refresh data by starting a new session
- **WHEN** a user starts a new browsing session by reloading the viewer or reopening it later
- **THEN** the system fetches fresh GitHub API responses rather than depending on stale in-memory cache entries from a prior session

### Requirement: Truncated API Response Handling

The system SHALL detect and communicate when the GitHub API returns truncated data so users are aware the view may be incomplete.

#### Scenario: Truncated tree response
- **WHEN** the GitHub API returns a tree response with `truncated: true` (repositories with very large file trees)
- **THEN** the system displays an indicator that the file tree is incomplete rather than silently showing partial data

### Requirement: Loading Indicators

The system SHALL display a loading indicator while fetching data from the GitHub API so users are not presented with blank or unresponsive screens.

#### Scenario: Show loading state during API fetch
- **WHEN** the system is waiting for a GitHub API response
- **THEN** it displays a loading indicator in the relevant content area

#### Scenario: Replace loading indicator with content or error
- **WHEN** a GitHub API response completes (success or failure)
- **THEN** the loading indicator is replaced with either the rendered content or an error message

### Requirement: Consistent Error Presentation

The system SHALL present errors in a consistent visual style across all viewers so users can recognize and understand error states regardless of which view they are in.

#### Scenario: Uniform error styling
- **WHEN** any viewer encounters a data loading or rendering error
- **THEN** the error is displayed using a shared error presentation style that includes a clear message describing the problem

### Requirement: TypeScript and Bun
The system SHALL be written in TypeScript and use Bun as the runtime, package manager, bundler, and test runner.

#### Scenario: TypeScript source
- **WHEN** a developer inspects the application source
- **THEN** all application logic is written in TypeScript (`.ts` files) with strict type checking enabled

#### Scenario: Bun as sole toolchain
- **WHEN** a developer builds, tests, or runs the application
- **THEN** all commands use Bun (`bun install`, `bun run build`, `bun test`) without requiring Node.js, npm, or additional build tools

### Requirement: No UI Frameworks
The system SHALL not depend on UI frameworks (React, Vue, Angular, Svelte, Solid, etc.) or CSS preprocessors (Sass, Less, etc.). DOM manipulation uses TypeScript with browser DOM APIs directly.

#### Scenario: No framework dependencies
- **WHEN** a developer inspects `package.json` dependencies
- **THEN** no UI framework or CSS preprocessor appears as a dependency

### Requirement: Built Application
The system SHALL produce a `dist/` directory containing static files (HTML, CSS, JavaScript) suitable for deployment, generated by Bun's build pipeline from TypeScript source.

#### Scenario: Build produces deployable output
- **WHEN** a developer runs `bun run build`
- **THEN** the `dist/` directory contains all files needed to serve the application as static assets

#### Scenario: Build output is self-sufficient
- **WHEN** the `dist/` directory is served from any static file host
- **THEN** the application functions correctly without requiring server-side processing

### Requirement: Shared Modules
The system SHALL organize shared logic (GitHub API client, routing, design tokens, utilities) as TypeScript modules imported by viewer-specific code, avoiding duplication across viewers.

#### Scenario: Shared code via imports
- **WHEN** multiple viewers need the same functionality (e.g., GitHub API fetching, repository context management)
- **THEN** they import it from shared modules rather than duplicating the implementation

### Requirement: Testing with Bun and Playwright
The system SHALL use Bun's built-in test runner for unit and integration tests and Playwright for browser-level end-to-end tests.

#### Scenario: Unit tests run with Bun
- **WHEN** a developer runs `bun test`
- **THEN** unit and integration tests execute using Bun's built-in test runner

#### Scenario: Browser tests run with Playwright
- **WHEN** a developer runs browser-level tests
- **THEN** Playwright drives a real browser to verify rendering, navigation, and user interaction

