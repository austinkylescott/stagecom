# Feature Spec: Auth Security Hardening v1 (Stagecom)
Derived from PRD v0.2 (Locked)

---

## Summary
Harden Stagecom's authentication and authorization model so the product's contextual role system is enforced in both the application layer and the database layer.

This feature closes the audit findings around self-granted theater membership, overexposed show and theater data, performer affiliation leakage, and missing repo-visible database policy definitions.

---

## Goals
- Enforce privacy by default for theater, show, cast, and performer data
- Prevent authenticated users from granting themselves theater membership through unrelated profile flows
- Ensure unpublished show data is only available to authorized viewers
- Reduce trust in route-only checks by defining repo-visible Supabase RLS and policy behavior
- Add verification coverage for the highest-risk auth and privacy regressions

---

## Non-Goals
- Redesign the product role model
- Introduce new user-facing roles or approval workflows
- Change notification semantics beyond what is required to preserve existing behavior after auth hardening
- Add unrelated API refactors or broad architectural cleanup

---

## Source Of Truth
- `docs/PRD.md`
- `docs/data-model.md`
- `docs/server-api-conventions.md`
- `docs/events-and-notifications.md`
- `project/supabase/migrations/*`

---

## Problem Statement
The current implementation has four security gaps:

1. A user can set a home theater and be auto-added as an active member, bypassing the explicit join flow.
2. Show detail reads do not perform a route-level authorization decision before returning non-public show data.
3. Performer search returns theater affiliation data more broadly than profile visibility rules imply.
4. The repository does not contain visible RLS/policy definitions for the core auth-sensitive tables, making the effective security model unclear and too dependent on route logic.

These gaps conflict with the PRD's contextual roles and privacy-by-default requirements.

---

## Product Rules

### Membership Rules
- Theater membership must only change through explicit membership flows or theater staff actions.
- Setting or clearing a home theater must never create, reactivate, or upgrade theater membership.
- A user may only set `home_theater_id` to a theater where they already have an active membership.

### Show Visibility Rules
- Approved and publicly listed shows may be viewed by anyone allowed by the product surface.
- Non-public shows must only be visible to:
  - producers on that show
  - active theater staff for the owning theater
  - performers with an explicit cast relationship when the returned data is limited to what they are allowed to see
- Knowing a show ID must not be enough to view draft, pending, rejected, or otherwise non-public show details.

### Cast Visibility Rules
- Producers may view the full cast state for their show.
- Theater staff may view the cast state allowed by the theater oversight rules.
- Performers may view:
  - their own cast record
  - accepted cast entries for public/program visibility
  - pending invited state only when the product explicitly allows that viewer to see it
- Cast visibility rules must not rely on a service-role read that bypasses normal policy unless the route has already made an explicit authorization decision.

### Performer Directory Privacy Rules
- Profile visibility determines whether a profile is discoverable.
- Theater affiliation visibility must be at least as strict as profile visibility.
- Returned `theater_memberships` must be limited to memberships the viewer is allowed to infer from the product rules.
- A viewer must not learn unrelated theater affiliations merely because a profile itself is visible.

### Theater Stats Visibility Rules
- Public theater pages may expose public-facing stats only.
- Internal operational counts, including review-queue counts and non-public show counts, must be limited to theater staff or removed from anonymous/member-facing responses.

---

## Technical Plan

### 1. Add Repo-Visible RLS And Policy Definitions
- Add a new Supabase migration that explicitly enables RLS on auth-sensitive tables at minimum:
  - `profiles`
  - `theater_memberships`
  - `shows`
  - `show_roles`
  - `show_cast`
  - `show_occurrences`
  - `show_review_events`
  - `notifications`
  - `email_outbox`
- Define policies that align with the product rules instead of assuming route checks are sufficient.
- Prefer reusable SQL helpers for policy predicates where it keeps policy logic understandable.
- Keep service-role access available only where the server intentionally needs it.

Policy intent:
- Users can read and update their own profile.
- Theater memberships are readable only where the viewer is entitled to know that relationship.
- Public shows are readable broadly; non-public shows are readable only by producers, permitted cast viewers, or theater staff.
- Show cast rows are readable and mutable only under explicit actor/relationship rules.
- Notifications are readable and writable only for their owning user, except by service role.

### 2. Remove Membership Escalation From Home Theater Flow
- Update `POST /api/me/home-theater` so it:
  - allows clearing `home_theater_id`
  - allows setting `home_theater_id` only if the caller already has active membership in that theater
  - returns `403` when the caller tries to set a home theater they do not belong to
- Do not auto-upsert `theater_memberships` from this route.
- Preserve current behavior for existing active members.

### 3. Add Explicit Authorization To Show Detail Reads
- Update `GET /api/shows/:id` to make a clear route-level access decision before returning show details.
- The route should:
  - allow public access only for approved/publicly listed shows
  - allow producer access for their own shows
  - allow active theater staff access for their theater's shows
  - allow performer access only when product rules permit that show relationship to reveal the show
- Remove unnecessary service-role reads if the same result can be obtained safely through normal auth-aware queries.
- If a service-role read remains necessary for `viewerCast`, document why and gate it behind an authorization result computed first.

### 4. Tighten Performer Directory Membership Exposure
- Update `GET /api/performers` so membership rows in the response are filtered to permitted affiliations only.
- Acceptable approaches:
  - return only shared-theater memberships between viewer and visible profiles
  - return only the membership relevant to the requested `theaterId`
  - omit affiliation data for profiles where the viewer does not have the right relationship
- Preserve anonymous behavior of showing only public profiles.
- Preserve the user's ability to see their own memberships where needed by the UI.

### 5. Restrict Internal Theater Stats
- Update `GET /api/theaters/:slug` so internal counts are not exposed to anonymous or unauthorized users.
- Options:
  - remove `pendingReviewCount` and non-public totals from the public payload
  - or include them only for active staff viewers
- Keep public show information available as currently intended.

### 6. Document The Security Model
- Update relevant docs to reflect the final rules:
  - `docs/data-model.md` for policy-sensitive relationship expectations if needed
  - `docs/server-api-conventions.md` if new auth or permission helpers are introduced
  - `docs/ai-interaction.md` only if workflow expectations change
- If notification recipients or event triggers change as a consequence of tightened auth, update `docs/events-and-notifications.md`.

### 7. Add Verification Coverage
- Add tests for the highest-risk regressions, prioritizing server-route behavior and authorization helpers.
- Minimum coverage should include:
  - cannot become a theater member via `POST /api/me/home-theater`
  - cannot read non-public show detail without qualifying relationship
  - can read non-public show detail as producer or theater staff
  - performer directory does not leak unrelated theater memberships
  - public theater response does not expose internal review counts to anonymous viewers
- Run `npm run check:server-conventions`.
- Run the narrowest relevant tests.
- Run `npm run build` before completion because these changes affect shipped behavior.

---

## Implementation Notes
- Prefer targeted shared helpers over repeated inline permission logic if the same checks appear across multiple routes.
- Keep service-role usage minimal and explicit. Each remaining service-role call should have a clear justification tied to a server-owned operation.
- Do not weaken the invariant that producers are not automatically cast.
- Do not add implicit membership side effects to profile, preference, or home-theater flows.
- If RLS introduction requires route adjustments because current app queries relied on unrestricted reads, update those routes in the same feature so behavior remains coherent.

---

## Acceptance Criteria
- Setting a home theater never creates or reactivates theater membership.
- A user cannot use profile or preference flows to gain access to member-only theater actions.
- Non-public show details return `403` or `404` for unauthorized viewers.
- Producers and permitted theater staff can still access the non-public shows they are supposed to manage.
- Performer search no longer reveals unrelated theater affiliations.
- Public theater pages do not reveal internal review or non-public show counts.
- Repo-visible Supabase migrations define the intended RLS/policy behavior for core auth-sensitive tables.
- Relevant docs are updated alongside the implementation.
- Relevant tests and verification commands pass.

---

## Suggested Work Order
1. Define the target security rules and add the RLS migration.
2. Update the home-theater route to remove membership side effects.
3. Harden show detail authorization and remove unnecessary service-role reads.
4. Tighten performer affiliation exposure.
5. Restrict theater stats exposure.
6. Update docs.
7. Add tests and run verification.

---

## Risks
- Adding RLS may break existing server or client queries that were accidentally relying on permissive access.
- Show-detail access rules are easy to get subtly wrong for involved performers versus public viewers.
- Tightening performer affiliation exposure may require small UI adjustments if the frontend assumed broader membership data.

---

## Open Questions
- Should theater staff see full cast state for all shows in their theater, or only oversight-relevant metadata? The current implementation implies broad staff visibility, but this should be confirmed before policy lock-in.
- For unauthorized `GET /api/shows/:id` requests, should the product prefer `404` over `403` to reduce object enumeration?
- On public theater pages, is `memberCount` considered public-facing, or should public stats be limited further?
