# Current Feature: Auth Security Hardening v1

## Status

In Progress

## Goals

- Enforce privacy by default for theater, show, cast, and performer data
- Prevent authenticated users from granting themselves theater membership through unrelated profile flows
- Ensure unpublished show data is only available to authorized viewers
- Reduce trust in route-only checks by defining repo-visible Supabase RLS and policy behavior
- Add verification coverage for the highest-risk auth and privacy regressions

## Notes

- Source of truth: `docs/PRD.md`, `docs/data-model.md`, `docs/server-api-conventions.md`, `docs/events-and-notifications.md`, and `project/supabase/migrations/*`
- Scope includes four audit gaps: home-theater membership escalation, non-public show detail exposure, performer affiliation leakage, and missing repo-visible RLS/policy definitions
- Membership changes must only happen through explicit membership flows or theater staff actions
- Setting or clearing a home theater must never create, reactivate, or upgrade theater membership
- Non-public shows must only be visible to authorized relationships such as producers, active theater staff, and explicitly allowed cast viewers
- Performer directory affiliation data must be at least as private as profile visibility and must not reveal unrelated theater memberships
- Public theater pages must not expose internal review or non-public show counts to unauthorized viewers
- Implementation plan: add RLS/policy migration, remove home-theater side effects, harden show detail auth, tighten performer affiliation exposure, restrict theater stats, update docs, then add tests and run verification
- Open questions to resolve during implementation: whether staff should see full cast state for all theater shows, whether unauthorized show-detail reads should prefer `404` over `403`, and whether `memberCount` is public-facing

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
