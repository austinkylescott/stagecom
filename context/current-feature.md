# Current Feature: Visibility Policy Foundation v1

## Status

In Progress

## Goals

- Define a canonical visibility vocabulary that maps to current PRD-aligned behavior.
- Publish a maintained visibility matrix in `docs/` as the product and engineering reference.
- Standardize hidden-vs-forbidden response semantics for visibility-sensitive routes.
- Introduce shared server-side policy helpers so routes stop re-encoding visibility logic ad hoc.
- Add verification coverage for the main viewer-state permutations across core surfaces.

## Notes

- Source spec: `docs/specs/feature-spec-visibility-policy-foundation-v1.md`
- Source of truth docs for this feature: `docs/PRD.md`, `docs/data-model.md`, `docs/server-api-conventions.md`, `docs/visibility-policy.md`, and `docs/research/visibility-rules.md`.
- Canonical visibility scopes for this work are `public`, `authenticated`, `theater_only`, `relationship`, `oversight_only`, and `self_only`.
- Theater admin remains distinct from staff and manager in docs and helper naming even where current access is equivalent.
- Protected surfaces should standardize on `403` for unauthorized access; any hidden-vs-forbidden behavior must be documented per surface.
- Core route priorities are theater detail/review, review index, show detail/list, performers, and notification read/list routes.
- Helper design should stay surface-specific and composable rather than collapsing into one generic policy gate.
- Verification should cover anonymous vs authenticated theater visibility, oversight-only review access, public vs non-public show access, performer profile visibility, performer affiliation filtering, self-only notifications, `npm run check:server-conventions`, narrow relevant tests, and `npm run build` before completion if shipped behavior changes.

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
