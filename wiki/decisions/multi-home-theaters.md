# Home-Theater Multi-Home Migration Decision

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]]

The source set has effectively decided to move from single-home preference to multi-home theater state attached to memberships.

## Decision

- `profiles.home_theater_id` is legacy compatibility state.
- Product source of truth should move to `theater_memberships.is_home` and optional `home_rank`.

## Reasoning

- Home status is only valid when membership is active.
- Users may actively work across multiple theaters.
- Relationship state belongs on the user-theater relationship, not a profile-level singleton field.

## Invariant

Home-theater preference never creates or upgrades membership.

## Related
- [[wiki/data/theater-memberships]]
- [[wiki/features/theater-creation-and-membership]]
- [[wiki/features/schedule-and-callsheet]]
