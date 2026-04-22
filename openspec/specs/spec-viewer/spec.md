# Capability: Spec Viewer

## Purpose

Reads openspec documents from GitHub repositories and renders them with clean typography, hierarchical navigation, and responsive layout. Deployed at `/spec-viewer/`. Related capability: [beads-viewer](../beads-viewer/spec.md).

## Requirements

### Requirement: Document Rendering

The system SHALL render Markdown, YAML, JSON, and TOML files from GitHub repositories with clean typography. Markdown rendering uses a GFM-compliant parser (marked) for full GitHub Flavored Markdown support.

#### Scenario: Render Markdown file
- **WHEN** a user navigates to a Markdown file in a repository
- **THEN** the system renders the Markdown with proper heading hierarchy (h1-h6 with stable IDs), code blocks, lists, tables, blockquotes, inline formatting (bold, italic, inline code), links, and images

#### Scenario: Render structured data files
- **WHEN** a user navigates to a YAML, JSON, or TOML file
- **THEN** the system renders the file with syntax highlighting and readable formatting

#### Scenario: Malformed structured data file
- **WHEN** a user navigates to a YAML, JSON, or TOML file that cannot be parsed or formatted safely
- **THEN** the system displays a clear error message instead of a broken or blank rendered view

### Requirement: File Tree Navigation

The system SHALL provide hierarchical file tree navigation with search for browsing repository contents.

#### Scenario: Browse repository file tree
- **WHEN** a user loads a repository
- **THEN** the system displays a navigable file tree showing the repository's directory structure

#### Scenario: Search within file tree
- **WHEN** a user types a query into the file tree search
- **THEN** the file tree filters to show only files and directories matching the query

### Requirement: Branch Switching

The system SHALL support switching between repository branches while preserving the currently selected file when it exists on the target branch.

#### Scenario: Switch branch with file persistence
- **WHEN** a user switches from branch A to branch B while viewing a file that exists on both branches
- **THEN** the system loads the file from branch B and continues displaying it

#### Scenario: Switch branch when file does not exist
- **WHEN** a user switches to a branch where the currently selected file does not exist
- **THEN** the system falls back to the repository root or a sensible default

### Requirement: Table of Contents

The system SHALL auto-generate a table of contents for documents with 3 or more headings.

#### Scenario: Generate TOC from headings
- **WHEN** a user views a Markdown document with 3 or more headings at any level (h1 through h6)
- **THEN** the system displays an auto-generated table of contents that links to each heading

#### Scenario: No TOC for short documents
- **WHEN** a user views a document with fewer than 3 headings at any level
- **THEN** no table of contents is displayed

### Requirement: Deep Linking

The system SHALL support deep linking via URL parameters so users can share links to specific repositories, branches, and files.

#### Scenario: Open via URL parameters
- **WHEN** a user navigates to a URL with `?repo=`, `&branch=`, and `&file=` parameters
- **THEN** the system loads the specified repository, checks out the specified branch, and displays the specified file

#### Scenario: URL reflects current state
- **WHEN** a user navigates to a file in a repository
- **THEN** the URL updates to reflect the current repo, branch, and file selection

#### Scenario: Invalid deep link parameters
- **WHEN** a user navigates to a URL whose `repo`, `branch`, or `file` parameters cannot be resolved
- **THEN** the system displays a clear error state or falls back to a sensible default instead of showing a blank or broken view

### Requirement: Image Resolution

The system SHALL resolve relative image paths in Markdown documents via GitHub raw content URLs so that images display correctly.

#### Scenario: Render relative images
- **WHEN** a Markdown document contains a relative image path (e.g., `![](./diagram.png)`)
- **THEN** the system resolves the path against the GitHub raw content URL and displays the image

### Requirement: Error Handling

The system SHALL display clear error messages when content cannot be loaded.

#### Scenario: Repository not found
- **WHEN** a user navigates to a URL with a `?repo=` value that does not exist or is private
- **THEN** the system displays an error message indicating the repository could not be found

#### Scenario: File fetch failure
- **WHEN** the GitHub API returns an error while fetching a file
- **THEN** the system displays an error message instead of a blank or broken view
