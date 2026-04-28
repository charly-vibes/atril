## ADDED Requirements

### Requirement: Pending Change Indicators on Specs

The system SHALL display a contextual indicator on spec documents showing which active changes will modify the current capability.

#### Scenario: Spec with pending changes
- **WHEN** a user views a spec whose capability has one or more active changes (delta files under `openspec/changes/*/specs/<capability>/`)
- **THEN** the system displays an indicator below the spec title listing the names of the pending changes

#### Scenario: Pending change name is navigable
- **WHEN** a user clicks a change name in the pending-change indicator
- **THEN** the system navigates to the change's `proposal.md`

#### Scenario: Spec with no pending changes
- **WHEN** a user views a spec whose capability has no active changes
- **THEN** no pending-change indicator is displayed

#### Scenario: Archived changes excluded from indicator
- **WHEN** a capability has changes only under `openspec/changes/archive/`
- **THEN** those changes are not counted or displayed in the pending-change indicator

### Requirement: Canonical Spec Link on Change Deltas

The system SHALL display a link from change spec deltas back to the canonical spec to provide full context for the proposed changes.

#### Scenario: Change delta with existing canonical spec
- **WHEN** a user views a change spec delta for a capability that has a canonical spec at `openspec/specs/<capability>/spec.md`
- **THEN** the system displays a "View canonical spec" link that navigates to the canonical spec

#### Scenario: Change delta for new capability
- **WHEN** a user views a change spec delta for a capability that does not yet have a canonical spec
- **THEN** no canonical spec link is displayed

### Requirement: Inline Spec Reference Auto-Linking

The system SHALL auto-detect references to known spec capability names (those under `openspec/specs/`) within rendered OpenSpec documents and make them navigable. Change names are not auto-linked.

#### Scenario: Backtick-wrapped capability name
- **WHEN** a rendered OpenSpec document contains a known capability name wrapped in backticks (e.g., `` `cli-core` ``)
- **THEN** the system renders the reference as a navigable link to the capability's spec

#### Scenario: See-also pattern reference
- **WHEN** a rendered OpenSpec document contains text matching "See also:" followed by a capability name
- **THEN** the system renders the capability name as a navigable link to the capability's spec

#### Scenario: No false positives for partial matches
- **WHEN** a rendered document contains a word that is a substring of a capability name but not an exact match
- **THEN** the system does not create a link for the partial match

#### Scenario: No auto-linking inside code blocks
- **WHEN** a capability name appears inside a fenced code block or pre-formatted section
- **THEN** no auto-link is applied and the text renders as normal code

#### Scenario: Non-OpenSpec documents unaffected
- **WHEN** a user views a rendered document outside the `openspec/` directory
- **THEN** no auto-linking of capability names is applied
