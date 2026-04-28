# Bounded Context: OpenSpec

Defines the structure of specifications and change proposals. Atril reads and renders these structures; openspec authoring happens in a separate tool.

## Directory Layout

```
openspec/
  specs/<capability>/spec.md        ← canonical truth
  changes/<change-id>/
    proposal.md                     ← why/what/impact
    tasks.md                        ← implementation checklist
    design.md                       ← optional design decisions
    specs/<capability>/spec.md      ← delta spec
  changes/archive/<date>-<id>/      ← completed changes
```

## Key Concepts

| Term | Definition |
|------|------------|
| **Capability** | A named feature; directory name under `specs/` is the capability identifier |
| **Specification** | `specs/<capability>/spec.md` — normative requirements using SHALL/MUST |
| **Requirement** | A normative statement in a spec; uniquely identified by capability name + requirement heading |
| **Scenario** | `#### Scenario: <name>` — concrete WHEN/THEN example for a requirement |
| **Change** | A proposed modification under `changes/<change-id>/` |
| **Change ID** | Kebab-case, verb-led (`add-unified-repo-reader`, `fix-link-resolution`) |
| **Delta Spec** | `changes/<id>/specs/<capability>/spec.md` using `## ADDED\|MODIFIED\|REMOVED\|RENAMED Requirements` sections |
| **New Capability** | A capability that appears in a delta but not yet in `specs/` |
| **Archived Change** | Completed change moved to `changes/archive/<date>-<id>/` |
| **Capability Affinity** | Bidirectional map: capability → changes that affect it, change → capabilities it touches |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Build OpenSpec Index** | Catalog capabilities, changes, delta relationships, and file mappings from the repo tree |
| **Detect Capability Affinity** | Determine which capabilities each change affects (and vice versa) |
| **Detect New Capabilities** | Identify capabilities introduced by a change (in delta but not in `specs/`) |
| **Render OpenSpec Document** | Apply special formatting: Requirements → collapsible `<details>`, Scenarios indented inside |

## Invariants

- Delta spec sections must use exactly one of: `ADDED`, `MODIFIED`, `REMOVED`, `RENAMED`
- Change IDs are globally unique and kebab-case

## Authoring Conventions

These rules govern how openspec content should be authored; atril renders non-conforming content without error:

- Every requirement should have at least one scenario
