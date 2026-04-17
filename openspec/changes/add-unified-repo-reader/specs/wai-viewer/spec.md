## ADDED Requirements
### Requirement: WAI Detection
The system SHALL detect whether a repository contains a `.wai/` directory and expose it as a first-class reading mode when present.

#### Scenario: Repository contains `.wai`
- **WHEN** the selected repository includes a `.wai/` directory
- **THEN** the system exposes a wai reading mode or overview entry point for that repository

#### Scenario: Repository does not contain `.wai`
- **WHEN** the selected repository does not include a `.wai/` directory
- **THEN** the system omits or disables the wai reading mode without treating the repository as invalid

### Requirement: WAI Artifact Browsing
The system SHALL organize `.wai` artifacts for browsing by project, artifact type, or repository location so users can understand the repository's captured reasoning.

#### Scenario: Browse wai artifacts by grouping
- **WHEN** a repository contains `.wai` artifacts
- **THEN** the system provides at least one grouped navigation mode (by project, artifact type, or repository location) that helps users browse those artifacts without relying solely on a raw file tree

### Requirement: WAI Artifact Reading
The system SHALL render readable wai artifacts and preserve repository context while users navigate among related `.wai` documents.

#### Scenario: Read wai artifact in context
- **WHEN** a user opens a wai artifact
- **THEN** the system renders the artifact in a readable view and keeps repository navigation available for moving to related content
