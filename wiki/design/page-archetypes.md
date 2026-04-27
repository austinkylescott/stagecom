# Page Archetypes

**Status:** current
**Last updated:** 2026-04-27
**Sources:** [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]]

The redesign uses explicit page archetypes so structure is decided before component work.

## Archetypes

- `marketing_auth`
  - mode: public
  - layout: `default`
  - purpose: explain the product or complete auth handoff with minimal operational density
  - required regions: hero or page heading, primary action, support copy, fallback links or retry path
  - tone: brand-forward, low-density, conversion-oriented
- `workspace`
  - mode: authenticated
  - layout: `app`
  - purpose: ongoing operational work with persistent shell context
  - required regions: shell header, filters or controls, primary work surface, detail navigation
  - tone: dense but readable, utility-first, still aligned to brand tokens
- `entity_overview`
  - mode: hybrid
  - layout: `hybrid`
  - purpose: one canonical public-plus-member overview page for a theater or event
  - required regions: entity identity, public information, relationship state, role-aware actions
  - tone: public-first hierarchy with richer controls revealed in context
- `entity_operations`
  - mode: authenticated
  - layout: `app`
  - purpose: operational management or creation for a theater-owned entity
  - required regions: contextual heading, admin or builder controls, validation/status states, supporting operational modules
  - tone: action-oriented and structured; should not read like marketing
- `inbox_list`
  - mode: authenticated
  - layout: `app`
  - purpose: queue or list workflows centered on scanning, filtering, and state management
  - required regions: heading, filters or tabs, list body, empty state, row-level actions
  - tone: high scanability and consistent row rhythm
- `account_settings`
  - mode: authenticated
  - layout: `app`
  - purpose: identity, membership-facing account information, and profile editing
  - required regions: profile summary, editable fields, status notices, related personal context
  - tone: personal but still operationally clear
- `internal_reference`
  - mode: internal
  - layout: `default` or dedicated internal layout
  - purpose: document the implemented system for the team and AI agents
  - required regions: tokens, primitives, composites, page excerpts, deterministic demo states
  - tone: comprehensive reference, not a marketing surface

## Mode Mapping

- Public/auth pages use `marketing_auth`.
- Callsheet uses `workspace`.
- Theater and event overview pages use `entity_overview`.
- Theater admin, event creation, and the theater collection use `entity_operations`.
- Notifications uses `inbox_list`.
- Profile uses `account_settings`.
- `/dev/components` uses `internal_reference`.

## Layout Expectations

- `default`
  - used by public and auth support pages
  - should stay simpler and less operational than app shell routes
- `app`
  - used by authenticated work surfaces
  - supports sidebar shell on desktop and bottom navigation on mobile
- `hybrid`
  - used by canonical theater and event overview pages
  - must read correctly to anonymous visitors before revealing member/admin affordances

## Why It Matters

The 2026-04-12 reset explicitly rejects designing components or pages without first assigning them to the sitemap and an archetype.

## Related
- [[wiki/design/surface-map]]
- [[wiki/design/design-system]]
- [[wiki/architecture/stack-and-layout]]
