## MODIFIED Requirements

### Requirement: Shared Design Tokens
The system SHALL define common styles, fonts, and theme logic as a canonical set of CSS custom properties and font-face declarations in shared CSS files. All viewers SHALL import these shared tokens at build time so that all views share identical values.

#### Scenario: Consistent visual identity
- **WHEN** multiple viewer modes are rendered
- **THEN** they share the same fonts, colors, spacing, and theme behavior

#### Scenario: Token authoring
- **WHEN** a developer updates a design token value
- **THEN** the change is made in one shared CSS source file and automatically propagated to all viewers through the build pipeline

#### Scenario: Verify token consistency across viewers
- **WHEN** a developer inspects the built output for any two viewer modes
- **THEN** the shared design token names and values match for typography, color, spacing, and theme variables
