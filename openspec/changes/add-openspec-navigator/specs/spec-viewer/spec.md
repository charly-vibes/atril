## ADDED Requirements

### Requirement: OpenSpec Navigator Panel

The system SHALL provide an OpenSpec-aware navigation panel that displays specs and changes in a semantically structured sidebar when viewing OpenSpec content. The navigator SHALL be visible alongside the document content in a split-pane layout, following the same list/detail pattern used by the beads viewer.

#### Scenario: Navigator appears for OpenSpec content
- **WHEN** a user navigates to a file under `openspec/specs/` or `openspec/changes/`
- **THEN** the system displays a persistent navigator panel alongside the rendered document

#### Scenario: Navigator hidden for non-OpenSpec content
- **WHEN** a user views a file outside `openspec/specs/` and `openspec/changes/` (including README, docs, `.wai` artifacts, and `openspec/AGENTS.md` or `openspec/project.md`)
- **THEN** the navigator panel is not displayed and the document uses the full content width

#### Scenario: Navigator not shown for repos without OpenSpec
- **WHEN** a user opens a repository that has no `openspec/` directory
- **THEN** the navigator is never shown and no OpenSpec-specific views are offered

#### Scenario: Specs listed with descriptions
- **WHEN** the navigator panel is displayed
- **THEN** the specs section lists each capability by name with a one-line description extracted from the first paragraph after the `## Purpose` heading in the capability's `spec.md`

#### Scenario: Description extraction fallback
- **WHEN** a spec's `spec.md` does not contain a `## Purpose` heading or the content cannot be fetched
- **THEN** the navigator displays the capability directory name as the label without a description

#### Scenario: Changes grouped by name with status
- **WHEN** the navigator panel is displayed
- **THEN** the changes section groups entries by change name, showing a status indicator (active or archived) and the list of affected capability names under each change

#### Scenario: New capability in change shown distinctly
- **WHEN** a change affects a capability that does not yet exist under `openspec/specs/`
- **THEN** the affected capability name is shown in the change's affected list with a visual distinction indicating it is a new proposed capability

#### Scenario: Archived changes collapsed by default
- **WHEN** the navigator panel is displayed and archived changes exist
- **THEN** archived changes are collapsed by default with a toggle to expand them

#### Scenario: Navigate between specs via navigator
- **WHEN** a user clicks a spec name in the navigator while reading a different spec
- **THEN** the system displays the selected spec's content in the document panel without hiding the navigator

#### Scenario: Navigate to change artifact via navigator
- **WHEN** a user clicks a change name in the navigator
- **THEN** the system displays the change's `proposal.md` in the document panel without hiding the navigator

#### Scenario: Active item highlighting
- **WHEN** a user is viewing a spec or change artifact
- **THEN** the corresponding item in the navigator is visually highlighted to indicate the current position

### Requirement: Responsive Navigator Collapse

The system SHALL auto-collapse the navigator panel on viewports narrower than 768px and provide a toggle to re-expand it.

#### Scenario: Auto-collapse on narrow viewport
- **WHEN** the viewport width is below 768px and the navigator would otherwise be displayed
- **THEN** the navigator is collapsed and a toggle button is shown to expand it

#### Scenario: Toggle expands navigator
- **WHEN** the user activates the navigator toggle on a narrow viewport
- **THEN** the navigator panel expands as an overlay without pushing the document content off-screen
