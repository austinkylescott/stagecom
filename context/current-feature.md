# Current Feature: Shows Dashboard Refresh + Semantic Color Pass v1

## Status

In Progress

## Goals

- Refresh the member-facing `Shows` page into a compact operational dashboard.
- Replace the custom month grid with a compact Nuxt UI calendar that supports month navigation and event markers.
- Add a selected-day detail panel that updates from calendar selection and preserves explicit empty states.
- Add a chronological agenda panel with `all`, `upcoming`, and `past` timeline scopes.
- Add shared `theater`, `event type`, and `show status` filters that update all dashboard surfaces and sync to the URL.
- Use a dedicated occurrence-aware schedule read model and `GET /api/shows/schedule` payload for the page instead of the existing one-row-per-show response.
- Keep the page aligned with the Stagecom brutalist dashboard styling without changing role philosophy, approvals, casting rules, or schema.
- Apply the semantic accent pass across the active UI work so theater uses blue, dated event/show surfaces use yellow, and performer/cast surfaces use red.
- Update the navbar so semantic link accents and active states reflect theater/event/performer categories while preserving the notification bell panel entry point.

## Notes

- Spec drafted in `docs/specs/feature-spec-shows-dashboard-refresh-v1.md`.
- Primary product scope is the member `Shows` page refresh, plus the related semantic color/nav pass that was intentionally kept in this branch.
- No schema changes are planned in this pass.
- This is a presentation and usability upgrade for existing show and event information.
- The page should combine a compact month calendar, selected-day detail surface, and broader chronological agenda.
- Filter state should preserve the selected month, keep the selected date when possible, and show an empty selected-date state if filters remove that date's items.
- Default selected date should be today for the current month, otherwise the first day of the visible month.
- Calendar selection is for inspection only; agenda and selected-day rows should navigate to the show detail page.
- The schedule endpoint should return occurrence-aware items plus available filter options while following existing member visibility rules.
- Related UI work in this branch intentionally includes shared theme-token updates, homepage/theater/show semantic recoloring, and navbar accent cleanup.

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
