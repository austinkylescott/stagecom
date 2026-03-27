# Visibility Rules Research

This document is a research snapshot of the current implementation as of March 27, 2026.

The maintained policy source of truth now lives in `docs/visibility-policy.md`.

## Scope

This document captures the current visibility rules implemented across the Stagecom site as of March 27, 2026. It focuses on what different viewer types can see in practice across theater pages, show pages, performer discovery, review surfaces, and notifications.

Legend:

- ✅ Visible / allowed
- ◐ Conditionally visible / allowed
- ❌ Not visible / not allowed
- N/A Not applicable

Important terminology:

- `Anonymous`: not signed in
- `Out-of-theater user`: signed-in user with no active membership in the relevant theater
- `In-theater member`: signed-in user with active membership in the relevant theater
- `Theater admin`: active theater member with the `admin` role
- `Staff / manager`: active theater member with the `manager` or `staff` role
- `Producer`: user with `show_roles.role = producer` on the relevant show
- `Castmate`: performer with `show_cast.status = accepted` on the relevant show
- `Invited pending cast`: performer with `show_cast.status = pending` and `source = invited`
- `Requested pending cast`: performer with `show_cast.status = pending` and `source = requested`

Important product gap:

- The prompt mentions a "following user" scenario, but the current product does not implement a distinct follow relationship. The closest existing graph is shared active theater membership, plus optional `home_theater_id`.
- The current implementation still groups `admin`, `manager`, and `staff` together for theater-oversight checks via `hasStaffRole()`. This document separates `Theater admin` from `Staff / manager` because they are distinct role classes in the model, even where current route behavior is identical.

## Summary Matrix

| Surface / Feature | Anonymous | Out-of-theater user | In-theater member | Theater admin | Staff / manager | Producer | Accepted castmate | Invited pending cast | Requested pending cast |
|---|---|---|---|---|---|---|---|---|---|
| Theater page identity and location | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Theater page membership state for self | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Theater page public show list | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Theater page public stats only | ✅ | ✅ | ✅ | N/A | N/A | ✅ | ✅ | ✅ | ✅ |
| Theater page internal review counts | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Theater review queue | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Personal review inbox | ❌ | ◐ | ◐ | ✅ | ✅ | ◐ | ◐ | ◐ | ◐ |
| Show detail for approved + public show | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Show detail for non-public show | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Show producers list on accessible show | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Show occurrences on accessible show | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Show accepted cast list | ◐ | ◐ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Show pending cast list | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Request to join public casting show | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Request to join theater casting show | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Request to join direct-invite show | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Performer directory profile with `public` visibility | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Performer directory profile with `theater_only` visibility | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Performer directory profile with `private` visibility | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Performer theater affiliations for another user | ❌ | ❌ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| Own profile in performer directory | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Own notifications | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Other users' notifications | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Current Rules By Surface

### 1. Theater pages

Current implemented behavior:

- Anyone can fetch a theater by slug and see basic theater identity fields such as name, tagline, and address.
- Anyone can see approved, publicly listed shows for that theater.
- Signed-in viewers also receive their own membership status for that theater, plus whether it is their `home_theater_id`.
- `memberCount` is public.
- `totalShows` is public only as a count of approved and public-listed shows.
- `pendingReviewCount` is admin/manager/staff only.
- `permissions.canReview` is admin/manager/staff only.

Implications:

- Theater pages are intentionally public-facing.
- The only viewer-specific state returned to non-oversight users is their own membership/home status.
- Internal workflow state is mostly hidden, with one exception: `memberCount` is broadly visible.

### 2. Theater review surfaces

Current implemented behavior:

- `/api/theaters/[slug]/review` is restricted to theater admins, managers, and staff for that specific theater.
- `/api/review` is signed-in only, but only returns useful review data for theaters where the viewer has an admin, manager, or staff role.
- A producer who is not also theater admin/manager/staff does not get review access by default.

Implications:

- Review is modeled as a theater governance function, not a show-ownership function.
- Oversight capability is theater-scoped, not globally inferred from show activity.
- In current route behavior, theater admin, manager, and staff have the same review visibility.

### 3. Show detail pages

Current implemented behavior:

- Approved and publicly listed shows are visible to everyone.
- Non-public shows return `404` unless the viewer is one of:
  - a producer on the show
  - active theater admin, manager, or staff in the show’s theater
  - a performer with `show_cast.status = accepted`
  - a performer with `show_cast.status = pending`
- Once a viewer can access the show, they also receive show metadata, occurrences, and producer identities.

Implications:

- Show visibility is relationship-based once a show is not public.
- Pending cast participation is enough to view the show page, even for requested-not-yet-approved performers.
- The system intentionally hides existence of restricted shows by returning `404` instead of `403`.

### 4. Cast visibility within show pages

Current implemented behavior:

- Producers and theater admins, managers, and staff can see the full cast state, including accepted, pending, declined, withdrawn, and removed entries.
- Accepted castmates can see accepted cast plus pending cast.
- Invited pending performers can also see pending cast.
- Requested pending performers can see the show page and their own `viewerCast`, but not the broader pending cast list.
- Everyone else who can access a show only sees accepted cast.

Implications:

- The cast surface distinguishes between "can access the show" and "can inspect queue state."
- Invited pending performers are treated as closer to the production than requested pending performers.
- Accepted castmates currently have more cast-list visibility than regular members or outsiders.

### 5. Joining shows

Current implemented behavior:

- Anonymous users cannot request to join.
- Producers cannot request to join their own show.
- A user cannot request again while they already have an active non-terminal cast row.
- `direct_invite` shows never expose a request path.
- `public_casting` shows allow any signed-in non-producer to request.
- `theater_casting` shows allow only active theater members to request.

Implications:

- Casting mode controls action visibility more than show visibility.
- Theater membership matters for participation, not for reading public shows.

### 6. Performer directory and profile visibility

Current implemented behavior:

- Anonymous users only see `public` profiles.
- Signed-in viewers see:
  - all `public` profiles
  - their own profile regardless of visibility
  - `theater_only` profiles if they share at least one active theater membership with that performer
- `private` profiles are effectively self-only in the directory response.
- The profile editor exposes `public`, `theater_only`, and `private`.

Implications:

- Profile visibility is independent of show relationships.
- Shared theater membership is the current social graph for semi-private discovery.
- There is no separate "follow" or "friend" model.

### 7. Performer theater affiliation visibility

Current implemented behavior:

- Anonymous users get no membership affiliation data.
- Signed-in users always get their own theater affiliations.
- For other users, theater affiliations are filtered to:
  - theaters shared with the viewer, or
  - the requested `theaterId` filter context when browsing a specific theater roster

Implications:

- Affiliation visibility is stricter than profile visibility and is intentionally overlap-based.
- This prevents the directory from becoming a global theater-membership map.

### 8. Home theater visibility and semantics

Current implemented behavior:

- `home_theater_id` is a preference and does not create or reactivate membership.
- A user can only set a theater as home if they are already an active member.
- Theater pages return `isHome` only for the current viewer.

Implications:

- Home theater is identity preference, not authorization.
- This closes the previous self-enrollment path where preference-setting could mutate membership state.

### 9. Notifications

Current implemented behavior:

- Notifications require authentication.
- Notification list queries are filtered by `user_id = current_user`.
- Mark-as-read operations also scope updates to `user_id = current_user`.

Implications:

- Notifications are strictly private.
- There is no shared inbox model in the current product.

## Findings

### What is coherent today

- The product is mostly aligned with the PRD’s privacy-by-default stance.
- Theater governance data is clearly separated from public theater marketing data.
- Non-public show access now depends on an explicit relationship to the show or theater.
- Theater affiliation visibility is meaningfully narrower than performer profile visibility.
- Home theater is no longer treated as a shortcut into membership.

### Where the current model is harder to reason about

- Visibility rules are spread across several concepts:
  - profile visibility
  - active theater membership
  - theater admin role
  - manager role
  - staff role
  - producer role
  - show cast state
  - casting mode
  - public listing flag
  - review status
- Similar questions are answered differently by different surfaces:
  - "Can I see this show at all?"
  - "Can I see pending cast?"
  - "Can I request to join?"
  - "Can I see this person’s theater affiliations?"
- Accepted castmates can currently see pending cast entries, which may or may not match long-term product intent.
- Requested pending performers can view a non-public show page, but they cannot inspect broader pending cast state. That is defensible, but it is subtle and should be treated as an explicit product rule.

### Missing or underspecified concepts

- There is no first-class "follow" relationship despite the product language in some places feeling social.
- There is no single policy vocabulary such as `public`, `community`, `relationship`, `oversight-only`, `self-only`.
- RLS and route policy are now much better aligned, but the visibility model still lives mostly in route code and helper functions rather than in one shared product-policy document.

## Recommendations

### 1. Define a canonical visibility vocabulary

Adopt a small set of reusable visibility scopes and map every surface to them:

- `public`: anyone
- `authenticated`: any signed-in user
- `community`: active members of the relevant theater
- `relationship`: users with a direct show relationship such as producer or cast
- `oversight_only`: theater admins, managers, and staff
- `self_only`: only the affected user

This reduces the need to rediscover rules route by route.

### 2. Separate "show access" from "cast queue access" from "participation access"

The current implementation already does this implicitly. Make it explicit in docs and helper naming:

- `canViewShow`
- `canViewAcceptedCast`
- `canViewPendingCast`
- `canRequestCast`
- `canModerateCast`

This keeps future changes from accidentally broadening one surface when only another should change.

### 3. Decide whether accepted cast should see pending cast

This is a product choice, not just an implementation detail.

Options:

- Keep current behavior if the intent is ensemble transparency.
- Restrict pending cast to producers and theater oversight roles if audition/request privacy is more important.

This deserves a written decision because it materially affects interpersonal privacy.

### 4. Introduce a first-class "social graph" concept if follower-style behavior is desired

If the product wants "following user" behavior, do not infer it from theater overlap forever.

Better options:

- add explicit follows
- add explicit collaborator history
- add explicit castmate/co-appeared relationships derived from accepted cast records

Until then, shared theater membership should be described as a temporary proxy, not as a durable social rule.

### 5. Publish one source-of-truth policy table in docs

Keep a maintained visibility matrix in `docs/` that product, engineering, and future feature specs all reference. It should cover:

- content visibility
- action visibility
- hidden-vs-forbidden response semantics
- role precedence
- which relationships are enough for access

That will make future security hardening less reactive.

### 6. Add end-to-end policy verification

Current tests cover helper logic, but the highest-confidence model would include automated checks for:

- anonymous vs authenticated show access
- cast-status-based show access
- performer directory visibility by profile setting
- affiliation filtering by shared membership
- oversight-only review surfaces
- self-only notifications

This is especially important because visibility here is enforced by a mix of route logic and RLS.

## Recommended Future Policy Shape

If the team wants a simpler long-term model while keeping the current intent, this is the clearest structure:

| Domain | Recommended default | Recommended exceptions |
|---|---|---|
| Theater identity | Public | None |
| Theater operations | Oversight-only | Self membership state visible to self |
| Approved public shows | Public | None |
| Unapproved or unlisted shows | Relationship-based | Theater oversight override |
| Accepted cast list | Public for public shows, relationship-based for private shows | Theater oversight or producer override |
| Pending cast queue | Producer + theater oversight roles only | Optional castmate visibility only if product explicitly wants it |
| Performer profile | User-selected: public, community, private | Self always visible |
| Theater affiliations | Shared-community only | Self always visible |
| Notifications | Self-only | None |

## Source Notes

This document was derived from the current implementation and supporting docs, primarily:

- `docs/PRD.md`
- `docs/data-model.md`
- `docs/specs/feature-spec-show-lifecycle-v1.md`
- `docs/specs/feature-spec-auth-security-hardening-v1.md`
- `project/server/api/theaters/[slug]/index.get.ts`
- `project/server/api/theaters/[slug]/review.get.ts`
- `project/server/api/review/index.get.ts`
- `project/server/api/shows/[id]/index.get.ts`
- `project/server/api/shows/index.get.ts`
- `project/server/api/performers.get.ts`
- `project/server/api/me/home-theater.post.ts`
- `project/server/api/notifications/index.get.ts`
- `project/server/api/notifications/read.post.ts`
- `project/server/utils/show-access.ts`
- `project/server/utils/performer-memberships.ts`
- `project/app/pages/profile.vue`
