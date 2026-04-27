# Notifications Service

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/events-and-notifications.md]], [[raw/development/coding-rules.md]], [[raw/data/data-model.md]]

All notifications originate from explicit domain events and must be created through `emitEvent(event)`.

## Responsibilities

- resolve recipients from domain rules
- deduplicate via deterministic `dedupe_key`
- insert in-app notifications
- optionally queue email in `email_outbox`

## Stable Rules

- Producers receive operational notifications even when not cast.
- No route, component, or ad hoc DB write should create notifications outside the service.
- The service is responsible for retries without notification spam.

## Domain Events

Core v1 events include:

- show review changes
- cast invites/requests/responses
- occurrence time changes/cancellations
- casting opened
- 24-hour reminders

## Related
- [[wiki/features/notifications]]
- [[wiki/data/shows]]
- [[wiki/decisions/producers-are-not-cast]]
