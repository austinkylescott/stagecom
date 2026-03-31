# Current Feature: Authenticated Work Experience Refinement v1

## Status

In Progress

## Goals

- Decompose overloaded authenticated surfaces into clearer jobs.
- Separate theater discovery, member-facing home theater use, and oversight operations into clearer surfaces.
- Align page structure with real concern levels: general authenticated user, theater member, relationship-based participant, oversight user, and self-only surfaces.
- Use the visibility policy as a first-class UX organizing principle for modules, fields, and actions.
- Establish a unified dashboard language that is readable, durable, and reusable across authenticated surfaces.

## Notes

- Spec: `docs/specs/feature-spec-authenticated-work-experience-refinement-v1.md`
- Primary route direction:
  - `/theaters/[slug]` as the main home theater page for steady-state use
  - `/theaters/browse` as secondary discovery and context switching
  - `/theaters/[slug]/admin` as theater-wide oversight workspace
  - `/shows` as cross-theater work board
  - `/review` as cross-theater approvals queue
  - `/notifications` as self-only personal updates
- The theater detail page should be member-facing first, with readable operational modules instead of a dark identity hero.
- Oversight users should get a dedicated theater admin surface instead of forcing theater-wide controls into the default member page.
- Dashboard direction should favor readable cream/ink operational modules over dark hero-style wrappers for dense dashboard content.
- Preserve existing role, permission, cast, notification, and visibility-policy invariants while making the UI easier to organize by concern level.

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
