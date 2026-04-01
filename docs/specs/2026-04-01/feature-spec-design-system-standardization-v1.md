# Feature Spec: Design System Standardization v1
Derived from PRD v0.2 (Locked)

## Status

Draft

## Summary

Standardize the current Stagecom design system around the authenticated shell patterns that are now considered locked:

- the theater dashboard on `project/app/pages/theaters/[slug]/index.vue`
- the global navbar in `project/app/components/AppNav.vue`
- the account button and dropdown behavior in `project/app/components/AppAccountMenu.vue`

This pass should reduce style drift, convert repeated structures into reusable primitives, and clarify where global Nuxt UI theming ends and local `:ui` overrides begin.

## Goals

- Extract repeated theater-page markup into manageable reusable components without changing the established visual language.
- Create a shared Stage button apparatus grounded in the nav, account button, and theater dashboard actions.
- Create a shared dropdown surface pattern so account, notifications, and similar shell menus do not drift.
- Prefer Nuxt UI v4 components where they fit naturally, rather than ad hoc wrapper markup.
- Move reusable theme decisions into `project/app/app.config.ts` when they belong app-wide.
- Use component-level `:ui` overrides for local variations that should not become global defaults.
- Standardize on canonical Tailwind utility classes where inline utility composition is the right tool.
- Publish a design-system bible and AI workflow guidance so future design work stays anchored to the locked shell/dashboard system.

## Non-Goals

- No product-model or permission changes.
- No homepage redesign beyond using it as a color and tone reference.
- No large re-architecture of unrelated pages in this pass.
- No second UI library or parallel base-component system outside Nuxt UI.

## Locked Design Anchors

The following should be treated as the current source of truth:

- theater dashboard visual hierarchy and tone
- navbar structure and action framing
- account button shape, avatar treatment, and dropdown behavior

The homepage can continue to inform palette and brand tone, but it is not the authoritative source for authenticated app structure.

## Implementation Direction

### Shared primitives

- Introduce a Stage-flavored button wrapper around `UButton` for the shell and dashboard use cases.
- Introduce a shared dropdown wrapper around `UDropdownMenu` for shell menus and action lists.
- Introduce theater-page content components for repeated programming cards and grouped event rows.

### Theme boundaries

- Put stable button, card, dropdown, and navigation treatment into `project/app/app.config.ts`.
- Use local `:ui` overrides when a component needs a theater-specific or context-specific variation that should not affect the entire app.
- Avoid growing `project/app/assets/css/main.css` with page-specific selectors when the styling can live in theme config or reusable components.

### Documentation

- Add a design-system bible documenting locked anchors, primitives, tone rules, and theming boundaries.
- Add a reusable subagent brief for future Nuxt UI / design-system work.
- Update AI workflow and coding docs so design-system alignment is enforced consistently.

## Acceptance Criteria

- The theater page uses smaller reusable components instead of carrying the full presentation inline.
- Shared shell buttons and dropdowns use common primitives instead of duplicated class composition.
- Nuxt UI theme decisions are centralized where appropriate and local overrides are used intentionally.
- Repeated authenticated dashboard surfaces have clearer shared structure with less drift.
- New design documentation clearly states what is locked and how future work should extend it.
