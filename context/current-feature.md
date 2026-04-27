# Current Feature: Design Reset Program v1

## Status

In Progress

## Goals

- Replace the schedule-era sitemap with a smaller canonical route set.
- Replace the current authenticated design authority with a new sitemap, design-reset spec, and component-system spec.
- Define the canonical route inventory, page purposes, and page archetypes for every current page.
- Shift the route model toward collection-style theater discovery and flatter canonical theater/event URLs.
- Produce a Google Stitch prompt and translation matrix that can drive a full app redesign.
- Refine the Stitch prompt so it strongly encodes the intended aesthetic, semantic palette, and system-level design direction.
- Lock the redesign font direction to Cubano for display and Public Sans for body, even if Stitch must approximate them.
- Add a v3 Stitch prompt that explicitly corrects traditional-theater language, black-heavy design bias, and invented navigation.
- Define `/dev/components` as a concrete system-reference spec, not just a general expectation.
- Define the `/dev/components` page outline and fixture strategy so implementation can rebuild it deliberately.
- Update design and coding guidance so the current Stage wrapper system is no longer treated as locked.
- Keep `/dev/components` as a permanent design-system overview and demo surface with deterministic sample data.
- Keep the product aligned to the PRD while preparing for a big-bang frontend rebuild.

## Notes

- Canonical specs live under `docs/specs/2026-04-12/`.
- Consult `wiki/` first for project context, then use `docs/` for raw verification and source updates.
- If this feature changes durable product, data, architecture, feature, or design knowledge, update the corresponding pages in `wiki/` before marking the feature complete.
- This phase is design-first: docs, route architecture, prompt artifacts, and implementation guardrails.
- The current Stage components and current authenticated surfaces are context, not locked references.
- Keep current route reality visible in the spec package, including `/dev/components` as an internal surface to classify.
- Current sitemap direction: `/theaters` is the collection/discovery entry, `/{theaterSlug}` is the canonical theater page, and `/{theaterSlug}/{eventSlug}` is the canonical public event page.
- `/dev/components` should expose the full implemented design system with durable sample states, not ephemeral date-dependent demos.
- Preserve PRD role invariants while redefining page structure and system ownership.
- Frontend rebuild comes after the new design authority and sitemap are locked.

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
