# Why Producers Are Never Assumed To Be Cast

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/data/data-model.md]], [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/product/events-and-notifications.md]]

Producer status and cast membership are intentionally separate.

## Decision

- Show creators automatically become producers.
- They do not appear in cast or lineup state unless explicitly added.

## Reasoning

- Operational ownership is not the same as performance participation.
- Notifications, permissions, and schedule relationships need to work even when a producer is not performing.
- Explicit cast rows keep lineups, program order, and performer-facing visibility trustworthy.

## Related
- [[wiki/data/show-cast]]
- [[wiki/features/show-lifecycle]]
- [[wiki/architecture/notifications-service]]
