# Feature Spec: Cast Queue Privacy v1 (Stagecom)
Derived from PRD v0.2 (Locked)

---

## Summary
Define and implement the product rules for who may see pending cast entries, who may inspect cast workflow state, and how those rules differ from general show access.

This feature exists because the current implementation gives accepted castmates and invited pending performers broader queue visibility than other viewer types, while requested pending performers can access a non-public show without seeing broader pending state. The research shows that this is defensible but currently implicit and easy to change accidentally.

---

## Goals
- Make cast queue visibility an explicit product rule instead of an accidental byproduct of show access
- Separate show access, accepted-cast visibility, pending-cast visibility, and participation actions into distinct permission surfaces
- Preserve privacy-by-default for performers in casting workflows
- Align route behavior, helper naming, and documentation around one approved cast-queue model
- Add verification coverage for cast-status-based visibility and mutation rules

---

## Non-Goals
- Redesign casting modes
- Introduce auditions, notes, ratings, or other new review artifacts
- Add producer-to-producer or cast-to-cast messaging features
- Change the invariant that producers are not automatically cast

---

## Source Of Truth
- `docs/PRD.md`
- `docs/data-model.md`
- `docs/visibility-policy.md`
- `docs/research/visibility-rules.md`
- `docs/specs/feature-spec-show-lifecycle-v1.md`
- `docs/specs/feature-spec-auth-security-hardening-v1.md`
- show and cast routes under `project/server/api/shows/`

---

## Problem Statement
The current cast visibility model mixes together several different questions:

- Can I view this show at all?
- Can I see the accepted cast list?
- Can I see the pending cast queue?
- Can I request to join?
- Can I moderate cast outcomes?

That creates ambiguity, especially for three viewer classes:

1. Accepted castmates, who currently can see pending cast entries.
2. Invited pending performers, who currently can also see pending cast entries.
3. Requested pending performers, who can view the show and their own cast state but not the broader pending queue.

If these distinctions are intentional, they need to be documented and enforced consistently. If they are not, the product should tighten queue visibility now.

---

## Proposed Product Decision
Adopt a privacy-first cast queue rule:

- Producers may view and moderate the full cast queue for their show.
- Theater admins, managers, and staff may view and moderate the full cast queue for shows in their theater as part of oversight.
- Performers may always view their own cast row.
- Accepted castmates may view the accepted cast roster when the show is otherwise visible to them.
- Pending cast entries for other users are not visible to accepted castmates.
- Pending cast entries for other users are not visible to invited pending performers.
- Requested pending performers may access only their own cast state and the show details they are otherwise entitled to see.

This keeps pending participation state private to the performer, producers, and theater oversight roles unless a later feature intentionally broadens it.

---

## Product Rules

### Access Layers
- `canViewShow`: determines whether the viewer can access the show page at all.
- `canViewAcceptedCast`: determines whether the viewer can see accepted cast roster data.
- `canViewPendingCast`: determines whether the viewer can see pending cast rows for other users.
- `canRequestCast`: determines whether the viewer can request participation.
- `canModerateCast`: determines whether the viewer can approve, decline, remove, or otherwise manage cast entries.

These layers must remain separate in helpers, routes, and docs.

### Queue Visibility Rules
- Producers have full queue visibility for their own shows.
- Theater admins, managers, and staff have full queue visibility for shows in their theater.
- A performer only sees their own pending, accepted, declined, withdrawn, or removed row unless they separately qualify for a broader role.
- Accepted cast roster visibility does not imply pending queue visibility.
- Invitation status does not imply visibility into other performers' pending state.

### Participation Rules
- `public_casting`: any signed-in non-producer may request.
- `theater_casting`: only active theater members may request.
- `direct_invite`: no self-request path.
- A user may not create a second active cast request while they still have a non-terminal cast row.
- Self-service cast updates must be limited to the transitions the product explicitly allows, not all status changes.

### Response Semantics
- Unauthorized access to a protected show should return `403`.
- Unauthorized attempts to mutate cast state on an otherwise accessible show should return `403`.

---

## Technical Plan

### 1. Add Shared Cast Visibility Helpers
- Define or extend helpers so routes can ask:
  - whether a viewer can see accepted cast
  - whether a viewer can see pending cast
  - whether a viewer can request cast
  - whether a viewer can moderate cast
- Keep pending-queue checks separate from show access checks.

### 2. Align Show Detail Payloads
- Update `GET /api/shows/:id` so cast-related payload sections are shaped by the approved policy:
  - accepted cast roster when allowed
  - viewer's own cast record when applicable
  - pending cast queue only for producers and theater oversight roles
- Do not expose broader queue state to accepted castmates or invited pending performers under this spec.

### 3. Align Cast Mutation Routes
- Review cast request and cast update routes so the allowed actions match the documented policy.
- Ensure the DB policy layer does not allow broader self-service mutations than the routes intend.

### 4. Document The Rule
- Update product and engineering docs to state that pending cast state is private workflow data, not general ensemble visibility.
- Cross-reference the visibility foundation spec and `docs/visibility-policy.md` so queue visibility appears in the shared matrix.

### 5. Add Verification Coverage
- Add tests for:
  - producer queue visibility
  - theater oversight queue visibility
  - accepted cast can see accepted roster but not pending queue
  - invited pending performer can see own state but not broader pending queue
  - requested pending performer can see own state but not broader pending queue
  - unauthorized cast mutations are rejected
- Run `npm run check:server-conventions`.
- Run the narrowest relevant tests.
- Run `npm run build` before completion if shipped behavior changes.

---

## Implementation Notes
- This spec intentionally chooses the tighter privacy option from the research recommendations.
- If the product later wants ensemble transparency, that should be a separate, explicit feature with its own rationale.
- The same cast queue rules must be reflected in both route logic and Supabase policy behavior.

---

## Acceptance Criteria
- Pending cast rows for other users are visible only to producers and theater oversight roles.
- Accepted castmates do not receive broader pending queue data.
- Invited pending performers do not receive broader pending queue data.
- Requested pending performers receive only their own cast state plus any otherwise allowed show access.
- Shared helper names clearly separate show access from queue access and moderation.
- Tests cover the main cast-status visibility permutations.

---

## Suggested Work Order
1. Finalize the queue-privacy product decision.
2. Add or update helper functions for show, accepted-cast, pending-cast, request, and moderation checks.
3. Align show detail response shaping to the policy.
4. Align cast mutation routes and DB policies.
5. Update docs and tests.

---

## Risks
- Tightening queue visibility may require minor frontend adjustments if the current UI assumes more pending-cast context.
- Cast participants may perceive the new rules as less transparent unless the UI clearly distinguishes accepted roster from private queue state.
- Policy drift can reappear if routes and RLS are not verified together.

---

## Open Questions
- Should theater instructors share the same queue visibility as admins, managers, and staff, or remain outside oversight for now?
- Should accepted cast roster visibility for non-public shows include all accepted castmates, or only those who already qualify for show access through another relationship?
- Does any existing UI rely on invited pending performers seeing broader pending state, or can that behavior be tightened without a UX gap?
