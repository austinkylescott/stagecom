# Feature Spec: App Sitemap And Surface Map v1

## Status

Draft

## Summary

This spec is the canonical route and page-architecture map for the Stagecom redesign.

It classifies every current page in the repo and decides whether the surface stays first-class, gets merged, becomes internal-only, or is removed in the redesign.

## Page Archetypes

- `marketing_auth`: public brand and conversion pages
- `workspace`: authenticated operations pages with persistent shell context
- `entity_overview`: public/member overview pages for a theater or event
- `entity_operations`: authenticated operational pages for creating or managing an entity
- `inbox_list`: authenticated list or queue pages
- `account_settings`: authenticated account and identity pages
- `internal_reference`: internal-only design or developer reference pages

## Canonical Surface Map

| Route | Mode | Page Name | Archetype | Primary Actor | Job | Required Regions | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | public | Homepage | `marketing_auth` | visitor | Explain Stagecom and route users to the right next action | hero, product framing, core value props, auth CTA | keep |
| `/login` | public | Login | `marketing_auth` | returning user | Authenticate into the app | auth form, trust copy, fallback links | keep |
| `/signup` | public | Signup | `marketing_auth` | new user | Create account and establish entry to the product | auth form, expectation-setting copy, fallback links | keep |
| `/confirm` | public | Confirm | `marketing_auth` | new/returning user | Complete auth handoff and explain next state | status message, retry path, next action | keep |
| `/callsheet` | authenticated | Callsheet | `workspace` | member / producer / performer | Show the user's current and upcoming commitments across Stagecom | shell header, date controls, filters, schedule views, detail navigation | keep |
| `/notifications` | authenticated | Notifications | `inbox_list` | signed-in user | Show operational notifications and reading state | filter tabs, notification list, empty state, read-state controls | keep |
| `/profile` | authenticated | Profile | `account_settings` | signed-in user | Show and edit identity, membership-facing account information, and personal context | profile summary, editable fields, status notices, related membership context | keep |
| `/theaters` | authenticated | Theater Collection | `entity_operations` | member creating or joining a theater | Browse/find theaters and start theater creation from one collection entry | collection view, discovery states, create-theater CTA or inline creation entry | keep |
| `/[theaterSlug]` | hybrid | Theater Overview | `entity_overview` | visitor / member / admin | Explain the theater, show public programming, and reveal member/admin actions in context | theater identity, relationship state, upcoming programming, calendar/program listing, actions | keep |
| `/[theaterSlug]/admin` | authenticated | Theater Admin | `entity_operations` | theater manager / staff | Run theater operations from one home surface | admin summary, review queue, settings/actions, member/admin tools | keep |
| `/[theaterSlug]/new` | authenticated | Create Event | `entity_operations` | authorized member / producer | Create a theater-owned event from a theater-scoped workflow | theater context, event builder, validation/submit states | keep |
| `/[theaterSlug]/[eventSlug]` | hybrid | Event Overview | `entity_overview` | visitor / cast / producer / theater admin | Present the event publicly and expose inline working controls to associated users | event identity, schedule, producers/cast, public description, role-aware operations | keep |
| `/dev/components` | internal | Design System Reference | `internal_reference` | team / AI agent | Provide a complete overview and demo surface for the implemented design system | tokens, primitives, composites, page-pattern examples, deterministic sample states, migration notes | keep as permanent internal reference |

## Surface Decisions

### Surfaces that remain first-class

- `/callsheet`
- `/notifications`
- `/profile`
- `/theaters`
- `/[theaterSlug]`
- `/[theaterSlug]/admin`
- `/[theaterSlug]/new`
- `/[theaterSlug]/[eventSlug]`

### Surfaces that remain but are support pages

- `/`
- `/login`
- `/signup`
- `/confirm`

### Surfaces that survive only as internal tooling

- `/dev/components`

This route is not design authority, but it is a permanent implementation reference and demo surface for the system after the redesign lands.

Coverage and maintenance rules for this route are defined in `docs/specs/2026-04-12/feature-spec-dev-components-reference-v1.md`.

## Architecture Decisions

### Callsheet

- authenticated home
- remains a dedicated workspace page
- absorbs schedule-first operational scanning for the signed-in user

### Theater admin

- remains a distinct page, not a tab on the public theater page
- owns theater-only operational density and privileged tooling

### Event detail and event editing

- stay on one canonical event route
- public event information is always present
- associated users see richer working-state sections inline on the same route
- no separate edit/program child pages should return

### Theater collection and creation

- `/theaters` becomes the collection entry for finding a theater and beginning theater creation
- this replaces a separate `/theater/new` page as the primary entry point

### Event creation

- moves to `/{theaterSlug}/new`
- stays explicitly theater-scoped in URL, workflow, and copy
- keeps event ownership obvious without a global event-create page

### CRUD follow-ups

- event management paths should stay under the theater slug when they need dedicated routes
- default preference is inline management on `/{theaterSlug}/{eventSlug}`
- add child CRUD routes only when operational complexity clearly justifies them

### Design system reference

- `/dev/components` remains required
- it should expose the full design system, not a partial style guide
- every durable component and important state should be demoable there with dummy data
- sample states should remain useful regardless of the current date or live backend state

## Layout Mapping

- `default` layout: `/`, `/login`, `/signup`, `/confirm`
- `app` layout: `/callsheet`, `/notifications`, `/profile`, `/theaters`, `/[theaterSlug]/new`, `/[theaterSlug]/admin`
- `hybrid` layout: `/[theaterSlug]`, `/[theaterSlug]/[eventSlug]`
- `/dev/components`: may use `default` or a dedicated internal layout later, but it is not part of the public product model and must remain accessible as an internal reference

## Acceptance Criteria

- Every current route has a defined mode, page name, archetype, and decision.
- The redesign has no orphan pages that rely on nearby pages to define their purpose.
- The future implementation can use this document to decide page boundaries without additional product interpretation.
