# Route Model

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-04-07/feature-spec-schedule-system-unification-v1.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

The route model is one of the main unresolved conflicts in the seeded source set.

## Stable Direction

Across all late specs, the system is converging toward:

- one authenticated home/workspace
- one canonical theater overview route
- one canonical event route
- one theater-admin route
- one internal design-system reference route

## Conflicting Canonical Paths

### Older/product-data path model

- `/theater/[slug]`
- `/theater/[theaterSlug]/event/[eventSlug]`
- `/callsheet`
- `/event/new`
- `/theater/[slug]/admin`

This appears in [[raw/data/data-model.md]] and the 2026-04-08 sitemap reset.

### Later redesign path model

- `/theaters`
- `/{theaterSlug}`
- `/{theaterSlug}/{eventSlug}`
- `/{theaterSlug}/admin`
- `/{theaterSlug}/new`

This appears in the 2026-04-12 design reset, sitemap, and component specs.

> ⚠️ Conflict: The 2026-04-12 redesign bundle is later and currently the strongest design authority, but the data model and 2026-04-08 sitemap reset still document the `/theater/...` pattern. The wiki should treat the flatter route model as the latest design direction, not a fully reconciled platform decision.

## Schedule Route Evolution

- 2026-03-30 and 2026-04-07 make `/schedule` the canonical user schedule page, with `/shows` as compatibility.
- 2026-04-08 resets the authenticated home to `/callsheet` and removes `/schedule` from the canonical sitemap.
- 2026-04-12 cements `/callsheet` as the authenticated home in the new surface map.

## Related
- [[wiki/features/schedule-and-callsheet]]
- [[wiki/design/surface-map]]
- [[wiki/decisions/lint-log]]
