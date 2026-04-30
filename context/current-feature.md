# Current Feature: Profile Visibility Model V1

## Status

In Progress

## Goals

- Rework `/profile` into a practical account settings surface with one editable form, explicit visibility controls, and actionable theater memberships.
- Split profile discoverability from field-level visibility so profile appearance rules are clear and granular.
- Make `profiles.visibility` the canonical profile discoverability setting with `theater_only` as the default.
- Fix the display-name save bug by aligning the form and server fallback chain with `useUserIdentity()`.
- Expand `/api/me/profile` to support `handle`, normalized `contactLinks`, and derived `shareableContacts`.
- Keep timezone compatibility in storage while removing it from the profile UI for this pass.
- Expand `/api/me/theater-hub` so home and non-home memberships share one summary shape that the profile page can act on directly.
- Add and sync the raw docs, wiki pages, and dated specs for the new profile behavior.

## Notes

- Reuse `profiles.handle`, `profiles.contact_links`, and the existing home-theater and membership flows where possible.
- Keep `profiles.visibility` as the discoverability control, not a derived summary of field visibility.
- Keep email derived from auth rather than storing a second profile email.
- Keep this pass focused on existing memberships only; do not add theater discovery to `/profile`.
- Update the wiki alongside the raw docs because profile and visibility behavior are durable product knowledge.

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
- Completed Sitemap Reset v1 with the smaller canonical route set, theater-scoped event URLs, retired plural/compatibility pages, and aligned route/layout foundations
- Design Reset Program v1
