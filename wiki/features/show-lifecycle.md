# Show Lifecycle

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/data/data-model.md]], [[raw/specs/2026-04-06/feature-spec-show-builder-and-theater-relationship-refinement-v1.md]], [[raw/specs/2026-04-06/show-builder-review-followups.md]]

## Core Lifecycle

1. A theater member creates a draft event/show and becomes producer.
2. The producer edits draft content, occurrences, listing, and casting setup.
3. Submission creates a pending review record.
4. Theater oversight approves, rejects, or requests changes.
5. Public visibility requires both approval and public-listing state.

## Stable Invariants

- Producer is automatically assigned as producer, never as cast.
- Cast membership stays explicit.
- Unapproved or unlisted events are not public.
- Approval and publication are separate decisions.

## Builder Direction

The later 2026-04-06 builder spec expands lifecycle setup into guided steps:

- basics
- schedule/occurrences
- listing essentials
- casting/staffing
- review and submission

## Known Follow-Ups

The review follow-up doc records unresolved implementation risks:

- draft edits should be gated by status, not just role
- occurrence/staff replacement should be transactional
- draft-save validation may still be stricter than the spec intended

## Related
- [[wiki/data/shows]]
- [[wiki/features/casting-system]]
- [[wiki/features/theater-admin-and-review]]
