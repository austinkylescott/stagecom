# Casting System

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/data/data-model.md]], [[raw/product/events-and-notifications.md]], [[raw/product/visibility-policy.md]]

## Casting Modes

- `direct_invite`
- `theater_casting`
- `public_casting`

All modes still support direct invites.

## Request Rules

- Anonymous users cannot request to join.
- Producers cannot request to join their own show.
- `direct_invite` never exposes a request path.
- `theater_casting` is for active theater members.
- `public_casting` allows any signed-in non-producer to request.

## Cast Size And Finalization

- Shows can define exact or ranged cast size.
- Over-max is warned, not hard-blocked in v1.
- Producers may mark the cast finalized.

## Notifications

Casting changes are first-class notification events:

- invite
- request
- approval
- acceptance
- decline
- withdrawal
- producer-side removal

## Related
- [[wiki/data/show-cast]]
- [[wiki/features/show-lifecycle]]
- [[wiki/features/notifications]]
