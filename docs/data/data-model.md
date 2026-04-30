# Data Model Overview (Stagecom)

Postgres-first, Supabase-friendly schema blueprint.

---

## Core Tables

### theaters
- id (uuid)
- name
- slug (unique)
- tagline (promo blurb)
- timezone (IANA timezone like `America/New_York`; event times display in the theater's local zone)
- upcoming_shows_limit (int; total number of upcoming public shows shown on the theater board, including the dashboard slot)
- upcoming_other_events_limit (int; total number of upcoming public non-show events shown on the theater board, including the dashboard slot)
- street
- city
- state_region
- postal_code
- country
- website_url (nullable public website link)
- logo_url (nullable public image/logo URL)

Rules:
- Theater creation requires a real public identity, not just a name. `name`, `tagline`, `timezone`, `street`, `city`, `state_region`, `postal_code`, and `country` are required theater fields.
- Theater board limits are theater-level admin settings.
- The first show and first non-show event from these limits feed the dashboard cards.
- Remaining items from the same fetched slices feed the lower board sections.
- These limits should shape fetch size directly; do not fetch more items than the board can render.
- `website_url` and `logo_url` support richer public theater presentation, but they are secondary profile fields rather than required creation-time identity.

---

### theater_memberships
- theater_id
- user_id
- roles (array of theater_role; admin, manager, staff, instructor, member)
- status (active, inactive)
- is_home (boolean; source of truth for home-theater pinning)
- home_rank (int nullable; optional ordering metadata for pinned home theaters)

Rules:
- Membership changes must happen through explicit membership flows or authorized theater staff actions
- Home-theater state must only exist on active memberships
- Setting or clearing home-theater state must never create or reactivate membership
- Leaving a theater must remove its home-theater state automatically

Compatibility note:
- `profiles.home_theater_id` may remain as a legacy compatibility pointer during migration, but it is no longer the product source of truth once multi-home support is enabled

---

### profiles
- id
- display_name
- avatar_url
- timezone
- pronouns
- bio
- city
- handle (nullable unique public identity field)
- home_theater_id (legacy compatibility pointer only)
- contact_links (jsonb)
- field_visibility (jsonb)
- visibility (`public`, `theater_only`, `private`)

Rules:
- Profiles are user-owned identity records.
- `handle` is an optional public identity field and should be stored in slug form.
- `visibility` is the profile discoverability setting and defaults to `theater_only`.
- `visibility` controls whether the user can appear to others in people-discovery surfaces such as search results, theater people surfaces, show people surfaces, and invite pickers.
- `private` profiles remain fully usable by the owner but should not appear to other users in discovery-driven surfaces.
- `contact_links` is the active storage location for profile contact visibility and phone value.
- `field_visibility` stores per-field visibility for `display_name`, `handle`, `pronouns`, `city`, and `bio`.
- `contact_links.email` stores visibility only; email value is always derived from the auth user record.
- `contact_links.phone` stores the user-managed phone number plus its visibility.
- `field_visibility` does not widen discoverability beyond `visibility`; it only controls which fields are shown after the profile is already visible to the viewer.
- Timezone may remain stored for compatibility, but it is not currently part of the user-facing profile identity surface.

---

### shows
- theater_id
- created_by_user_id
- slug (unique within a theater)
- status (draft, pending_review, approved, rejected, cancelled)
- title
- summary (nullable short promo copy for cards and listings)
- description
- producer_note (nullable internal note for theater review)
- poster_url (nullable public artwork URL; placeholder used when empty)
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
- `summary`, `description`, `poster_url`, schedule data, and approved ticketing fields together should be enough for Stagecom to serve as the public-facing event record without a separate CMS in v1

Routing rules:
- Public/canonical event URLs use `/theater/[theaterSlug]/event/[eventSlug]`
- `shows.slug` only needs to be unique inside a single theater
- Theater ownership still lives in data and permissions, not just in the URL

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

Rules:
- Shows may have multiple occurrences
- Producers should be able to draft occurrence groups before review submission

---

### show_staff_assignments
Show-level operations assignments:
- id (uuid)
- show_id
- user_id
- assignment_type (`front_of_house`, `box_office`, `bar`, `tech`, `other`)
- status (`assigned`, `confirmed`, `cancelled`)
- note (nullable)

Rules:
- Assigned staff must be explicit, not inferred from theater-level roles
- Show staff may inspect full show operations but are not allowed to edit proposal-defining fields by default
- Theater admins and staff may assign or update show staff as part of event operations

---

## Route Read Model

Canonical routes:
- `/callsheet` is the canonical signed-in home and schedule page.
- `/theater/[slug]` is the canonical theater homepage.
- `/theater/[slug]/admin` is the canonical theater operations home.
- `/event/new` is the canonical event creation route.
- `/theater/[theaterSlug]/event/[eventSlug]` is the canonical event detail route.

User schedule scope:
- `personal` is the default and includes only explicit producer, cast, or show-staff relationships.
- `home` includes visible occurrences at active home-theater memberships.
- `joined` includes visible occurrences across active joined theater memberships.

Relationship annotations:
- Schedule occurrence rows stay lean and may include viewer relationship labels: `producer`, `cast`, `show_staff`, `theater_member`, and `home_theater`.
- Relationship labels annotate why an occurrence appears or how the viewer relates to it; producers are not inferred as cast, and cast still requires an explicit `show_cast` row.

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
- `program_order` is an application-managed lineup position for accepted performers
- `program_order` must remain collision-free within a show; when a producer moves one performer into a slot, later slotted performers shift down
- accepted performers may still have `program_order = null` until the producer places them in the lineup

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

Rules:
- Producer submissions into the review queue must create a `submitted` review event
- Staff approvals and rejections must create the corresponding review event
- Producer-originated review submissions may be written through an authorized server-side workflow even if direct user SQL policies stay staff-only

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
