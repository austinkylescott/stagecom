# Surface Map

**Status:** current
**Last updated:** 2026-04-27
**Sources:** [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]]

The 2026-04-12 surface map is the strongest current page-architecture authority.

## Kept First-Class Surfaces

- `/callsheet`
  - mode: authenticated
  - layout: `app`
  - archetype: `workspace`
  - job: user's schedule-first operational home
  - required regions: shell header, date controls, filters, schedule views, detail navigation
- `/notifications`
  - mode: authenticated
  - layout: `app`
  - archetype: `inbox_list`
  - job: operational inbox with read-state management
  - required regions: heading, filter tabs, notification rows, empty state, read-state actions
- `/profile`
  - mode: authenticated
  - layout: `app`
  - archetype: `account_settings`
  - job: identity and membership-facing account management
  - required regions: profile summary, editable fields, notices, related membership context
- `/theaters`
  - mode: authenticated
  - layout: `app`
  - archetype: `entity_operations`
  - job: theater discovery plus theater-creation entry
  - required regions: collection view, discovery states, create CTA or inline creation path
- `/{theaterSlug}`
  - mode: hybrid
  - layout: `hybrid`
  - archetype: `entity_overview`
  - job: canonical theater overview for visitors, members, and admins
  - required regions: theater identity, relationship state, upcoming programming, listing/calendar modules, role-aware actions
- `/{theaterSlug}/admin`
  - mode: authenticated
  - layout: `app`
  - archetype: `entity_operations`
  - job: theater operations home
  - required regions: admin summary, review queue, settings/actions, member/admin tools
- `/{theaterSlug}/new`
  - mode: authenticated
  - layout: `app`
  - archetype: `entity_operations`
  - job: theater-scoped event creation
  - required regions: theater context, event builder, validation states, submit flow
- `/{theaterSlug}/{eventSlug}`
  - mode: hybrid
  - layout: `hybrid`
  - archetype: `entity_overview`
  - job: canonical public-plus-working event page
  - required regions: event identity, schedule, producers/cast, public description, role-aware operations

## Support Surfaces

- `/`
  - mode: public
  - layout: `default`
  - archetype: `marketing_auth`
- `/login`
  - mode: public
  - layout: `default`
  - archetype: `marketing_auth`
- `/signup`
  - mode: public
  - layout: `default`
  - archetype: `marketing_auth`
- `/confirm`
  - mode: public
  - layout: `default`
  - archetype: `marketing_auth`

## Internal Surface

- `/dev/components`
  - mode: internal
  - archetype: `internal_reference`
  - job: permanent implementation reference for tokens, primitives, composites, and page-pattern demos

## Canonical Jobs

- Callsheet: authenticated schedule/work home
- Theater overview: hybrid public/member theater page
- Theater admin: theater operations home
- Event overview: one canonical public-plus-working event page
- Theaters: collection/discovery/create entry

> ⚠️ Conflict: [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]] uses `/theater/...` paths and a global `/event/new`, while the 2026-04-12 surface map uses flatter `/{theaterSlug}` and theater-scoped creation `/{theaterSlug}/new`.

## Related
- [[wiki/architecture/route-model]]
- [[wiki/design/page-archetypes]]
- [[wiki/features/schedule-and-callsheet]]
