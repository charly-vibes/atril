# Capability: Platform

## Purpose

Technical constraints and deployment model for atril. Defines the runtime environment, build philosophy, and API usage boundaries.

## Requirements

### Requirement: No Frameworks

The system SHALL use vanilla JavaScript and CSS only, with no frameworks, build tools, or transpilation.

#### Scenario: No framework dependencies
- **WHEN** a viewer is inspected
- **THEN** it contains no imports or references to JavaScript frameworks (React, Vue, Angular, etc.) or CSS preprocessors (Sass, Less, etc.)

### Requirement: Self-Contained Viewers

Each viewer SHALL be a single HTML file with embedded CSS and JavaScript, deployable without a build step.

#### Scenario: Single-file deployment
- **WHEN** a viewer HTML file is opened directly in a browser or served from a static host
- **THEN** it functions correctly without requiring any other local files (aside from CDN-hosted fonts)

### Requirement: Static Deployment

The system SHALL be deployable on GitHub Pages as static files with no server-side processing.

#### Scenario: GitHub Pages hosting
- **WHEN** the repository is configured for GitHub Pages
- **THEN** all viewers are accessible at `charly-vibes.github.io/atril/` without additional server configuration

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
- **WHEN** the same repository tree or file is requested more than once in a session
- **THEN** the system serves the cached response instead of making a new API call

#### Scenario: Refresh data by starting a new session
- **WHEN** a user starts a new browsing session by reloading the viewer or reopening it later
- **THEN** the system fetches fresh GitHub API responses rather than depending on stale in-memory cache entries from a prior session
