# Current Feature: Performers Page UI Pass

## Status

In Progress

## Goals

- Replace the current full-card performer presentation with a more compact card layout informed by the producer pill visual language.
- Keep this as a visual-only pass with no behavior, grouping, or data-model changes.
- Preserve clear performer scanning with avatar, display name, and shared-theaters context.
- Preserve the existing performer actions in a more compact always-visible treatment.
- Reduce page scroll and improve information density on desktop and mobile.

## Notes

- Preferred direction is a compact card rather than a pure pill so the performer actions fit more naturally.
- The visual language should borrow from the producer pill treatment without copying it too literally.
- Theater grouping and future troupe or team grouping are explicitly out of scope for this pass.
- The current actions remain present but intentionally disabled with clear "Feature coming soon" messaging until their flows are implemented.

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
