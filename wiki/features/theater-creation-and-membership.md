# Theater Creation And Membership

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/data/data-model.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]], [[raw/specs/2026-04-06/feature-spec-show-builder-and-theater-relationship-refinement-v1.md]]

## Stable Product Rules

- Theater creation requires a real public identity.
- Theater membership is explicit and cannot be granted implicitly through preference flows.
- Home-theater preference is separate from membership.
- A theater member may create/propose events for that theater.

## Home Theater Direction

The source set has moved from single-home toward multi-home:

- older behavior used `profiles.home_theater_id`
- current data-model direction uses `theater_memberships.is_home` and optional `home_rank`
- users may have zero, one, or many home theaters as long as each is an active membership

## UX Direction

- The app has moved away from "follow/unfollow" language in favor of join/leave or membership language.
- Discovery should be secondary to theater context once a relationship exists.
- The theater collection page remains the place to find or start theaters in the current redesign.

## Code-Enforced vs Doc-Driven

- Membership hardening and "home theater does not create membership" are explicitly documented as code/security requirements.
- The exact final route structure for theater collection versus theater overview is still in flux.

## Related
- [[wiki/data/theater-memberships]]
- [[wiki/features/profile-and-identity]]
- [[wiki/decisions/multi-home-theaters]]
