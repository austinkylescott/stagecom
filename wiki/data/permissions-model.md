# Permissions Model

**Status:** current
**Last updated:** 2026-04-30
**Sources:** [[raw/product/PRD.md]], [[raw/product/visibility-policy.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/research/visibility-rules.md]], [[raw/specs/2026-04-30/feature-spec-profile-visibility-model-v1.md]]

Stagecom permissions are contextual. Access depends on a combination of theater role, show relationship, cast state, visibility scope, and whether the viewer is the affected user.

## Canonical Visibility Vocabulary

- `public`
- `authenticated`
- `theater_only`
- `relationship`
- `oversight_only`
- `self_only`

## Core Access Rules

- Public approved/listed shows are broadly visible.
- Non-public shows require a qualifying relationship or theater oversight.
- Theater review surfaces are oversight-only.
- Notifications are self-only.
- Performer profile discoverability is controlled by `profiles.visibility`.
- Performer field and contact visibility are evaluated only after discoverability allows the profile to appear.
- Performer affiliation visibility is overlap-based, not globally public.

## Role Precedence

- `admin`, `manager`, and `staff` currently count as oversight.
- Producer is a contextual show role only.
- Cast access depends on explicit `show_cast` state.

## Enforcement Shape

- The 2026-03-27 hardening spec expects both route-level authorization and repo-visible RLS/policy definitions.
- The architecture intent is to avoid relying only on client behavior or broad service-role reads to hide private data.
- Current profile behavior is split:
  - row-level discoverability can be reinforced with RLS/policy constraints
  - field-level shaping still requires route/helper logic because multiple fields and contact visibilities live on one row

> ⚠️ Conflict: The maintained policy doc prefers `403` for protected visibility failures, while the research snapshot records current non-public show behavior as `404` to hide resource existence.

## Related
- [[wiki/features/visibility-policy]]
- [[wiki/architecture/server-api-patterns]]
- [[wiki/data/show-cast]]
