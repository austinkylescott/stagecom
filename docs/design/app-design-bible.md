# Stagecom App Design Bible

## Purpose

This document is the source of truth for the authenticated app design system.

Its job is to stop drift.

When a screen, component, or agent needs a design reference, start here before inventing a new pattern.

## Locked References

These surfaces are the strongest current references and should be treated as design gospel:

- `project/app/components/TheaterDashboardSection.vue`
- `project/app/components/AppNav.vue`
- `project/app/components/AppAccountMenu.vue`
- `project/app/components/AppHeaderDropdown.vue`

These express the current product language most clearly:

- flat, ink-framed controls
- semantic theater / event / performer accents
- readable dashboard modules on cream surfaces
- dropdowns and account controls that feel part of the same system

## Secondary References

Use these only as supporting context:

- `project/app/pages/index.vue` for color, voice, and atmosphere
- `docs/design/v0-gap-analysis.md`
- related April 2026 specs under `docs/specs/2026-04-01/`

The homepage is not a structural source of truth for the authenticated app. It is a brand and palette reference.

## Core Rules

### 1. Nuxt UI first

Prefer Nuxt UI primitives when they fit:

- `UButton`
- `UCard`
- `UDropdownMenu`
- `UNavigationMenu`
- `UAvatar`
- `UBadge`
- `UDrawer`

Do not rebuild those from raw markup unless the component would fight the design or behavior.

### 2. Theme globally before styling locally

Use this order:

1. `project/app/app.config.ts`
2. component `:ui` overrides
3. inline Tailwind utilities
4. shared CSS in `project/app/assets/css/main.css` only for stable reusable concepts

If a styling rule should affect multiple surfaces, it belongs in `app.config.ts`.

### 3. Extend shared primitives instead of bypassing them

Use these shared app primitives first:

- `project/app/components/stage/StageButton.vue`
- `project/app/components/stage/StageDropdown.vue`
- `project/app/components/stage/StageSectionHeader.vue`

Use these theater detail components before copying page markup:

- `project/app/components/theater/detail/TheaterShowCard.vue`
- `project/app/components/theater/detail/TheaterEventDateGroup.vue`

If a new surface feels similar but not identical, prefer extending one of these rather than starting over.

## Visual Grammar

### Semantic tones

- `theater`: theater-wide context, approvals, theater destinations, community surfaces
- `event`: schedules, shows, calendars, event creation
- `performer`: account, people, cast, self-oriented or relationship-oriented actions
- `neutral`: overflow actions, generic navigation, low-priority controls

### Surface hierarchy

- Primary dashboard modules should be readable, cream-forward, and ink-framed.
- Dark or louder accent treatments should be selective, not the default wrapper for dense information.
- Alerts, boards, and action groups should feel composed rather than ornamental.

### Typography

- Display headlines use the configured display font and uppercase rhythm.
- Dense operational text stays in the sans stack and should optimize for scanability.
- Overlines and chips are for structure, not decoration.

## Tailwind Rules

- Prefer canonical utilities over ad hoc custom class names.
- Prefer `size-*` over separate `h-*` and `w-*` when they match.
- Prefer standard spacing and sizing tokens before arbitrary values.
- Use custom classes only for true design-system concepts already repeated across the app, such as `stage-list-card` or `stage-chip`.

## Component Guidance

### Buttons

- Default interactive shell button styling should go through `StageButton`.
- Button tone should match the job of the action, not just the page color.
- Account, navigation, and theater action buttons should feel related even when their content differs.

### Dropdowns

- Dropdown surfaces should use the shared Stage dropdown treatment.
- Header tone may vary by context, but content framing, row spacing, and hover behavior should stay consistent.

### Section headers

- Repeated page-section headers should use `StageSectionHeader` instead of bespoke heading wrappers.
- Pair each section title with one clear sentence about why that section exists.

### Theater detail composition

- The theater dashboard owns the identity of the page.
- Upcoming shows and all-upcoming-events sections are supporting programming modules.
- Keep extracted theater detail pieces composable so other theater routes can reuse them without inheriting page-only markup.

## Design Review Questions

Before shipping a UI change, answer these:

- Does it look like it belongs with the theater dashboard and nav/account surfaces?
- Did the work use Nuxt UI where it reasonably could?
- Was shared styling moved up to `app.config.ts` when appropriate?
- Did the implementation extend a Stage primitive instead of bypassing it?
- Is Tailwind usage canonical and restrained?
- Did this reduce drift, or just move drift into a new component?
