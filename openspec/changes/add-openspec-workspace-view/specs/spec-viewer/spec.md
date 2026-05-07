## ADDED Requirements

### Requirement: OpenSpec Workspace Entry

The system SHALL treat the Specs entry point as an OpenSpec workspace view covering the whole `openspec/` directory, including project documents, current specs, active changes, archived changes, and raw workspace files when present. The repository entry label may remain "Specs", but the entered page heading SHALL identify the experience as "OpenSpec Workspace".

#### Scenario: Enter workspace with complete OpenSpec structure
- **WHEN** a user opens the Specs view for a repository containing `openspec/project.md`, `openspec/specs/`, `openspec/changes/`, and `openspec/changes/archive/`
- **THEN** the system displays an OpenSpec workspace overview with directly selectable sections for Project, Specs, Changes, Archive, and Files
- **AND** the overview makes active changes and project documents available without requiring raw directory traversal

#### Scenario: Enter workspace with partial OpenSpec structure
- **WHEN** a user opens the Specs view for a repository that has some OpenSpec artifacts but is missing one or more standard areas
- **THEN** the system displays the available OpenSpec sections
- **AND** the system shows clear empty or missing states for absent project documents, specs, active changes, or archived changes

### Requirement: Selectable Project Documents

The system SHALL expose project-level OpenSpec documents as selectable first-class project-context documents within the OpenSpec workspace. This includes `openspec/project.md` when present and `openspec/AGENTS.md` when present.

#### Scenario: Project document present
- **WHEN** a repository contains `openspec/project.md`
- **THEN** the workspace Project section lists `project.md` as a selectable document
- **AND** selecting it renders the document with the same readable document experience and shareable navigation state used for other OpenSpec documents

#### Scenario: Agent guidance present
- **WHEN** a repository contains `openspec/AGENTS.md`
- **THEN** the workspace Project section lists `AGENTS.md` as a selectable guidance document
- **AND** the document remains reachable from the raw Files section

#### Scenario: Project document absent
- **WHEN** a repository has OpenSpec artifacts but no `openspec/project.md`
- **THEN** the workspace Project section shows a clear missing-state message instead of silently omitting project context

### Requirement: First-Class Active Changes

The system SHALL present active OpenSpec changes under `openspec/changes/*` as first-class review objects, excluding archived changes under `openspec/changes/archive/`.

#### Scenario: Active change listed for review
- **WHEN** a repository contains an active change directory with `proposal.md`, `tasks.md`, optional `design.md`, and spec delta files under `openspec/changes/<change-id>/specs/<capability>/spec.md`
- **THEN** the Changes section lists the change by change ID
- **AND** the change detail groups its proposal, tasks, design document when present, and affected spec delta files as navigable documents

#### Scenario: Incomplete active change listed for review
- **WHEN** a repository contains an active change directory that is missing `proposal.md`, missing `tasks.md`, has no spec delta files, or contains only a subset of standard change documents
- **THEN** the Changes section still lists the change by change ID
- **AND** the change detail shows clear missing-document indicators instead of hiding the change or rendering a broken detail view

#### Scenario: Change task progress visible
- **WHEN** an active change contains `tasks.md` with checked and unchecked task items
- **THEN** the system displays a task completion summary for the change
- **AND** the full `tasks.md` remains selectable for detailed review

#### Scenario: Change task progress unavailable
- **WHEN** an active change contains `tasks.md` but it has no parseable checkbox task items
- **THEN** the system indicates that the tasks document is available without showing a numeric completion summary
- **AND** the full `tasks.md` remains selectable for detailed review

#### Scenario: Active change affects current spec
- **WHEN** an active change contains a delta file under `openspec/changes/<change-id>/specs/<capability>/spec.md` and the repository also contains `openspec/specs/<capability>/spec.md`
- **THEN** the change detail provides navigation to the affected current spec

### Requirement: Workspace Navigation Loops

The system SHALL support author/reviewer navigation loops between project context, current specs, active changes, archived changes, and raw files without losing repository and branch context.

#### Scenario: Navigate from current spec to related active changes
- **WHEN** a user views a current spec whose capability has one or more active change deltas
- **THEN** the workspace provides navigation to those active changes

#### Scenario: Navigate from active change to affected current spec
- **WHEN** a user views an active change that affects one or more canonical specs
- **THEN** the workspace provides navigation back to those current specs when they exist

#### Scenario: Raw files escape hatch
- **WHEN** a user needs an OpenSpec file that is not represented by Project, Specs, Changes, or Archive sections
- **THEN** the workspace provides access to a raw `openspec/` files section

### Requirement: Archived Change Reference

The system SHALL expose archived OpenSpec changes under `openspec/changes/archive/` as lower-priority historical reference material.

#### Scenario: Archived changes present
- **WHEN** a repository contains archived changes under `openspec/changes/archive/`
- **THEN** the workspace provides an Archive section listing those changes separately from active changes
- **AND** archived changes are not counted as active review work

#### Scenario: No archived changes
- **WHEN** a repository has no archived changes
- **THEN** the Archive section is hidden or collapsed by default
- **AND** project documents, current specs, and active changes remain the primary workspace sections
