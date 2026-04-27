# Roles And Principles

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/design/google-stitch-brief.md]], [[raw/specs/2026-04-06/feature-spec-show-builder-and-theater-relationship-refinement-v1.md]]

Stagecom is built around contextual roles, not global user types.

## Contextual Roles

- Performer: participates in shows or other events.
- Producer: owns a specific event and its setup/casting workflow.
- Theater Manager: oversees theater operations and approvals.
- Theater Staff: trusted theater operators with oversight capabilities.
- Theater Member: active member relationship at the theater level.

## Important Role Rules

- Producer is a show-level role, not a theater-wide title.
- A producer is never automatically part of the cast.
- Cast membership must be explicit through `show_cast`.
- Theater membership is separate from home-theater preference.
- Show staff is distinct from producer and cast.

## Product Principles

The most stable principles across sources are:

- contextual roles over static titles
- privacy by default
- clear show ownership
- reduced off-platform coordination
- explicit theater trust and oversight
- opinionated defaults with room for exceptions

## Implementation Status

- Producer/cast separation is reinforced in product, data, coding, and notification docs.
- Theater oversight roles are modeled distinctly, though current visibility behavior often groups `admin`, `manager`, and `staff` together.
- The UI is increasingly expected to organize around visibility scopes such as `relationship`, `oversight_only`, and `self_only`.

## Related
- [[wiki/product/overview]]
- [[wiki/data/permissions-model]]
- [[wiki/decisions/contextual-roles]]
