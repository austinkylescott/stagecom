# Events & Notifications (Stagecom)

## Philosophy
All notifications originate from explicit domain events.
No UI or DB write should silently notify users.

Producers must receive operational notifications even when they are not part of the cast.

---

## Domain Events (v1)
- show.submitted_for_review
- show.approved
- show.rejected
- cast.invited
- cast.requested
- cast.accepted
- cast.declined
- cast.withdrawn
- cast.removed_by_producer
- occurrence.time_changed
- occurrence.cancelled
- show.casting_opened
- occurrence.reminder_24h

---

## Recipient Rules (v1)

### Theater Staff
- For review queue events:
  - show.submitted_for_review

### Show Producers
- For show lifecycle and casting changes:
  - show.approved, show.rejected
  - cast.requested, cast.accepted, cast.declined, cast.withdrawn
  - occurrence.time_changed, occurrence.cancelled
  - occurrence.reminder_24h

Note: Producers are included by show_roles and do NOT need to be cast.

### Performers
- For invitations, confirmations, and schedule changes:
  - cast.invited
  - occurrence.time_changed, occurrence.cancelled
  - occurrence.reminder_24h (accepted performers only)

---

## Delivery Policy (v1)

### Email + In-app
- invited_to_show
- show_time_changed
- show_reminder
- show_approved
- show_rejected

### In-app only (default)
- show_submitted
- cast_request_received
- cast_response_received
- cast_declined
- cast_withdrawn
- new_casting_show

---

## Notification Service Contract

### `emitEvent(event)`
Responsibilities:
- Resolve recipients via recipient rules
- Deduplicate notifications (dedupe_key)
- Insert in-app notifications
- Queue emails when required (email_outbox optional in v1)

Rule:
No notification is created outside this service.

---

## Implementation Notes
- Prefer application-level triggers (service called after DB writes) for v1
- Use deterministic dedupe keys to prevent spam on retries
- Never infer cast membership from producer role
