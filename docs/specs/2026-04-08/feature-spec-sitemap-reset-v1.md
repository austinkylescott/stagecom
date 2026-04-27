# Feature Spec: Sitemap Reset v1

## Status

In Progress

## Goal

Reset Stagecom around a smaller canonical sitemap that cleanly separates:

- public marketing routes
- authenticated app routes
- hybrid public/auth theater and event pages

This replaces the schedule-era route sprawl and makes theater-scoped public events the canonical event model.

## Canonical Routes

Public:

- `/`
- `/login`
- `/signup`
- `/confirm`

Authenticated app:

- `/callsheet`
- `/profile`
- `/notifications`
- `/theater/new`
- `/event/new`
- `/theater/[slug]/admin`

Hybrid public/auth:

- `/theater/[slug]`
- `/theater/[theaterSlug]/event/[eventSlug]`

## Product Expectations

### Callsheet

- `/callsheet` is the authenticated home.
- It shows the user everything they are attached to: shows, practices, workshops, meetings, and invitations.
- It includes the forward-looking calendar experience that used to live on `/schedule`.

### Theater page

- `/theater/[slug]` is the canonical theater homepage.
- It serves both anonymous and signed-in visitors.
- It should show theater identity, announcements, upcoming public programming, and the full calendar lower on the page.

### Theater admin

- `/theater/[slug]/admin` is the only theater operations home.
- It absorbs review/queue/settings/member-management functions that were previously spread across separate routes.

### Event page

- `/theater/[theaterSlug]/event/[eventSlug]` is the only canonical event detail route.
- Event slugs are unique within a theater, not globally.
- Anonymous visitors see a public event/marketing page.
- Associated users see the working event page, including chat and role-specific context.
- Producers and theater admins get inline management controls on the same page instead of separate edit/program child routes.

### Event creation

- `/event/new` is the canonical creation route.
- Creation begins with theater selection.
- The event remains theater-owned in permissions/data, even though creation starts from a global route.

## Layout Model

Use explicit layouts rather than path-regex protection:

- `default` for public marketing/auth pages
- `app` for authenticated-only routes
- `hybrid` for canonical theater and event pages that work for both signed-out and signed-in users

Auth protection should use named middleware on the page, not a global path matcher.

## Canonical Removals

Delete or stop linking to:

- `/schedule`
- `/shows`
- `/review`
- `/performers`
- `/theaters`
- `/theaters/browse`
- `/theaters/[slug]/calendar`
- `/theaters/[slug]/review`
- `/theaters/[slug]/shows/new`
- `/events/[id]`
- `/events/[id]/edit`
- `/events/[id]/program`

## Data Model Changes

- Add `shows.slug`
- Enforce uniqueness on `(theater_id, slug)`
- Use `(theater.slug, shows.slug)` to resolve canonical public event pages

## Navigation

Authenticated shell primary nav:

- `Callsheet`
- `<home theater>`
- `Profile`

Secondary utilities:

- `Notifications`
- context-sensitive `Theater admin`
- `New Production` / event creation action when authorized

Desktop uses a sidebar.
Mobile uses a bottom bar with overflow for secondary tools.

## Documentation Impact

Update:

- `context/current-feature.md`
- `docs/data/data-model.md`
- `docs/design/app-design-bible.md`

## Verification

- `npm run check:server-conventions`
- `npm run build`
