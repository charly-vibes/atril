## ADDED Requirements

### Requirement: Overview Source Pill Navigation

The system SHALL make the overview source indicators (SPECS, ISSUES, MEMORY, DOCS, README) function as navigation links when the corresponding source is detected in the repository.

#### Scenario: Click active source pill
- **WHEN** a user clicks a source pill that represents a detected source (e.g., SPECS when `openspec/specs/` exists)
- **THEN** the system navigates to the corresponding view for that source

#### Scenario: Inactive source pill not clickable
- **WHEN** a source pill represents a source that was not detected in the repository
- **THEN** the pill remains visually muted and is not interactive
