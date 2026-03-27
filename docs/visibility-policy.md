# Visibility Policy (Stagecom)

Maintained product and engineering source of truth for visibility rules.

This document converts the March 27, 2026 visibility research into the canonical policy model for future feature work. It should be used alongside `docs/PRD.md`, `docs/data-model.md`, and `docs/server-api-conventions.md` when implementing or reviewing visibility-sensitive behavior.

---

## Canonical Visibility Vocabulary

- `public`: visible to anyone
- `authenticated`: visible to any signed-in user
- `theater_only`: visible to active members of the relevant theater
- `relationship`: visible to users with a direct relationship to the relevant entity, such as producer or explicit cast involvement
- `oversight_only`: visible to theater admins, managers, and staff for the relevant theater
- `self_only`: visible only to the affected user

These scopes describe product policy. Routes and DB policies may still need to inspect contextual roles, cast status, and ownership to determine whether a viewer qualifies.

---

## Role Clarification

- `Theater admin` is distinct from `manager` and `staff`.
- For many current oversight surfaces, `admin`, `manager`, and `staff` share the same effective visibility.
- The policy and docs should preserve that distinction even where current implementation grants the same access.

---

## Response Semantics

- Protected surfaces should standardize on `403` when the viewer is not allowed to access or act on the resource.
- If an entire page or surface is off limits, the product should show an unauthorized state and may redirect the user to the most appropriate related surface for that viewer.
- Do not use `404` as the default visibility response for protected surfaces unless a future product decision explicitly restores hidden-existence behavior for a specific surface.

---

## Maintained Matrix

Legend:

- ✅ Visible / allowed
- ◐ Conditionally visible / allowed
- ❌ Not visible / not allowed
- N/A Not applicable

Viewer terminology:

- `Anonymous`: not signed in
- `Out-of-theater user`: signed-in user with no active membership in the relevant theater
- `In-theater member`: signed-in user with active membership in the relevant theater
- `Theater admin`: active theater member with the `admin` role
- `Staff / manager`: active theater member with the `manager` or `staff` role
- `Producer`: user with `show_roles.role = producer` on the relevant show
- `Accepted castmate`: performer with `show_cast.status = accepted` on the relevant show
- `Invited pending cast`: performer with `show_cast.status = pending` and `source = invited`
- `Requested pending cast`: performer with `show_cast.status = pending` and `source = requested`

| Surface / Feature | Anonymous | Out-of-theater user | In-theater member | Theater admin | Staff / manager | Producer | Accepted castmate | Invited pending cast | Requested pending cast | Policy Scope | Unauthorized Behavior |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Theater page identity and location | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `public` | N/A |
| Theater page membership state for self | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `self_only` | `403` |
| Theater page public show list | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `public` | N/A |
| Theater page public stats only | ✅ | ✅ | ✅ | N/A | N/A | ✅ | ✅ | ✅ | ✅ | `public` | N/A |
| Theater page internal review counts | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | `oversight_only` | `403` |
| Theater review queue | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | `oversight_only` | `403` |
| Personal review inbox | ❌ | ◐ | ◐ | ✅ | ✅ | ◐ | ◐ | ◐ | ◐ | `oversight_only` by theater relationship | `403` |
| Show detail for approved + public show | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `public` | N/A |
| Show detail for non-public show | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `relationship` with `oversight_only` override | `403` |
| Show producers list on accessible show | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | same as show access | `403` |
| Show occurrences on accessible show | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | same as show access | `403` |
| Show accepted cast list | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `public` for public shows; otherwise `relationship` | `403` |
| Show pending cast list | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | `oversight_only` or producer relationship | `403` |
| Request to join public casting show | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | `authenticated` action on eligible show | `403` |
| Request to join theater casting show | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | `theater_only` action on eligible show | `403` |
| Request to join direct-invite show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | no self-request path | `403` |
| Performer directory profile with `public` visibility | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `public` | N/A |
| Performer directory profile with `theater_only` visibility | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `theater_only` | `403` |
| Performer directory profile with `private` visibility | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | `self_only` | `403` |
| Performer theater affiliations for another user | ❌ | ❌ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | shared `theater_only` relationship | `403` |
| Own profile in performer directory | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `self_only` | `403` |
| Own notifications | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `self_only` | `403` |
| Other users' notifications | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | `self_only` | `403` |

---

## Key Rules

### Theater Surfaces

- Theater identity and public show marketing remain public.
- Theater operations are oversight-only.
- Self membership and `home_theater_id` state are self-only.
- Public theater responses should not expose internal operational counts to non-oversight viewers.

### Show Surfaces

- Approved and publicly listed shows are public.
- Non-public shows are available to qualifying relationship viewers and theater oversight roles.
- Protected show pages should return `403` for unauthorized viewers and the UI should present an unauthorized state or redirect destination.

### Cast Surfaces

- Accepted cast is the program-facing roster.
- Pending cast state is private workflow data.
- Pending cast rows for other users are visible only to producers and theater oversight roles.
- A performer may always view their own cast row.
- Show access does not automatically imply queue visibility.

### Performer Discovery

- Profile discoverability is controlled by `public`, `theater_only`, and `private`.
- `theater_only` is the correct canonical term for semi-private performer visibility.
- Theater affiliations are stricter than profile visibility and should be limited to shared-theater or self contexts.

### Notifications

- Notifications are self-only for both read and update behavior.

---

## Implementation Guidance

- Visibility-sensitive routes should use shared helpers rather than re-encoding policy inline.
- Route behavior and RLS should agree on the same visibility boundaries.
- Feature specs touching shows, performers, theater roles, review, or notifications should cite this document directly.
- If a new feature needs an exception to this policy, the exception should be added here rather than staying implicit in route code.
