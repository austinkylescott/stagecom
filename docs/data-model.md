# Data Model Overview (Stagecom)

Postgres-first, Supabase-friendly schema blueprint.

---

## Core Tables

### theaters
- id (uuid)
- name
- slug (unique)
- tagline (promo blurb)
- street
- city
- state_region
- postal_code
- country

---

### theater_memberships
- theater_id
- user_id
- roles (array of theater_role; admin, manager, staff, instructor, member)
- status (active, inactive)

Rules:
- Membership changes must happen through explicit membership flows or authorized theater staff actions
- `home_theater_id` is a profile preference and must never create or reactivate membership

---

### shows
- theater_id
- created_by_user_id
- status (draft, pending_review, approved, rejected, cancelled)
- title
- description
- event_type (show, practice, meeting, audition, workshop)

Casting:
- casting_mode (direct_invite, theater_casting, public_casting)
- cast_min (int nullable)
- cast_max (int nullable)
- is_cast_finalized (boolean)

Public listing / ticketing readiness:
- is_public_listed (boolean; only true when approved)
- ticket_url (nullable)
- on_sale_at (nullable)

Visibility rules:
- Approved + publicly listed shows may be visible outside the owning theater
- Draft, pending, rejected, and other non-public shows require an authorized relationship such as producer, theater staff, or explicit cast involvement

---

### show_roles
Show-level roles (contextual):
- show_id
- user_id
- role (producer)

Rule:
- show creator must have producer role
- producer is NOT automatically cast

---

### show_occurrences
Recommended even for v1:
- show_id
- starts_at (timestamptz)
- ends_at (timestamptz nullable)
- status (scheduled, changed, cancelled)

---

### show_cast
Performer membership is explicit:
- show_id
- user_id
- source (invited, requested)
- status (pending, accepted, declined, withdrawn, removed)
- program_order (int nullable)
- note (text nullable)

Rule:
- producers do not appear here unless explicitly added

Visibility rules:
- Producers and authorized theater staff may inspect the full cast state
- Performers may inspect their own cast record
- Accepted cast is the public/program-facing state

---

### show_review_events
- show_id
- action (submitted, approved, rejected, changes_requested)
- actor_user_id
- note (nullable)

---

### notifications
- user_id
- type
- entity_type (show, occurrence, cast)
- entity_id
- payload (jsonb)
- dedupe_key (unique per user)
- read_at (nullable)

Security rules:
- Notifications belong to exactly one recipient user
- Read and update access is restricted to that recipient except for service-role workflows

---

### email_outbox (optional v1)
- user_id
- template
- payload
- dedupe_key
- status (queued, sent, failed)
