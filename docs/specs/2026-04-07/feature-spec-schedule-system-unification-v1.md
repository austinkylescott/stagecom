# Feature Spec: Schedule System Unification v1

Derived from PRD v0.2 (Locked)

## Summary

Rebuild schedule around two related surfaces:

- `/schedule` is the signed-in user's schedule home and first post-login schedule destination.
- `/theaters/[slug]` is the theater-specific schedule home and shows what is happening at that theater.

The two pages should share calendar, agenda, filter, and date-state primitives, but they must remain scoped differently:

- user schedule answers: "What events matter to me?"
- theater schedule answers: "What is happening at this theater?"

This feature keeps Stagecom's contextual role model intact. Producers are not assumed to be cast, and cast membership remains explicit.

## Goals

- Make `/schedule` the canonical user schedule page.
- Rebuild `project/app/pages/theaters/[slug]/index.vue` to use the same schedule system while staying theater-scoped.
- Extract shared schedule composables and components only where they reduce duplication and are ready for reuse.
- Keep mobile-sized screens first-class.
- Align route, API, schema, docs, mock data, and Supabase state where data expectations change.

## Non-Goals

- Do not add ticketing, payroll, broad social, or other out-of-scope product areas.
- Do not infer cast membership from producer status.
- Do not make theater pages default to the viewer's personal commitments.
- Do not rename the backend API route unless implementation proves it is necessary.
- Do not delete existing routes without a compatibility redirect or explicit clarification.

## Product Direction

### `/schedule`

Primary role:
User schedule home.

Default scope:
`personal`.

The page should answer:

- What shows am I in?
- What events am I producing?
- What non-show events am I explicitly assigned to?
- What else is happening across my home or joined theaters if I intentionally broaden the filter?

Required scope filters:

- `personal`: explicit producer, cast, or show-staff relationships
- `home`: visible events at active home theaters
- `joined`: visible events across active joined theaters

The default must be `personal` so the page starts from "what is mine" rather than "everything I can see."

### `/theaters/[slug]`

Primary role:
Theater schedule home.

The page should answer:

- What is coming up at this theater?
- What shows and non-show events are scheduled?
- What is the next programming item?
- What does the theater calendar look like at a glance?

The page should not default to personal-only filtering. If personal relationship badges appear, they are annotations, not the page's core filter.

### Compatibility Routes

- Keep `/shows` as a compatibility redirect or thin alias to `/schedule`.
- Keep `/theaters/[slug]/calendar` as a compatibility redirect or thin alias to `/theaters/[slug]`.
- Update navigation and internal links to use canonical routes.

## UX Direction

Use one recognizable schedule system across user and theater pages:

- top summary / next-up area
- mobile week strip
- filter bar with mobile-collapsible controls
- compact month calendar
- selected-day detail
- chronological agenda
- explicit empty states

Use the current calendar system as the interaction baseline. Remove the gridded and dotted backgrounds from these schedule surfaces.

Visual tone:

- event/yellow is dominant for schedules, calendars, show/event rows, and event markers
- theater identity details remain theater-flavored on theater pages
- performer/red is reserved for personal relationship chips and user-homebase accents
- use token-backed surfaces such as event, performer, theater, and paper; avoid one-off raw color strings where semantic tokens already exist

Mobile expectations:

- stack summary, week strip, filters, selected-day list, and agenda in a deliberate order
- keep controls reachable without horizontal overflow
- do not provide desktop-only navigation that has no mobile equivalent
- preserve selected-date context in empty states

## Shared Frontend Architecture

Extract shared logic and components after identifying stable boundaries from the current pages.

Recommended composable extraction:

- date parsing and formatting helpers
- month and week jumps
- selected date and selected calendar date
- route query normalization and syncing
- items grouped by ISO date
- selected-day items
- agenda sorting
- calendar marker summaries

Recommended component extraction:

- `ScheduleHero`
- `ScheduleFilterBar`
- `ScheduleWeekStrip`
- `ScheduleCalendarCard`
- `ScheduleAgendaCard`
- `ScheduleEventRow`

Use Nuxt UI primitives where they fit:

- `UCard`
- `UCalendar`
- `UButton`
- `USelect`
- `UFormField`
- `UBadge`

Use Stage primitives where they fit:

- `StageButton`
- `StageSection`
- `StageSectionHeader`

Add new component-library pieces only when they are clearly reusable by both `/schedule` and `/theaters/[slug]`. Keep page-only composition in the page.

## API And Data Requirements

### User Schedule Endpoint

Keep the route:

- `GET /api/shows/schedule`

Add query param:

- `scope=personal|home|joined`

Existing query params remain:

- `month=YYYY-MM`
- `theater=<slug>`
- `type=<event_type>`
- `status=<show_status>`
- `timeline=all|upcoming|past`

Default scope:

- `personal`

Scope behavior:

- `personal`: only shows/events where the viewer has an explicit producer, cast, or show-staff relationship
- `home`: visible events at active memberships where `is_home = true`
- `joined`: visible events across active joined theaters

Response items should stay lean and occurrence-aware:

- `occurrenceId`
- `startsAt`
- `endsAt`
- `occurrenceStatus`
- `viewerRelationships`
- `show.id`
- `show.title`
- `show.status`
- `show.eventType`
- `show.theaterId`
- `show.theaterName`
- `show.theaterSlug`

`viewerRelationships` should include relationship labels such as:

- `producer`
- `cast`
- `show_staff`
- `theater_member`
- `home_theater`

Do not return full cast, producer, or staff lists from this endpoint. Those belong on event detail pages.

### Theater Schedule Endpoint

Keep the route:

- `GET /api/theaters/:slug/schedule`

Theater schedule should remain theater-scoped and use the same occurrence item shape where practical.

Fix visibility gaps:

- explicit show-staff users should be considered in theater schedule visibility where appropriate
- do not hardcode `isShowStaff: false` when the user has a show staff assignment

### Server Read Model

Extract a shared server schedule read-model helper if it keeps authorization clear and avoids duplicating query logic between user and theater schedule routes.

The helper must:

- keep service-role queries scoped to authorized candidate rows
- preserve route-level authorization and visibility checks
- validate query params at the boundary
- avoid returning private fields that the UI does not need

## Endpoint Cleanup

The current `/api/shows/schedule` endpoint is lean in response shape, but it should be tightened:

- remove the redundant second `show_staff_assignments` fetch
- deduplicate related show IDs before building show filters
- include relationship metadata so the UI can explain why items appear
- keep month and timeline occurrence scoping server-side
- preserve visibility checks through `canViewShow`

## Schema, Docs, And Supabase

Live Supabase already has the required core tables and fields for this feature:

- `show_occurrences`
- `show_roles`
- `show_cast`
- `show_staff_assignments`
- `theater_memberships.is_home`
- `theater_memberships.home_rank`

Add a migration only for confirmed schema or performance needs.

Known candidate migration:

- add `idx_show_roles_user` on `show_roles(user_id)` because the user schedule endpoint queries show roles by user

If a migration is added:

- add it under `project/supabase/migrations/`
- update `docs/sql/001-init.sql` when it changes baseline schema expectations
- update `docs/data/data-model.md` if table, relationship, or DB-backed product expectations change
- update `docs/data/mock-data-workflow.md`, `project/mock-data.config.example.json`, local `project/mock-data.config.json`, and scripts under `project/scripts/` only if seeded workflow expectations change
- apply it to local Supabase
- apply the same migration to remote Supabase through MCP
- regenerate TypeScript database types if table shapes change

For an index-only migration, generated database types should not change.

## Documentation Updates

Update docs to reflect:

- `/schedule` as the canonical user schedule page
- `/shows` as compatibility-only
- `/theaters/[slug]` as the theater schedule home
- `/theaters/[slug]/calendar` as compatibility-only if retained
- user schedule scopes and default `personal` behavior
- endpoint response shape including `viewerRelationships`

Relevant docs include:

- `docs/data/data-model.md` if DB-backed expectations change
- `docs/data/mock-data-workflow.md` if seeded workflow expectations change
- current dated feature spec files that mention `/shows` as the schedule route
- design docs only if reusable schedule components become part of the design system vocabulary

## Acceptance Criteria

- `/schedule` loads as the canonical user schedule page.
- `/schedule` defaults to `personal` scope.
- `/schedule` supports `personal`, `home`, and `joined` scopes.
- `/shows` remains usable through a redirect or thin alias.
- `/theaters/[slug]` presents a theater-scoped schedule page using the shared schedule system.
- `/theaters/[slug]/calendar` remains usable through a redirect or thin alias.
- Both schedule pages work on mobile-sized screens without overflow or missing controls.
- Calendar, selected-day detail, week navigation, filters, and agenda share standardized logic/components where appropriate.
- The pages no longer rely on dotted or gridded board backgrounds.
- Schedule rows explain viewer relationships where available.
- Explicit show-staff relationships are respected by schedule visibility.
- Required docs and Supabase schema state are updated when data expectations change.

## Test Plan

Run from `project/`:

```bash
npm run check:server-conventions
npm run build
```

Run targeted Vitest coverage for schedule routes, including:

- `scope=personal`
- `scope=home`
- `scope=joined`
- show-staff-only visibility
- theater schedule show-staff visibility
- month and timeline occurrence scoping
- filter interactions

Manual verification:

- `/schedule` desktop
- `/schedule` mobile
- `/shows` compatibility route
- `/theaters/[slug]` desktop
- `/theaters/[slug]` mobile
- `/theaters/[slug]/calendar` compatibility route
- calendar marker behavior
- selected-day empty states
- event detail links

Because this changes shipped application behavior and route structure, `npm run build` is required before completion.
