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

---

### shows
- theater_id
- created_by_user_id
- status (draft, pending_review, approved, rejected, cancelled)
- title
- description
- is_practice (boolean)

Casting:
- casting_mode (direct_invite, theater_casting, public_casting)
- cast_min (int nullable)
- cast_max (int nullable)
- is_cast_finalized (boolean)

Public listing / ticketing readiness:
- is_public_listed (boolean; only true when approved)
- ticket_url (nullable)
- on_sale_at (nullable)

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

---

### email_outbox (optional v1)
- user_id
- template
- payload
- dedupe_key
- status (queued, sent, failed)
