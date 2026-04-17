## ADDED Requirements
### Requirement: Commit History Overview
The system SHALL provide a history reading mode that displays recent commits for the selected repository.

#### Scenario: View recent repository commits
- **WHEN** a user opens the history reading mode for a loaded repository
- **THEN** the system displays a navigable list of up to 30 recent commits with commit message, author, timestamp, and changed-path summary when available

#### Scenario: Empty commit history
- **WHEN** the repository has no commits or the API returns an empty commit list
- **THEN** the system displays an empty state indicating no history is available

### Requirement: Path-Specific History
The system SHALL allow users to inspect recent commit history for a selected repository file or path.

#### Scenario: View history for selected document path
- **WHEN** a user requests history while reading a repository document or artifact
- **THEN** the system displays recent commits affecting that file or path while preserving repository context

### Requirement: History Error Handling
The system SHALL provide clear feedback when commit history cannot be loaded because of repository access errors, missing data, or GitHub API limits.

#### Scenario: History fetch failure
- **WHEN** the system cannot load history for the repository or selected path
- **THEN** it displays a clear error state instead of a blank or broken history view
