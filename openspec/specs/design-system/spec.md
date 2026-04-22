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

The system SHALL use a warm, low-contrast color palette across all viewers, defined as CSS custom properties covering background, surface, foreground, muted, accent, error, and border colors. The palette prioritizes reduced eye strain for long reading sessions.

#### Scenario: Consistent palette
- **WHEN** any viewer renders
- **THEN** all colors are drawn from the shared CSS custom properties (`--color-bg`, `--color-surface`, `--color-fg`, `--color-muted`, `--color-accent`, `--color-error`, `--color-border`), not ad hoc hex/rgb values

#### Scenario: Palette definition
- **WHEN** a developer inspects the CSS
- **THEN** color values are defined as custom properties in a single `:root` declaration, with light mode using warm ivory tones and dark mode using warm charcoal tones

### Requirement: Theme Support

The system SHALL support dark and light themes via both automatic OS detection and a manual toggle.

#### Scenario: Respect system preference
- **WHEN** no manual theme has been selected
- **THEN** the system automatically applies the theme matching the user's OS preference via `@media (prefers-color-scheme)`

#### Scenario: Manual theme toggle
- **WHEN** a user clicks the theme toggle button
- **THEN** the system switches between dark and light themes, persists the choice in `localStorage`, and applies it immediately via a `data-theme` attribute on the root element

#### Scenario: Persisted theme preference
- **WHEN** a user returns to atril after previously selecting a theme
- **THEN** the system applies the saved theme preference from `localStorage` instead of the OS default

#### Scenario: Theme consistency
- **WHEN** the theme changes (via toggle or OS preference)
- **THEN** all CSS custom properties update and all surfaces, borders, and text colors reflect the active theme

### Requirement: Tablet-Optimized Layout

The system SHALL be optimized for tablet reading with generous touch targets and responsive layout.

#### Scenario: Responsive at tablet breakpoint
- **WHEN** the viewport is at tablet width (768px-1024px)
- **THEN** the layout adapts with appropriately sized touch targets (minimum 44x44px) and readable content width

#### Scenario: Responsive at mobile breakpoint
- **WHEN** the viewport is below 768px
- **THEN** the layout collapses to a single-column view with navigation accessible via toggle

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

### Requirement: Accessibility Contrast

The system SHALL meet WCAG AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text) in both dark and light themes.

#### Scenario: Light theme contrast compliance
- **WHEN** the light theme is active
- **THEN** all text-on-background color combinations meet WCAG AA minimum contrast ratios

#### Scenario: Dark theme contrast compliance
- **WHEN** the dark theme is active
- **THEN** all text-on-background color combinations meet WCAG AA minimum contrast ratios

### Requirement: Keyboard Navigation

The system SHALL support keyboard navigation for all interactive UI elements so users can operate the interface without a pointing device.

#### Scenario: Navigate interactive elements with keyboard
- **WHEN** a user presses Tab or arrow keys
- **THEN** focus moves through interactive elements (navigation, buttons, links, tree items) in a logical order with a visible focus indicator

### Requirement: Print-Friendly Rendering

The system SHALL provide print-friendly CSS so users can print or export documents to PDF with readable formatting.

#### Scenario: Print a rendered document
- **WHEN** a user prints a page from any viewer
- **THEN** the printed output uses readable typography, omits navigation chrome, and preserves content structure

