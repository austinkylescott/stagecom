# Stack And Layout

**Status:** current
**Last updated:** 2026-04-30
**Sources:** [[raw/development/coding-rules.md]], [[raw/development/ai-interaction.md]], [[raw/data/mock-data-workflow.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

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

## Environment Workflow

- The shared remote Supabase project is the canonical dev database.
- `project/supabase/migrations/` is the schema source of truth for both remote and local environments.
- `project/.env` is the active generated env file used by the app and DB scripts.
- `project/.env.remote` and `project/.env.local` are switchable env profiles.
- Use `npm run env:use:remote` and `npm run env:use:local` instead of hand-editing `project/.env`.
- Use `npm run env:status` to verify the active app target, DB target, and whether they match.
- Use `npm run env:doctor` when you need an actual Supabase API and direct Postgres auth check for the active profile.

## Product Layout Modes

- `default` for public/auth routes
- `app` for authenticated operations routes
- `hybrid` for public/member theater and event pages

The later redesign sources treat explicit layout ownership as important and reject regex-style path inference.

## Related
- [[wiki/architecture/route-model]]
- [[wiki/design/page-archetypes]]
- [[wiki/decisions/nuxt-ui-v4-only]]
