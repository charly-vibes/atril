# Capability: Design System

## Purpose

Shared visual design system used across all atril viewers. Defines typography, color palette, theme support, and responsive layout conventions.

## Requirements

### Requirement: Typography

The system SHALL use Source Serif 4 for body text, JetBrains Mono for code, and DM Sans for UI elements.

#### Scenario: Consistent font usage
- **WHEN** any viewer renders content
- **THEN** body text uses Source Serif 4, code blocks and inline code use JetBrains Mono, and UI controls (buttons, labels, navigation) use DM Sans

### Requirement: Color Palette

The system SHALL use a warm color palette across all viewers, defined as a set of CSS custom properties (design tokens) covering primary, accent, background, surface, and text colors.

#### Scenario: Consistent palette
- **WHEN** any viewer renders
- **THEN** all colors are drawn from the shared CSS custom properties, not ad hoc hex/rgb values

#### Scenario: Palette definition
- **WHEN** a developer inspects the CSS
- **THEN** color values are defined as custom properties (e.g., `--color-primary`, `--color-bg`) in a single root declaration

### Requirement: Theme Support

The system SHALL support dark and light themes.

#### Scenario: Toggle theme
- **WHEN** a user switches between dark and light theme
- **THEN** all UI elements, typography, and content areas update to the selected theme

#### Scenario: Respect system preference
- **WHEN** no explicit theme is selected
- **THEN** the system defaults to the user's OS-level color scheme preference

### Requirement: Tablet-Optimized Layout

The system SHALL be optimized for tablet reading with generous touch targets and responsive layout.

#### Scenario: Responsive at tablet breakpoint
- **WHEN** the viewport is at tablet width (768px-1024px)
- **THEN** the layout adapts with appropriately sized touch targets (minimum 44x44px) and readable content width

#### Scenario: Responsive at mobile breakpoint
- **WHEN** the viewport is below 768px
- **THEN** the layout collapses to a single-column view with navigation accessible via toggle

### Requirement: Shared Design Tokens

The system SHALL define common styles, fonts, and theme logic as a canonical set of CSS custom properties and font-face declarations. Each self-contained viewer HTML file SHALL embed these tokens so that all viewers share identical values without requiring a build step.

#### Scenario: Consistent visual identity
- **WHEN** both spec-viewer and beads-viewer are rendered side by side
- **THEN** they share the same fonts, colors, spacing, and theme behavior

#### Scenario: Token authoring
- **WHEN** a developer updates a design token value
- **THEN** the canonical source is a single reference (documented or in a shared snippet) that is copied into each viewer's embedded CSS
