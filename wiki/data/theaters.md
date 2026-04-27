# Theaters

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]]

`theaters` is the core venue/community entity.

## Key Fields

- `id`, `name`, `slug`
- `tagline`
- `timezone`
- address fields
- `website_url`, `logo_url`
- `upcoming_shows_limit`
- `upcoming_other_events_limit`

## Stable Rules

- Theater creation requires a real public identity, not just a name.
- Theater board limits are theater-level settings and should shape server fetch size directly.
- Theater pages are intended to be public-facing identity and programming surfaces.

## Board Rendering Rules

- The first show in the theater show slice feeds the dashboard/next-up slot.
- The first non-show event in the other-events slice feeds the dashboard/next-up slot.
- Remaining items from those same slices feed lower board sections.
- Clients should not over-fetch items the board cannot render.

## Product Implication

Theater identity is not just metadata. It is part of trust, public discovery, and the theater-owned programming board.

## Related
- [[wiki/data/theater-memberships]]
- [[wiki/features/theater-creation-and-membership]]
- [[wiki/features/schedule-and-callsheet]]
