# Schedule And Callsheet

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-03-30/feature-spec-shows-dashboard-refresh-v1.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]], [[raw/specs/2026-04-07/feature-spec-schedule-system-unification-v1.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

Schedule direction changed several times and is now anchored around `Callsheet`.

## Stable Concepts

- Schedule should be occurrence-first, not one-row-per-show.
- User schedule surfaces answer "what matters to me?"
- Theater schedule surfaces answer "what is happening here?"
- Relationship labels explain why an occurrence appears.

## Route Evolution

- 2026-03-30: member-facing schedule/dashboard refresh on `/shows`
- 2026-04-07: `/schedule` becomes canonical, `/shows` becomes compatibility
- 2026-04-08 and 2026-04-12: `/callsheet` becomes the authenticated home and absorbs the schedule-first experience

## Current Best Synthesis

- Callsheet is the current canonical user schedule/workspace surface.
- Theater overview pages should include theater-scoped calendar/programming views.
- Compatibility routes may exist during migration, but they are not long-term design authority.

## Data Shape

Schedule surfaces should use lean occurrence items with:

- occurrence timing/status
- show id/title/type/status
- theater identifiers
- viewer relationship labels

## Related
- [[wiki/architecture/route-model]]
- [[wiki/data/shows]]
- [[wiki/design/surface-map]]
