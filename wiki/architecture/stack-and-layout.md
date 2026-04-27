# Stack And Layout

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/development/coding-rules.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI v4
- Supabase
- Vitest
- Zod for server validation

## Project Layout

- `project/app/` for frontend code because `srcDir` is `app`
- `project/server/api/` for route handlers
- `project/server/utils/` for shared server helpers
- `project/app/composables/` and `project/app/queries/` for client data access

## Product Layout Modes

- `default` for public/auth routes
- `app` for authenticated operations routes
- `hybrid` for public/member theater and event pages

The later redesign sources treat explicit layout ownership as important and reject regex-style path inference.

## Related
- [[wiki/architecture/route-model]]
- [[wiki/design/page-archetypes]]
- [[wiki/decisions/nuxt-ui-v4-only]]
