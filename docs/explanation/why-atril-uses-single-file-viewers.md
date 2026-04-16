# Explanation: why atril uses single-file viewers

atril uses self-contained HTML viewers with embedded CSS and JavaScript. This is a deliberate constraint, not an accidental simplification.

## The constraint supports the product

atril is designed for static hosting on GitHub Pages.

Single-file viewers make deployment simple:
- no server runtime
- no asset pipeline
- no bundling or transpilation
- minimal hosting assumptions

That simplicity matches the project goal: make specs and issues easy to read, not build a full application platform.

## The constraint supports reliability

A self-contained viewer is easy to inspect and easy to publish.

When a file can be opened directly in a browser or served from a static host, there are fewer moving parts to fail. This matters for a project that already depends on remote GitHub APIs for content.

## The constraint supports consistency

Because atril has multiple viewers, there is a risk that each one drifts into its own design language or toolchain.

The design-system spec addresses that by requiring shared tokens and theme behavior, while still keeping each viewer deployable as a single file.

This is why the specs emphasize a canonical token source that is copied into each viewer rather than a runtime dependency on a build system.

## The trade-off

Single-file viewers do create friction.

They can encourage duplication, especially around CSS tokens and utility functions. They also make some forms of modularization less convenient.

atril accepts that trade-off because:
- the current scope is small
- the hosting model is static
- the operational model favors boring deployment over sophisticated tooling

If the project grows enough to make this constraint painful, that should be handled as an explicit architectural change rather than silent drift.
