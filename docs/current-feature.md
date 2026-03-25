# Current Feature

Mock Data Workflow

## Status

In Progress

## Goals

- Add a deterministic mock-data framework for local/dev databases.
- Support generating mock SQL from a config of real Supabase auth user IDs.
- Support seeding mock data, wiping the dev schema, and rebuilding from scratch with one command path.
- Keep the workflow aligned with the current SQL-first schema and Stagecom role invariants.
- Audit the live Supabase schema before baking in a local/dev workflow.
- Start moving from docs-only SQL toward a Supabase CLI-backed project structure.
- Support creating or syncing mock auth users through the Supabase Admin API so app-data seeding no longer depends on manual user UUID lookup.

## Notes

- This change maps to the MVP need for producers, performers, theater staff, review states, casting modes, and notifications to be testable in realistic combinations.
- The generator never treats producers as cast automatically; mock cast membership still requires explicit `show_cast` entries.
- The config requires real auth user IDs because app tables still reference `auth.users`.
- The current example scenario includes approved, pending-review, and draft events plus notification/email rows.
- Live schema audit now confirms the deployed public tables/enums/functions match the repo baseline after accounting for `public.is_active_member_of_theater`.
- The repo now supports split DB env vars and a Node-based SQL runner so dev scripts do not depend on URL-encoded passwords or a local `psql` install.
- Mock auth seeding now writes a resolved config with real auth user IDs before seeding app tables.

## History

- Project setup and boilerplate cleanup
- Casting requests for theater and public casting shows
- Show detail navigation from show listings with producer-only admin gating on the detail flow
- Expanded show cast workflow with request approval, reinvite handling, producer display, and notification fixes
- Updated Nuxt UI select props to restore dropdown option rendering
- Added deterministic mock-data generation, seed, reset, and rebuild workflow for local/dev databases
- Added split DB env support, live schema audit tooling, and a baseline Supabase CLI schema scaffold
- Added Supabase Admin API-based mock auth seeding and full seed/rebuild wrappers
