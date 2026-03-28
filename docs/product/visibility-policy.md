# Visibility Policy

Maintained source of truth for Stagecom visibility-sensitive surfaces.

This document translates the PRD and data model into one shared policy vocabulary for docs, server helpers, and route behavior. Route-level authorization should map to these scopes rather than re-encoding the same logic ad hoc.

## Canonical Scopes

- `public`: visible to anyone
- `authenticated`: visible to any signed-in user
- `theater_only`: visible to active members of the relevant theater
- `relationship`: visible to users with a direct relationship to the entity, such as producer or explicit cast involvement
- `oversight_only`: visible to theater admins, managers, and staff for the relevant theater
- `self_only`: visible only to the affected user

These scopes are vocabulary, not a replacement for contextual roles. A surface may still require a theater role, cast state, or producer relationship to qualify.

## Role Precedence

- `admin`, `manager`, and `staff` all count as oversight for current visibility decisions.
- `admin` remains a distinct theater role class and should stay distinct in docs and helper naming even when its access currently matches `manager` and `staff`.
- Producers are contextual show roles only.
- Producers are never assumed to be cast.
- Cast access depends on explicit `show_cast` state.

## Response Semantics

- Missing resources return `404`.
- Protected visibility failures return `403`.
- Product redirects or unauthorized states happen at the UI layer, not by changing the API status code.
- Current default: do not hide existence for protected show, review, performer-affiliation, or notification surfaces.

## Surface Matrix

| Surface | Content Scope | Action Scope | Qualified viewers | Unauthorized behavior |
| --- | --- | --- | --- | --- |
| Theater identity (`GET /api/theaters/:slug`) | `public` | n/a | anyone | `404` only if theater is missing |
| Theater operations on theater page | `oversight_only` | n/a | active `admin`, `manager`, `staff` of that theater | omit protected stats/actions from response |
| Theater review queue (`GET /api/theaters/:slug/review`) | `oversight_only` | `oversight_only` | active `admin`, `manager`, `staff` of that theater | `403` |
| Review inbox (`GET /api/review`) | `authenticated` for creator inbox, `oversight_only` for review queue items | n/a | signed-in users see their own created shows; oversight users also see pending review work for their theaters | `401` if not signed in |
| Public approved show (`GET /api/shows/:id`) | `public` | relationship / oversight actions vary by endpoint | anyone | n/a |
| Non-public show (`GET /api/shows/:id`) | `relationship` with `oversight_only` override | relationship / oversight actions vary by endpoint | producer, explicit cast member with `pending` or `accepted`, active theater oversight | `403` |
| Show listings (`GET /api/shows`) | mixed by item | n/a | active theater members get only the shows they are allowed to see under the same show rules | filtered result set |
| Accepted cast on public show | `public` | n/a | anyone who can view the show | filtered result set |
| Accepted cast on non-public show | `relationship` with `oversight_only` override | n/a | viewers who can view that show | filtered result set |
| Pending cast | `relationship` / `oversight_only` | n/a | producers, theater oversight, accepted cast, invited pending cast | filtered result set |
| Performer profile | user-controlled `public`, `theater_only`, `self_only` | n/a | anyone for `public`; shared-theater viewers for `theater_only`; only self for private | filtered result set |
| Performer affiliations | `theater_only` or `self_only` | n/a | viewers who share that theater with the performer, or the performer themself | filtered result set |
| Notifications (`GET /api/notifications`, `POST /api/notifications/read`) | `self_only` | `self_only` | recipient user only | `401` if not signed in; otherwise scoped to own records only |

## Viewer States Used For Verification

- anonymous
- signed-in out-of-theater
- in-theater member
- theater admin
- manager / staff
- producer
- accepted cast
- invited pending cast
- requested pending cast

## Helper Mapping

Server code should prefer these shared helpers in `project/server/utils/visibility-policy.ts`:

- `canViewTheaterOperations`
- `canViewTheaterReview`
- `canViewShow`
- `canViewAcceptedCast`
- `canViewPendingCast`
- `canViewFullCastState`
- `canRequestToJoinShow`
- `canViewPerformerProfile`
- `canViewPerformerAffiliation`
- `canViewNotifications`
- `shouldHideResourceExistence`
