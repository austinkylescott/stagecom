# Current Feature: Schedule System Unification v1

## Status

Not Started

## Goals

- Make `/schedule` the canonical signed-in user schedule page and keep `/shows` as a compatibility route.
- Default `/schedule` to personal events while supporting personal, home-theater, and all-joined-theaters schedule scopes.
- Rebuild `project/app/pages/theaters/[slug]/index.vue` as the theater-specific schedule home, closely matching the schedule page while staying theater-scoped.
- Keep `/theaters/[slug]/calendar` usable as a compatibility route or thin alias.
- Extract stable shared schedule composables and components for date state, URL query sync, calendars, week strips, filters, agendas, and event rows.
- Tighten the schedule endpoints so the user schedule returns lean occurrence data with viewer relationship metadata and the theater schedule respects explicit show-staff visibility.
- Remove dotted and gridded schedule-page backgrounds in favor of semantic event/paper/theater/performer surfaces.
- Keep mobile-sized screens first-class across user and theater schedule pages.
- Update schema, docs, mock-data expectations, and local/remote Supabase state if data expectations or indexes change.

## Notes

- Canonical spec: `docs/specs/2026-04-07/feature-spec-schedule-system-unification-v1.md`
- `/schedule` answers "What events matter to me?" and defaults to `scope=personal`.
- `/theaters/[slug]` answers "What is happening at this theater?" and should not default to personal-only filtering.
- Keep the API route `GET /api/shows/schedule`, adding `scope=personal|home|joined` rather than renaming the backend route.
- Preserve contextual role rules: producers are not assumed to be cast, and cast membership requires explicit `show_cast`.
- Live Supabase already has the required core tables for this feature, including `show_staff_assignments`, `show_occurrences`, and home-theater membership fields.
- Candidate migration: add `idx_show_roles_user` on `show_roles(user_id)` if implementation keeps user-role lookups by `user_id`.
- If a migration is added, update local migration files/docs and apply it to local and remote Supabase.
- Run `npm run check:server-conventions` and `npm run build` before completion.

## History

- Project setup and boilerplate cleanup
- Casting requests for theater and public casting shows
- Show detail navigation from show listings with producer-only admin gating on the detail flow
- Expanded show cast workflow with request approval, reinvite handling, producer display, and notification fixes
- Updated Nuxt UI select props to restore dropdown option rendering
- Added deterministic mock-data generation, seed, reset, and rebuild workflow for local/dev databases
- Added split DB env support, live schema audit tooling, and a baseline Supabase CLI schema scaffold
- Added Supabase Admin API-based mock auth seeding and full seed/rebuild wrappers
- Refactored the show cast panel into focused components and an invite-search composable
- Refreshed the Performers page with compact cards, producer-pill-inspired styling, and explicit coming-soon action states
- Hardened auth and authorization with explicit show access rules, tighter performer privacy, repo-visible RLS migrations, hosted Supabase policy updates, and auth-auditor guidance
- Added a shared visibility policy layer, route-level visibility enforcement, maintained visibility docs, and focused helper/route verification coverage
- Implemented show lifecycle v1 with member-scoped show creation, review transitions, collision-free program ordering, cast finalization controls, a read-only program view, and updated lifecycle/docs coverage
- Completed V0 Design Alignment v1 with the shared brutalist visual system, homepage redesign, refreshed theater/show/review surfaces, and supporting design references/spec artifacts
- Completed Shows Dashboard Refresh + Semantic Color Pass v1 with an occurrence-aware shows schedule API, compact month/day/agenda dashboard views, URL-synced filters, cache invalidation updates, and semantic theater/event/performer accent styling across the active UI surfaces
- Completed Authenticated Work Experience Refinement v1 with theater browse/home/admin/calendar surface separation, theater-board redesign, shared flat button-tone behavior, hydration fixes, and theater-local timezone handling
- Completed Theater Dashboard Section Refinement v1 with a dedicated theater dashboard component, mobile-first overflow fixes, relocated action controls, alert-row refinement, and new Up Next event/show summary cards
- Completed Design System Standardization v1 with shared Stage button/dropdown/header primitives, theater-page component extraction, expanded Nuxt UI theme configuration, and a new design-system bible plus subagent brief
- Completed Multi-Home Theater Hub And Calendar v1 with multi-home membership-backed hub data, a split theater meta/upcoming board flow, theater board admin limits, leaner query invalidation and caching, calendar/hub/theater detail surface updates, shared upcoming card/detail primitives, and synchronized schema/mock-data tooling
