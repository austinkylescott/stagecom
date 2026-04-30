# Mock Data Workflow

This repo now has a deterministic mock-data workflow for local/dev databases.

## Why

- Keep Stagecom aligned with the existing SQL-first schema docs.
- Seed richer test scenarios than the old one-off demo SQL file.
- Make it easy to rebuild or wipe the dev database without hand-editing SQL.
- Keep dev/test data trustworthy as the product and schema evolve.

## Database Target Policy

- The shared remote Supabase project is the canonical dev database.
- `project/supabase/migrations/` is the schema source of truth for both remote and local.
- Local Supabase is optional and disposable. Use it for experiments only.
- Do not switch targets by hand-editing `project/.env`. Use the env profile scripts so the app target and direct DB target stay aligned.

Run commands from `project/`:

```bash
npm run env:status
npm run env:doctor
npm run env:use:remote
npm run env:use:local
npm run dev:remote
npm run dev:local
```

Profile files:

- `project/.env.remote` — shared remote dev profile
- `project/.env.local` — local Supabase profile
- `project/.env` — active generated env used by the app and scripts
- `project/.env.remote.example` and `project/.env.local.example` — tracked templates

## Maintenance Rule

Any change to database schema, enums, relationships, DB-backed product assumptions, or seeded workflow expectations must update the mock-data assets in the same change. At minimum, review and update as needed:

- `project/mock-data.config.example.json`
- local `project/mock-data.config.json` when using it for active dev work
- seed/auth scripts under `project/scripts/`
- this document

Mock data is part of the contract for testing the product. If the schema changes but the seeded scenarios do not, the seed becomes misleading and should be treated as stale until updated.

## Files

- `project/mock-data.config.example.json` — example config shape.
- `project/scripts/mock-data.mjs` — generates deterministic SQL from the config.
- `project/scripts/db-reset.sh` — drops and recreates the dev schema with `docs/sql/001-init.sql`.
- `project/scripts/db-seed-mock.sh` — generates mock SQL and applies it.
- `project/scripts/db-seed-mock-full.sh` — creates/syncs auth users, resolves real auth IDs, then seeds app data.
- `project/scripts/db-rebuild-mock.sh` — reset, then seed.
- `project/scripts/db-rebuild-mock-full.sh` — reset, create/sync auth users, then seed app data.
- `project/scripts/db-audit-live.mjs` — read-only audit of the live remote schema shape.
- `project/supabase/` — Supabase CLI project scaffold and baseline migration for local schema workflows.

## Required Inputs

The base config can include auth credentials under `users[].auth`. The auth seed script creates or syncs those users through the Supabase Admin API and writes a resolved config file with the real auth user IDs needed by the SQL generator.

For database access, prefer split connection env vars in `project/.env`:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`

`DATABASE_URL` is still supported as a fallback, but split vars are safer because they avoid URL-encoding issues when passwords contain reserved characters.

Typical workflow:

1. Copy `project/mock-data.config.example.json` to `project/mock-data.config.json`.
2. Adjust the mock users, auth emails/passwords, theaters, shows, and scenarios as needed.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `project/.env`.
4. Run the auth seed script to create or sync users and produce `project/mock-data.resolved.json`.
5. Seed app data from the resolved config.

## Home Theater Config Shape

The mock-data generator now supports multi-home theater state on memberships.

- Preferred shape: `users[].homeTheaters` as an ordered array of theater keys
- Legacy fallback: `users[].homeTheater` as a single theater key

Behavior:

- The first home theater in the array is also mirrored into `profiles.home_theater_id` as a compatibility pointer
- Membership rows now receive `is_home` and `home_rank` values based on the ordered home-theater list
- Home theater entries must still correspond to active theater memberships in the config; the seed does not invent membership implicitly

## Profile Visibility Shape

The mock-data generator supports optional field-level profile visibility through:

- `users[].fieldVisibility.displayName`
- `users[].fieldVisibility.handle`
- `users[].fieldVisibility.pronouns`
- `users[].fieldVisibility.city`
- `users[].fieldVisibility.bio`

`users[].visibility` is the profile discoverability setting.

If `fieldVisibility` is omitted, the generator reuses `users[].visibility` as the
default field visibility for seeded identity fields.

## Theater Board Settings Shape

The mock-data generator supports theater-level board display limits through optional theater fields:

- `theaters[].upcomingShowsLimit`
- `theaters[].upcomingOtherEventsLimit`

These values seed the total number of upcoming public shows and non-show public events the theater board will display, including the dashboard slot for each type.

## Theater Identity Shape

The mock-data generator treats the following theater fields as required because theater creation now requires a complete public identity:

- `theaters[].name`
- `theaters[].slug`
- `theaters[].tagline`
- `theaters[].timezone`
- `theaters[].street`
- `theaters[].city`
- `theaters[].stateRegion`
- `theaters[].postalCode`
- `theaters[].country`

It also supports richer optional profile fields:

- `theaters[].websiteUrl`
- `theaters[].logoUrl`

## Commands

Run commands from `project/`.

```bash
npm run mock-data:generate -- --config ./mock-data.config.json --out ./tmp/mock-data.sql
npm run db:audit:live
npm run auth:seed:mock -- --config ./mock-data.config.json --out ./mock-data.resolved.json
npm run db:seed:mock:full -- ./mock-data.config.json
npm run db:rebuild:mock:full -- ./mock-data.config.json
npm run db:seed:mock -- ./mock-data.config.json
npm run db:reset
npm run db:rebuild:mock -- ./mock-data.config.json
npm run supabase:start
npm run supabase:status
npm run supabase:stop
```

`db:trash` is an alias for `db:reset`.

## Behavior

- Non-user entity IDs are generated deterministically from config keys, so the same config produces the same theater/show/occurrence IDs every time.
- `db:reset` is destructive for the target database and is only safe for local/dev usage.
- `db:seed:mock` is idempotent for the seeded records because the generated SQL uses upserts where possible.
- `auth:seed:mock` creates missing auth users and updates existing ones by email using the Supabase Admin API.
- `db:seed:mock:full` is the simplest shared-dev command: it resolves auth users first, writes `mock-data.resolved.json`, then seeds app data with the real user IDs.
- `db:audit:live` is read-only and is the recommended first step before changing workflow files that assume the repo matches the remote database.
- The SQL runner no longer depends on `psql`; project scripts execute SQL through the repo’s Node Postgres client instead.

## Recommended Workflow

- Shared remote dev data: switch to the remote env profile first, use split DB env vars plus `SUPABASE_SERVICE_ROLE_KEY`, run `npm run db:audit:live`, then use `npm run db:seed:mock:full -- ./mock-data.config.json`.
- Local schema work: switch to the local env profile, then use the Supabase CLI scaffold under `project/supabase/` when Docker is available.
- Production: do not use `db:reset` or `db:rebuild:mock`.

## Current Seed Shape

The example config intentionally covers:

- Theater manager, staff, producer, and performer roles
- Multi-home membership-compatible theater pinning via membership-backed home state
- Theater-local timezone display scenarios via `theaters[].timezone`
- Theater public identity scenarios via required `tagline` and full address fields
- Theater board display-limit scenarios via `theaters[].upcomingShowsLimit` and `theaters[].upcomingOtherEventsLimit`
- Optional website/logo theater profile fields via `theaters[].websiteUrl` and `theaters[].logoUrl`
- Explicit cast membership separate from producer roles
- Optional richer show setup fields such as `summary`, `producerNote`, and `posterUrl`
- Theater-scoped event slugs via optional `shows[].slug` or generated title-based fallback
- Multi-occurrence show/event scheduling scenarios
- Optional show staff assignments for operations roles such as front of house, box office, bar, and tech
- Approved, pending review, and draft show states
- Show and practice event types
- Direct invite, theater casting, and public casting modes
- Notifications and email outbox rows

That gives a useful starting point for UI and server testing without changing the production domain model.
