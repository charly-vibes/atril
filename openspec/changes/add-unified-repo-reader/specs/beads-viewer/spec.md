## ADDED Requirements
### Requirement: Dependency Exploration Modes
The system SHALL provide more than one dependency inspection mode for beads issues, including a focused dependency view in addition to any full-graph visualization.

#### Scenario: Inspect focused dependency neighborhood
- **WHEN** a user selects an issue while using dependency exploration
- **THEN** the system can display that issue together with its direct blockers and dependents in a focused view that is easier to read than a full repository graph

#### Scenario: Return from focused dependency view to broader exploration
- **WHEN** a user exits a focused dependency view
- **THEN** the system returns to the broader issue browsing or graph context without losing the selected repository

### Requirement: Issue Artifact Cross-References
The system SHALL expose navigable references from issue content to related repository artifacts when those references can be resolved.

#### Scenario: Navigate from issue to related repository artifact
- **WHEN** an issue title or description contains a resolvable reference to a repository artifact such as a spec, change proposal, or documentation file
- **THEN** the system offers navigation to that artifact within atril

#### Scenario: Unresolvable issue reference
- **WHEN** an issue contains a reference that cannot be resolved to a repository artifact
- **THEN** the system preserves the issue text and indicates that no in-app destination is available instead of producing a broken link
