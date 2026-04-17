## ADDED Requirements
### Requirement: Repository Entry
The system SHALL provide a repository entry flow that accepts a repository slug or GitHub repository URL and opens the selected repository for reading.

#### Scenario: Open repository from entry screen
- **WHEN** a user pastes a supported repository slug or GitHub URL into the entry interface and submits it
- **THEN** the system opens the selected repository and transitions to the repository overview

### Requirement: Repository Overview Dashboard
The system SHALL present an overview dashboard for a loaded repository that helps users understand what structured knowledge exists and where to start reading.

#### Scenario: Show overview after repository load
- **WHEN** a repository is loaded successfully
- **THEN** the system displays an overview with navigation entry points into the repository's available reading modes and knowledge sources

### Requirement: Knowledge Source Detection
The system SHALL detect the presence of repository knowledge sources including `openspec/`, `.beads/`, `.wai/`, and common documentation entry points.

#### Scenario: Detect structured knowledge sources
- **WHEN** the system inspects a loaded repository
- **THEN** it identifies which supported knowledge sources are present and exposes only the relevant overview entry points

#### Scenario: Repository missing a supported knowledge source
- **WHEN** a loaded repository does not contain one of the supported knowledge sources
- **THEN** the overview omits that entry point or marks it unavailable without treating the repository as invalid

#### Scenario: Repository with no supported knowledge sources
- **WHEN** a loaded repository contains none of the supported knowledge sources (no `openspec/`, `.beads/`, `.wai/`, or common documentation entry points)
- **THEN** the overview displays a meaningful empty state indicating no structured knowledge was detected, rather than showing a blank or broken dashboard

### Requirement: Suggested Starting Points
The system SHALL surface recommended entry points such as README files, OpenSpec project context, active changes, recent handoffs, and high-priority issues when those artifacts are present.

#### Scenario: Recommend useful first documents
- **WHEN** the overview has enough repository context to identify likely starting points
- **THEN** it highlights a small set of suggested documents or views that help a new reader orient quickly
