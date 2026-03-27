# Current Feature

Show Cast Panel Cleanup

## Status

In Progress

## Goals

- Reduce the size and responsibility count of `project/app/components/ShowCastPanel.vue`.
- Extract cast-display logic into smaller presentational components without changing cast behavior.
- Extract performer search and invite state into a composable or focused child component.
- Preserve the current producer, request, invite, and inactive-cast flows exactly as they work today.
- Keep this as a refactor-only change with no API, schema, or notification behavior changes.

## Notes

- This came out of the latest code scan as the clearest low-risk quick win.
- The target is maintainability only: fewer coupled refs/computed values in one file and easier follow-up changes to cast UI.
- Do not change request permissions, invitation rules, or server interactions as part of this feature.
- If extracted pieces need shared state, prefer a composable over passing many reactive props through multiple layers.

## History

- Project setup and boilerplate cleanup
- Casting requests for theater and public casting shows
- Show detail navigation from show listings with producer-only admin gating on the detail flow
- Expanded show cast workflow with request approval, reinvite handling, producer display, and notification fixes
- Updated Nuxt UI select props to restore dropdown option rendering
- Added deterministic mock-data generation, seed, reset, and rebuild workflow for local/dev databases
- Added split DB env support, live schema audit tooling, and a baseline Supabase CLI schema scaffold
- Added Supabase Admin API-based mock auth seeding and full seed/rebuild wrappers
