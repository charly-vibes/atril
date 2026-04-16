# How to review atril specs

Use this guide when you want to review the current openspec documents for quality, coverage, and implementability.

## Goal

Evaluate whether the specs are:
- easy to understand
- complete enough to guide implementation
- consistent with project constraints
- structured correctly for openspec workflows

## Review the project context first

Read these files in order:
1. `openspec/project.md`
2. `openspec/specs/platform/spec.md`
3. `openspec/specs/design-system/spec.md`
4. `openspec/specs/spec-viewer/spec.md`
5. `openspec/specs/beads-viewer/spec.md`

This prevents local comments from missing system-wide constraints.

## Check openspec structure

For each capability spec, verify that it includes:
- a clear purpose section
- requirement blocks using `### Requirement:`
- at least one scenario per requirement using `#### Scenario:`
- normative language such as `SHALL`

If you are unsure about the expected format, read `openspec/AGENTS.md`.

## Check requirement quality

For each requirement, ask:
- Is the behavior observable?
- Is the scenario specific enough to test?
- Does the requirement avoid hidden implementation assumptions?
- Does it describe the user-visible result rather than internal mechanics?

Look for quality issues such as:
- vague terms like “fast”, “beautiful”, or “intuitive” without acceptance criteria
- missing error cases
- overlapping requirements that split one behavior across multiple places
- references to functionality not grounded in project constraints

## Check cross-spec consistency

Compare the capability specs with the platform and design-system specs.

Ask these questions:
- Does any requirement imply a framework, server, or build step?
- Does any capability duplicate shared design requirements?
- Do both viewers inherit the same visual system and platform limits?
- Are related terms used consistently across specs?

## Check onboarding coverage

The specs are the reference layer, not the whole documentation system.

Also verify that readers can find:
- a tutorial for first-time orientation
- a task-focused how-to guide
- explanation docs for rationale and trade-offs
- a reference index that maps the available specs

The atril docs for those purposes live under `docs/`.

## Validate the spec suite

Run:

```bash
openspec validate --strict
```

If you are reviewing a single change, run:

```bash
openspec validate <change-id> --strict
```

## Record findings

Write findings in three groups:
- critical: prevents safe implementation or correct understanding
- high: likely to slow contributors or create inconsistent implementations
- low: clarity or polish improvements

## Result

A good review should answer:
- what atril is trying to achieve
- what each capability must do
- what constraints no implementation may violate
- what documentation a new contributor should read next
