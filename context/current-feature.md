# Current Feature: Multi-Home Theater Hub And Calendar v1

## Status

In Progress

## Goals

- Replace the single-home theater assumption with a multi-home model tied to active theater memberships.
- Make `/theaters` a personalized hub that shows one compact dashboard module per home theater and no longer depends on browse-directory payloads by default.
- Keep `/theaters/[slug]` as the primary theater-specific board with sections for the dashboard, upcoming shows, and upcoming public non-show events.
- Make `/theaters/[slug]/calendar` the theater-wide calendar surface with compact month navigation, day selection, and date-specific event rows.
- Preserve explicit theater relationship and permission rules while reducing unnecessary fetch cost through section-specific, occurrence-aware queries.
- Keep browse/discovery on `/theaters/browse` and optimize browse query patterns separately from the personalized hub.

## Notes

- This spec is sourced from `docs/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md`.
- Recommended data-model direction is to move home-theater preference onto `theater_memberships` via fields such as `is_home` and optional `home_rank`, with migration from `profiles.home_theater_id`.
- Home-theater status must never create, reactivate, or upgrade membership; leaving a theater must automatically clear home status.
- Add a dedicated hub endpoint for `/theaters`, keep `/api/theaters` for browse/discovery, and shape theater/calendar payloads around actual rendered sections.
- Theater boards should support theater-level admin settings for how many upcoming shows and upcoming non-show events are displayed; the first item in each slice feeds the dashboard and the remainder feeds the lower sections.
- Preserve the locked authenticated design language and semantic colors: theater surfaces use `--stage-theater`, programming/event surfaces use `--stage-event`, and people/relationship surfaces use `--stage-performer`.
- Significant implementation areas will require coordinated updates across app routes/components, server contracts, data-model docs, generated DB types, and mock-data workflow/config when seeded assumptions change.

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
