# Explanation: atril in the wai ecosystem

atril exists because the wai ecosystem produces valuable artifacts that are not always pleasant to read in raw repository form.

The ecosystem separates concerns:

- **wai** captures *why* decisions were made.
- **bd** captures *what* work exists and how it relates.
- **openspec** captures *what the system should look like*.
- **atril** improves *how those artifacts are read*.

This separation matters.

If atril also created or modified those artifacts, it would stop being a focused reading tool and would inherit very different product and technical pressures. Instead, atril stays read-only and presentation-oriented.

## Why atril is a separate project

Both current viewers began as prototypes in `jams`, but atril gives them a dedicated home with a clearer mission.

A separate repository makes it easier to:
- evolve a shared design language across viewers
- align with the wai ecosystem intentionally
- publish a focused GitHub Pages experience
- keep reader-facing concerns separate from unrelated prototype apps

## Why the specs are split the way they are

The current openspec suite is intentionally divided into four kinds of truth:

- `platform` defines hard technical boundaries
- `design-system` defines shared visual and interaction consistency
- `spec-viewer` defines one capability
- `beads-viewer` defines another capability

This split keeps cross-cutting constraints from being repeated in every feature spec.

## Why the viewers are read-only

Read-only behavior reduces risk and complexity.

atril is meant to help people inspect artifacts, not mutate them. That keeps the hosting model simple, the permission model light, and the mental model clear.

A reader can trust that opening atril will never modify a repository.

## Why this matters for contributors

When contributors understand atril as a presentation layer instead of a general app platform, several design decisions become easier to evaluate:
- server-side features are usually out of bounds
- editing flows are out of scope
- improvements to readability, navigation, and shareability are central
- GitHub API efficiency matters because the app is static and unauthenticated

In short, atril is successful when repository artifacts become easier to read, navigate, and share without changing their source of truth.
