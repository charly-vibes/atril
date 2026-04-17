# Capability: beads viewer

## Purpose

Visualizes issue trackers created with the `bd` CLI by loading `.beads/issues.jsonl` from GitHub repositories. Deployed at `/beads-viewer/`. Related capability: [spec-viewer](../spec-viewer/spec.md).

## Requirements

### Requirement: Issue Loading

The system SHALL load `.beads/issues.jsonl` from a GitHub repository and parse it into a browsable issue list.

#### Scenario: Load issues from repository
- **WHEN** a user specifies a GitHub repository
- **THEN** the system fetches `.beads/issues.jsonl` from the repository and displays the parsed issues

#### Scenario: Branch selection with fallback
- **WHEN** a user loads issues without specifying a branch
- **THEN** the system attempts the default branch first, then falls back to the `beads-sync` branch

#### Scenario: Both branches lack issue data
- **WHEN** a user loads issues and neither the default branch nor the `beads-sync` branch contains `.beads/issues.jsonl`
- **THEN** the system displays an error indicating no issue data was found in the repository

#### Scenario: Missing or malformed issues file
- **WHEN** the repository has no `.beads/issues.jsonl` or the file contains invalid JSON lines
- **THEN** the system displays a clear error message indicating the data could not be loaded

### Requirement: Issue Filtering

The system SHALL support filtering issues by status (open/closed/in_progress), type (task/bug/feature/epic), and priority (P0-P4).

#### Scenario: Filter by status
- **WHEN** a user selects a status filter (e.g., "open")
- **THEN** only issues with that status are displayed

#### Scenario: Filter by type
- **WHEN** a user selects a type filter (e.g., "bug")
- **THEN** only issues of that type are displayed

#### Scenario: Filter by priority
- **WHEN** a user selects a priority filter (e.g., "P1")
- **THEN** only issues with that priority are displayed

#### Scenario: Combine filters
- **WHEN** a user applies multiple filters simultaneously
- **THEN** only issues matching all active filters are displayed

### Requirement: Issue Search

The system SHALL support searching issues by title and description text.

#### Scenario: Search by keyword
- **WHEN** a user types a search query
- **THEN** the system displays issues whose title or description contains the query text

#### Scenario: No matching issues
- **WHEN** a user types a search query that matches no issues
- **THEN** the system displays an empty state indicating no issues match the query

### Requirement: List Detail View

The system SHALL provide a list/detail viewing mode with a sidebar for browsing issues and a main panel for full metadata display.

#### Scenario: Browse and select issue
- **WHEN** a user clicks an issue in the sidebar list
- **THEN** the main panel displays the full issue detail including title, description, status, type, priority, assignee, and dependencies

### Requirement: Dependency Graph View

The system SHALL provide an interactive dependency graph visualization with pan and zoom capabilities.

#### Scenario: View dependency graph
- **WHEN** a user switches to graph view
- **THEN** the system renders issues as nodes and dependencies as directed edges in an interactive graph

#### Scenario: Pan and zoom graph
- **WHEN** a user drags the graph canvas or uses scroll or trackpad gestures over the graph
- **THEN** the graph pans or zooms in a way that keeps the dependency view usable

#### Scenario: Empty dependency graph
- **WHEN** the loaded issues contain no dependency relationships
- **THEN** the system displays an empty graph state or node-only view without crashing or rendering a broken visualization

#### Scenario: Missing dependency reference
- **WHEN** an issue references a dependency that is not present in the loaded issue set
- **THEN** the system handles the missing reference gracefully and indicates that the graph is incomplete rather than failing silently or crashing

#### Scenario: Dependency cycle
- **WHEN** the dependency data contains circular references (e.g., issue A depends on B and B depends on A)
- **THEN** the system renders the cycle visually without hanging or crashing

### Requirement: Shareable URLs

The system SHALL support shareable URLs that link to specific repositories and issues.

#### Scenario: Share link to specific issue
- **WHEN** a user selects an issue
- **THEN** the URL updates to include the repository and issue identifier as query parameters (consistent with the spec-viewer `?repo=` pattern), allowing the link to be shared

### Requirement: Data Freshness Indicator

The system SHALL display an indicator showing when the issue data was last fetched.

#### Scenario: Show fetch timestamp
- **WHEN** issues are loaded from GitHub
- **THEN** the system displays when the data was last fetched so users can assess freshness
