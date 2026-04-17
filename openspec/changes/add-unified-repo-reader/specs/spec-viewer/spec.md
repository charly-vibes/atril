## ADDED Requirements
### Requirement: Internal Repository Link Resolution
The system SHALL resolve relative links and anchors in rendered repository documents to in-app navigation when the linked target exists in the selected repository.

#### Scenario: Follow relative link to another repository document
- **WHEN** a rendered document contains a relative link to another file that exists in the selected repository
- **THEN** activating the link opens the target document within atril while preserving repository context

#### Scenario: Follow anchor link within a document
- **WHEN** a rendered document contains an anchor link to a heading in the same document
- **THEN** activating the link scrolls to the target heading within the rendered view

#### Scenario: Unresolved internal link target
- **WHEN** a rendered document contains a relative link whose target cannot be resolved in the selected repository and branch
- **THEN** the system displays a clear fallback or unresolved-link state instead of failing silently or breaking navigation

#### Scenario: Link resolution is navigational only
- **WHEN** a rendered document contains internal repository links
- **THEN** the system resolves links at navigation time (on click) rather than prefetching or recursively resolving all linked targets, avoiding loops from circular cross-references

### Requirement: OpenSpec Context Navigation
The system SHALL surface related OpenSpec artifacts for the currently viewed specification content, including current capabilities, active changes, and archived changes when resolvable.

#### Scenario: View related change from a spec document
- **WHEN** a user is reading an OpenSpec capability and related change proposals affecting that capability are present in the repository
- **THEN** the system offers navigation to those related change artifacts without requiring a separate repository search

#### Scenario: View current capability from a change artifact
- **WHEN** a user is reading an OpenSpec change proposal that references an existing capability
- **THEN** the system offers navigation to the current capability specification when it can be resolved
