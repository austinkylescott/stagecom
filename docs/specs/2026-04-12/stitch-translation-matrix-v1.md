# Stitch Translation Matrix v1

## Purpose

This document translates Google Stitch output into Stagecom implementation decisions.

Nothing from Stitch should be copied directly into the codebase without being classified here first.

## Route Mapping

| Stitch Screen Type | Stagecom Route | Implementation Target |
| --- | --- | --- |
| Marketing landing | `/` | public homepage composition |
| Login | `/login` | auth page composition |
| Signup | `/signup` | auth page composition |
| Confirm state | `/confirm` | auth status composition |
| Callsheet workspace | `/callsheet` | authenticated workspace page |
| Notifications inbox | `/notifications` | inbox/list page |
| Profile/account | `/profile` | account/settings page |
| Theater collection / create | `/theaters` | entity operations page |
| Theater overview | `/[theaterSlug]` | hybrid entity overview page |
| Theater admin | `/[theaterSlug]/admin` | authenticated entity operations page |
| Create event | `/[theaterSlug]/new` | entity operations page |
| Event overview | `/[theaterSlug]/[eventSlug]` | hybrid entity overview page |
| Design system reference | `/dev/components` | permanent internal reference and demo page |

## Ownership Mapping

| Generated Design Idea | Route-Level Translation Rule | Repo Owner |
| --- | --- | --- |
| global color/typography/control treatment | if reused across multiple surfaces, define as system theme | `project/app/app.config.ts` and theme tokens |
| Nuxt UI primitive variation | if specific to one component family, keep local to that family | component `:ui` overrides |
| local layout rhythm or arrangement | keep near the page or composite that owns the structure | page template or composite section |
| repeated product module | extract only after the module repeats across real surfaces | composite section component |
| wrapper around a generic control | allow only if it adds semantic API or behavior | primitive component, otherwise reject |
| decorative/generated-only flourish | keep only if it survives responsive and multi-page use | usually reject or reinterpret |

## Keep / Reinterpret / Reject Rules

### Keep

Use generated ideas directly only when they:

- map to a real Stagecom route or module
- reinforce the locked page archetypes
- fit Nuxt UI and Tailwind implementation cleanly
- improve hierarchy without introducing a one-off dialect

### Reinterpret

Rework generated ideas when they:

- are visually strong but need to be expressed through Nuxt UI primitives
- imply a useful section that needs different copy, data shape, or hierarchy in Stagecom
- can become a reusable page pattern rather than a one-off composition

### Reject

Reject generated ideas when they:

- add fake analytics or placeholder SaaS widgets
- create a parallel base component system
- only work on one page and break the app-wide system
- conflict with PRD role/context rules
- depend on product features Stagecom does not have

## Current Translation Defaults

- Theater overview remains theater-first, not show-first.
- Event overview combines public identity and associated-user operations on one flat canonical route.
- Callsheet remains the authenticated home surface.
- Theater admin remains a distinct operational page.
- Theater discovery and theater creation begin from `/theaters`.
- `/dev/components` is documentation of the implemented system, not a design invention sandbox, and it must remain comprehensive enough to review the full system in one place.

## Implementation Gate

Before a generated idea is implemented, record:

- the Stagecom route it belongs to
- whether it is theme, primitive, composite, or page-level
- whether it is kept, reinterpreted, or rejected
- any reason it conflicts with PRD or repo constraints
