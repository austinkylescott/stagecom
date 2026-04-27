# Feature Spec: App Design Reset v1

## Status

Draft

## Summary

Reset Stagecom's design authority around a new app-wide design direction rather than continuing to extend the current Stage wrapper system.

This spec defines the product-facing design reset that will guide the next big-bang frontend rebuild.

## Why This Exists

The current app has drifted into overlapping systems:

- a global Nuxt UI theme layer
- Stage wrapper primitives over Nuxt UI
- page-local layout and tone systems
- route-specific composition patterns that do not share a common page model

That overlap makes the UI harder to reason about and pushes product structure decisions into ad hoc component work.

This reset moves design authority back to:

- a locked sitemap
- a locked page-archetype system
- a smaller component taxonomy
- a Stitch-backed visual direction translated into repo-native rules

## Goals

- Replace the current authenticated app design authority with a new app-wide system.
- Treat all current pages as redesign inputs, not as visual references to preserve.
- Define one coherent design language across public, hybrid, and authenticated routes.
- Make page hierarchy and page purpose explicit before implementation.
- Ensure the future UI system is Nuxt UI first, with smaller app-specific layers.

## Non-Goals

- No backend or schema changes in this design-first phase.
- No attempt to preserve the current Stage component layer for compatibility.
- No implementation of the full rebuild in this spec alone.

## Product Modes

### Public

Used for:

- homepage
- login
- signup
- confirm

Characteristics:

- brand-forward
- low operational density
- simple navigation and conversion paths

### Hybrid

Used for:

- theater detail
- event detail

Characteristics:

- must read correctly to anonymous visitors first
- reveals richer member/admin affordances without becoming a separate page
- public information hierarchy stays stable regardless of auth

Hybrid routes should follow the flatter canonical URL model:

- `/{theaterSlug}`
- `/{theaterSlug}/{eventSlug}`

### Authenticated

Used for:

- callsheet
- notifications
- profile
- theater admin
- theater collection/create
- theater-scoped event creation

Characteristics:

- operational clarity over marketing tone
- denser navigation and information modules
- consistent shell behavior across desktop and mobile

## Design System Rules

### 1. Sitemap before surface

No new page or component should be designed without first mapping it to the sitemap and one page archetype.

### 2. Nuxt UI first

Use Nuxt UI primitives wherever they fit naturally. Do not rebuild generic controls unless the new design system requires a specific reusable behavior that Nuxt UI alone does not express well.

### 3. Theme hierarchy is fixed

Use this order:

1. `project/app/app.config.ts`
2. component-level `:ui` overrides
3. inline Tailwind utilities
4. `project/app/assets/css/main.css` only for durable cross-app tokens and primitives

### 4. Current Stage wrappers are not locked

Existing files such as `StageButton`, `StageDropdown`, `StageSection`, `StageFeatureCard`, and `AuthenticatedAppShell` are redesign candidates. They should survive only if the new component-system spec gives them a clear, smaller job.

### 5. Generated design must be translated

Google Stitch output is reference material, not implementation. Every generated idea must be mapped back into Stagecom routes, components, and theme ownership before it enters the codebase.

## Deliverables

- a locked sitemap and surface map
- a locked page-archetype matrix
- a locked component-system spec
- a `/dev/components` reference-page spec
- a Google Stitch prompt
- a Stitch translation matrix
- a permanent `/dev/components` design-system overview spec
- updated design/coding guidance docs

## Route Direction

The redesign should now use:

- `/theaters` as the collection entry for finding theaters and starting theater creation
- `/{theaterSlug}` as the canonical theater route
- `/{theaterSlug}/{eventSlug}` as the canonical event route

CRUD paths should stay theater-scoped wherever possible. The sitemap spec owns which of those tasks become first-class routes versus inline operations.

## Dev Components Requirement

`/dev/components` must survive the redesign as a first-party internal reference surface.

It should:

- provide a clear overview of the implemented design system
- show every durable primitive, composite, and important page pattern
- demo states with deterministic sample data
- avoid depending on the actual current date or live product data for core examples
- help validate design decisions, component coverage, and visual regressions during implementation

## Acceptance Criteria

- The design bible no longer treats current authenticated surfaces as gospel.
- Every current route belongs to an explicit product mode and page archetype.
- The new design system guidance no longer assumes the current Stage wrapper layer is the implementation target.
- The Stitch prompt reflects the real app surface map rather than a generic app brief.
