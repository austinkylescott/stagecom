# Feature Spec: Visibility Policy Foundation v1 (Stagecom)
Derived from PRD v0.2 (Locked)

---

## Summary
Define one shared visibility model for Stagecom so theater pages, show pages, performer discovery, review surfaces, and notifications all use the same policy vocabulary and response semantics.

This feature turns the research in `docs/research/visibility-rules.md` into the maintained policy layer in `docs/visibility-policy.md` so future visibility features can build on one shared source of truth instead of re-deciding the basics route by route.

---

## Goals
- Define a canonical visibility vocabulary that maps to current PRD-aligned behavior
- Publish a maintained visibility matrix in `docs/` as the product and engineering reference
- Standardize hidden-vs-forbidden response semantics for visibility-sensitive routes
- Introduce shared server-side policy helpers so routes stop re-encoding visibility logic ad hoc
- Add verification coverage for the main viewer-state permutations across core surfaces

---

## Non-Goals
- Introduce a follower graph, friend graph, or new social feature
- Redesign the theater role model
- Change notification product semantics
- Broaden access to any private or oversight-only surface
- Resolve every visibility edge case in one feature if it needs a separate product decision

---

## Source Of Truth
- `docs/PRD.md`
- `docs/data-model.md`
- `docs/server-api-conventions.md`
- `docs/visibility-policy.md`
- `docs/research/visibility-rules.md`
- `project/server/utils/permissions.ts`
- visibility-sensitive routes under `project/server/api/`

---

## Problem Statement
Visibility behavior is currently privacy-aligned in many places, but it is difficult to reason about and maintain because the rules are spread across:

- profile visibility settings
- theater membership state
- theater role classes
- producer relationship
- cast relationship state
- show listing state
- casting mode
- route-specific helper logic

This creates three practical problems:

1. Similar visibility questions are answered differently depending on the surface.
2. Future changes are likely to accidentally broaden one surface while intending to change another.
3. There is no single product-policy reference that engineering, product, and future feature specs can rely on.

---

## Product Rules

### Canonical Visibility Scopes
Every visibility-sensitive rule should map to one of these scopes:

- `public`: visible to anyone
- `authenticated`: visible to any signed-in user
- `theater_only`: visible to active members of the relevant theater
- `relationship`: visible to users with a direct relationship to the relevant show or entity, such as producer or explicit cast involvement
- `oversight_only`: visible to theater admins, managers, and staff for the relevant theater
- `self_only`: visible only to the affected user

These scopes are a policy vocabulary, not a replacement for contextual roles. A route may still need to evaluate theater role, cast status, or producer status to determine whether the viewer qualifies for a scope.

### Role Clarification
- `Theater admin` is a distinct theater role class from `manager` and `staff`.
- In the current product, theater admin, manager, and staff often share the same oversight visibility powers.
- The policy model should preserve that distinction in docs and helper naming even where the resulting access is currently identical.

### Response Semantics
- Protected surfaces should standardize on `403` when the viewer is not allowed to access or act on the resource.
- If an entire page or surface is off limits, the product should show an unauthorized state and may redirect the user to the most appropriate related surface for that viewer.
- The chosen response semantics must be documented per surface in the source-of-truth matrix.

### Surface Defaults
- Theater identity is `public`.
- Theater operations and review state are `oversight_only`, except self membership/home state which is `self_only`.
- Approved and publicly listed shows are `public`.
- Non-public shows are `relationship` with `oversight_only` override.
- Accepted cast visibility is public for public shows and relationship-based for non-public shows.
- Pending cast visibility is not assumed by this feature and must be defined by the dedicated cast-queue spec.
- Performer profile visibility remains user-controlled (`public`, `theater_only`, `private`) but should be expressed in the shared policy vocabulary.
- Theater affiliations are narrower than profile discoverability and default to shared-`theater_only` or self visibility.
- Notifications are `self_only`.

---

## Technical Plan

### 1. Publish A Source-Of-Truth Visibility Matrix
- Add or promote a maintained visibility matrix in `docs/` that covers:
  - content visibility
  - action visibility
  - unauthorized behavior
  - role precedence
  - relationship requirements
- Use viewer states that reflect the real product model:
  - anonymous
  - signed-in out-of-theater
  - in-theater member
  - theater admin
  - staff / manager
  - producer
  - accepted cast
  - invited pending cast
  - requested pending cast

### 2. Add Shared Visibility Policy Helpers
- Introduce shared server utilities for common visibility questions, for example:
  - `canViewTheaterOperations`
  - `canViewShow`
  - `canViewAcceptedCast`
  - `canViewPendingCast`
  - `canViewPerformerProfile`
  - `canViewPerformerAffiliations`
  - `shouldHideResourceExistence`
- Keep these helpers narrowly scoped and composable rather than building one monolithic policy function.
- Prefer helper names that reflect the surface being protected, not a vague generic permission bucket.

### 3. Align Route Boundaries To Shared Policy
- Update visibility-sensitive routes to call shared helpers instead of re-deriving policy inline.
- Prioritize routes that define the public contract for visibility:
  - `GET /api/theaters/:slug`
  - `GET /api/theaters/:slug/review`
  - `GET /api/review`
  - `GET /api/shows/:id`
  - `GET /api/shows`
  - `GET /api/performers`
  - notification read/list routes
- Preserve existing auth helper and validation conventions.

### 4. Document Response Semantics
- Update docs to explicitly state when the product hides resource existence versus returns an authorization error.
- Standardize protected surfaces on `403`, with unauthorized UI states and redirects handled at the product layer when appropriate.
- Avoid surface-specific surprises where similar protected resources behave differently without a documented reason.

### 5. Add Verification Coverage
- Add tests for the shared visibility helpers.
- Add focused route-level tests for the main visibility decisions.
- Minimum coverage should include:
  - anonymous vs authenticated theater visibility
  - oversight-only review access
  - public vs non-public show access
  - performer profile visibility by setting
  - performer affiliation filtering by relationship
  - self-only notifications
- Run `npm run check:server-conventions`.
- Run the narrowest relevant tests.
- Run `npm run build` before completion if shipped behavior changes.

---

## Implementation Notes
- This feature should establish vocabulary and helper structure first, then migrate routes to use it.
- Avoid inventing new product states when a scope can be derived from existing roles and relationships.
- Keep the matrix human-readable enough that product decisions can be reviewed without reading route code.
- If a specific surface still needs a product decision, leave that rule explicitly pending instead of encoding an accidental default.

---

## Acceptance Criteria
- The repository contains a maintained visibility policy doc in `docs/visibility-policy.md` that future features can reference directly.
- The visibility policy doc distinguishes `Theater admin` from `Staff / manager`.
- Core visibility-sensitive routes use shared helpers for their main authorization decisions.
- The product uses documented response semantics for hidden vs forbidden resources.
- Existing privacy-by-default behavior is preserved or tightened, not weakened.
- Verification covers the major viewer-state permutations for the protected surfaces in scope.

---

## Suggested Work Order
1. Finalize the canonical visibility vocabulary and matrix.
2. Add shared helper functions for the core visibility questions.
3. Migrate the main routes to the shared policy layer.
4. Update docs to describe response semantics and role distinctions.
5. Add tests and run verification.

---

## Risks
- A shared policy layer can become too abstract if helpers are not kept surface-specific.
- Route behavior may currently differ in subtle but intentional ways that need to be preserved rather than flattened.
- Aligning response semantics may expose mismatches between product expectations and existing frontend assumptions.

---

## Open Questions
- Are there any current frontend assumptions that depend on protected surfaces returning `404` instead of `403`?
- Should any future surface intentionally hide existence again, or should `403` remain the default visibility response everywhere outside authentication redirects?
