# Current Feature: Theater Dashboard Section Refinement v1

## Status

In Progress

## Goals

- Refine the top section of the theater page into a dedicated theater dashboard component.
- Preserve theater identity, metadata, relationship state, alerts, and actions across all breakpoints.
- Replace the current page-local first-section markup with a dedicated `TheaterDashboardSection` component.
- Replace the `Shows / Other Events / Next Date` stat boxes with `Up Next Event` and `Up Next Show` cards.
- Keep Theater Alerts on a dedicated row below theater metadata and actions at every breakpoint.
- Ensure the show card poster area preserves a `1080 / 1350` aspect ratio without distortion.
- Eliminate horizontal overflow on small screens so the page never requires sideways scrolling.

## Notes

- Spec: `docs/specs/2026-04-01/feature-spec-theater-dashboard-section-refinement-v1.md`
- Scope is limited to the first `StageSection` on `project/app/pages/theaters/[slug]/index.vue`.
- Keep the existing theater-owned color treatment and broader page visual language.
- Add a `UAvatar` placeholder aligned to the left of the theater title block.
- Preserve all currently visible theater metadata and actions, allowing action density to collapse at smaller breakpoints without losing access.
- Use Nuxt UI primitives and canonical Tailwind utilities, with `min-w-0` and single-column mobile defaults to prevent overflow.
- Browser verification should explicitly check the layout around `1440px`, `1024px`, and `425px`.

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
