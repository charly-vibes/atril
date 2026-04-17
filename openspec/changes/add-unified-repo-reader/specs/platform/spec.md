## ADDED Requirements
### Requirement: Repository Input Normalization
The system SHALL accept either a GitHub repository slug (`owner/repo`) or a GitHub repository URL and normalize it into a canonical repository reference used across all views.

#### Scenario: Open repository from slug
- **WHEN** a user enters a value in the form `owner/repo`
- **THEN** the system treats it as the selected repository and loads the repository context without requiring further normalization from the user

#### Scenario: Open repository from GitHub URL
- **WHEN** a user enters a GitHub repository URL
- **THEN** the system extracts the canonical `owner/repo` reference and uses it as the selected repository context

#### Scenario: Reject unsupported repository input
- **WHEN** a user enters a value that is neither a valid repository slug nor a supported GitHub repository URL
- **THEN** the system displays a clear validation error and does not enter a broken repository state

### Requirement: Shared Repository Context
The system SHALL preserve the selected repository and branch context while users move between overview, spec, issue, wai, docs, and history views.

#### Scenario: Navigate between views without losing repository selection
- **WHEN** a user switches from one viewer mode to another after loading a repository
- **THEN** the destination view opens within the same repository and branch context unless the user explicitly changes it

#### Scenario: Deep link restores shared context
- **WHEN** a user opens a deep link into a specific reading mode for a repository
- **THEN** the system reconstructs the repository and branch context needed to load that mode directly

#### Scenario: Branch change in one view does not propagate silently
- **WHEN** a user changes the branch in one viewer mode (e.g., spec-viewer branch selector)
- **THEN** the shared repository context updates to reflect the new branch for subsequent view switches, so all views stay on the same branch
