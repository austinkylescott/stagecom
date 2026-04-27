# Notifications

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/events-and-notifications.md]], [[raw/data/data-model.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

Notifications are a self-only operational inbox backed by domain events.

## Delivery Model

- in-app notifications are primary
- some event types also queue email
- deduplication is required

## Core Recipient Rules

- theater staff receive review-submission notifications
- producers receive lifecycle, casting, and schedule-change notifications even when not cast
- performers receive invite/confirmation/schedule notifications relevant to their participation

## Product Shape

The notification page is intentionally not a general dashboard. It is a handoff surface into the correct workspace.

## Enforcement

- notification reads are scoped to `user_id = current_user`
- mark-as-read operations are self-scoped
- notifications should never be created outside `emitEvent()`

## Related
- [[wiki/architecture/notifications-service]]
- [[wiki/features/show-lifecycle]]
- [[wiki/features/profile-and-identity]]
