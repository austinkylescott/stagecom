# Current Feature

Design System Standardization v1

## Status

Complete

## Goals

- Extract reusable theater/dashboard presentation components from the theater detail page.
- Standardize shell button and dropdown primitives around the locked nav and account patterns.
- Expand Nuxt UI theming only where the pattern is truly shared.
- Publish a design-system bible and update AI workflow docs to prevent visual drift.

## Notes

- Locked anchors are the theater dashboard, navbar, account button, and shell dropdown behavior.
- Prefer Nuxt UI primitives, then app-level theme config, then component-level `:ui`, then inline Tailwind utilities.
- The homepage may inform palette and tone, but it is not the structural source of truth for authenticated surfaces.

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
