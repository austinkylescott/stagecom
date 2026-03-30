# Current Feature: V0 Design Alignment v1 (Stagecom)

## Status

In Progress

## Goals

- Bring the frontend materially closer to the approved V0 reference direction.
- Establish a reusable visual system instead of page-by-page ad hoc styling.
- Emphasize casting, lineup clarity, theater management, and operational workflows.
- Preserve readability and approachability while applying the stronger brutalist design direction.
- Keep existing product behavior intact unless a specific UX adjustment is needed to better express current features.

## Notes

- This is a visual-system and product-surface redesign, not a product-model rewrite.
- Preserve the current app's functional structure and align implementation to the approved order:
- 1. Global theme and shell
- 2. Homepage rewrite
- 3. Theater discovery surfaces
- 4. Show detail restyle
- Source design inputs:
- `docs/design/google-stitch-site-brief.md`
- `docs/design/stagecom-v0-reference-desktop-full.png`
- `docs/design/stagecom-v0-reference-mobile-full.png`
- `docs/design/stagecom-v0-reference-structure.md`
- `docs/design/v0-gap-analysis.md`
- Primary implementation surfaces:
- `project/app/assets/css/main.css`
- `project/app/app.config.ts`
- `project/app/layouts/default.vue`
- `project/app/components/AppNav.vue`
- `project/app/pages/index.vue`
- `project/app/pages/theaters/index.vue`
- `project/app/components/HomeTheaterHero.vue`
- `project/app/components/TheaterCard.vue`
- `project/app/pages/theaters/[slug]/index.vue`
- `project/app/pages/shows/index.vue`
- `project/app/pages/theaters/[slug]/shows/[id].vue`
- `project/nuxt.config.ts`
- Non-goals: no PRD, role-model, data-model, backend, or schema changes.

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
