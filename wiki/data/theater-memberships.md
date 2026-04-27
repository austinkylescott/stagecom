# Theater Memberships

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]]

`theater_memberships` is the authoritative user-theater relationship table.

## Key Fields

- `theater_id`
- `user_id`
- `roles`
- `status`
- `is_home`
- `home_rank`

## Stable Rules

- Membership changes must happen through explicit membership flows or authorized staff actions.
- Home-theater state only exists on active memberships.
- Setting or clearing home-theater state must never create or reactivate membership.
- Leaving a theater clears home-theater state automatically.

## Role Model

Theater-level roles include:

- `admin`
- `manager`
- `staff`
- `instructor`
- `member`

Current visibility helpers commonly treat `admin`, `manager`, and `staff` as oversight-equivalent, but the docs still preserve `admin` as a distinct role class.

## Migration Direction

The source set has moved away from `profiles.home_theater_id` as product source of truth. It may remain as a compatibility pointer during migration, but the long-term model is membership-based multi-home state.

## Related
- [[wiki/data/theaters]]
- [[wiki/data/permissions-model]]
- [[wiki/decisions/multi-home-theaters]]
