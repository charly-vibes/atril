## ADDED Requirements

### Requirement: Ubiquitous Language Detection

The system SHALL detect whether a repository contains a ubiquitous language index at
`.wai/resources/ubiquitous-language/README.md` and expose it as a **Language** entry point
within the wai reading mode when present.

#### Scenario: Repository has ubiquitous language

- **WHEN** the repository contains `.wai/resources/ubiquitous-language/README.md`
- **THEN** the wai reading mode displays a **Language** entry point that opens the ubiquitous
  language explorer

#### Scenario: Repository does not have ubiquitous language

- **WHEN** the repository does not contain `.wai/resources/ubiquitous-language/README.md`
- **THEN** the wai reading mode omits the Language entry point without treating the absence
  as an error

### Requirement: Bounded Context Overview

The system SHALL render the ubiquitous language index as a navigable overview that lists
each bounded context by name with its one-line purpose.

#### Scenario: Overview lists all bounded contexts

- **WHEN** a user opens the Language entry point
- **THEN** the system displays each context file found under `.wai/resources/ubiquitous-language/contexts/`
  as a named entry with the one-line purpose read from the Purpose column of the context table in
  `.wai/resources/ubiquitous-language/README.md`

#### Scenario: No context files present

- **WHEN** `.wai/resources/ubiquitous-language/contexts/` is absent or empty
- **THEN** the system displays the overview with a message that no bounded contexts are defined

#### Scenario: Clicking a bounded context opens its glossary

- **WHEN** a user selects a bounded context from the overview
- **THEN** the system navigates to the glossary view for that context without a full page reload

### Requirement: Glossary View

The system SHALL render each bounded-context file as a structured glossary where term-definition
table rows are visually distinct from prose and each term has a named anchor.

#### Scenario: Terms are styled as definition pairs

- **WHEN** a bounded-context Markdown file contains a table with **Term** and **Definition** columns
- **THEN** the system renders each row as an HTML definition list entry (`<dl>/<dt>/<dd>`) so that
  screen readers announce term-definition structure correctly

#### Scenario: Context file has no term-definition table

- **WHEN** a bounded-context file contains no table with Term and Definition columns
- **THEN** the system renders available prose content and omits the glossary structure without error

#### Scenario: Each term has a named anchor

- **WHEN** the glossary view renders a bounded-context file
- **THEN** each term receives a URL-fragment anchor derived from its lowercased, hyphenated name
  so that `#route` scrolls to the definition of "Route"

### Requirement: Term Deep Linking

The system SHALL support URL parameters that navigate directly to a specific bounded context
and term so users can share links to individual definitions.

#### Scenario: Deep link to a bounded context

- **WHEN** the URL contains `?view=wai&section=language&context=<context-name>`
- **THEN** the system opens the glossary view for that bounded context directly on load

#### Scenario: Deep link to a specific term

- **WHEN** the URL contains `?view=wai&section=language&context=<context-name>&term=<term-slug>`
- **THEN** the system opens the glossary view for that context and scrolls to the named term anchor

#### Scenario: Invalid context in deep link

- **WHEN** the URL specifies a `context` value that does not match any file in
  `.wai/resources/ubiquitous-language/contexts/`
- **THEN** the system falls back to the bounded context overview and displays a message indicating
  the context was not found

#### Scenario: Term without context in deep link

- **WHEN** the URL specifies a `term` parameter but no `context` parameter
- **THEN** the system falls back to the bounded context overview, ignoring the term parameter
