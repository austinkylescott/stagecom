# Profiles

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/research/visibility-rules.md]], [[raw/data/data-model.md]]

Profiles are user-owned identity records with user-controlled visibility.

## Visibility Levels

- `public`
- `theater_only`
- `private` / self-only

## Stable Rules

- Users can always view and update their own profile.
- Anonymous viewers only see public profiles.
- Signed-in viewers may see `theater_only` profiles when they share an active theater membership.
- Theater affiliation visibility is stricter than profile visibility and should not leak unrelated memberships.

## Home Theater Note

`profiles.home_theater_id` is legacy compatibility state, not the intended long-term source of truth for home-theater preference once multi-home is enabled.

## Related
- [[wiki/features/profile-and-identity]]
- [[wiki/data/theater-memberships]]
- [[wiki/data/permissions-model]]
