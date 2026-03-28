# Current Feature: Show Lifecycle v1

## Status

In Progress

## Goals

- Define the show creation flow so authenticated users can create shows and creators become producers without being automatically cast.
- Implement the review lifecycle with draft, pending review, approved, rejected, and cancelled states, with unapproved shows kept out of public visibility.
- Support show event types and use them to shape scheduling and visibility context.
- Support casting modes for invite-only, theater community casting, and public casting, while preserving direct invites in all modes.
- Support cast size as either an exact size or a range, show confirmed count against that target, and allow producer-side cast finalization without hard-blocking overages in v1.
- Support performer assignment flows for invites, requests, acceptance, decline, and withdrawal.
- Keep the program view read-only, mobile-friendly, ordered by `program_order`, and limited to accepted performers only.
- Ensure assignment changes trigger notifications through the documented notification flow.

## Notes

- Source spec: `docs/specs/feature-spec-show-lifecycle-v1.md`
- This is the first complete vertical slice for the show lifecycle.
- Producers are never assumed to be performers.
- Cast membership requires an explicit `show_cast` entry.
- Only accepted performers appear in the program view.
- Casting warnings for exceeding max cast size should not hard-block in v1.
- Live occurrence management and schedule-change notifications are deferred until occurrence editing is implemented.

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
