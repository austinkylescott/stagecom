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

- `project/app/components/theater/detail/TheaterUpcomingCard.vue`
- `project/app/components/theater/detail/TheaterEventDateGroup.vue`

If a new surface feels similar but not identical, prefer extending one of these rather than starting over.

## Visual Grammar

### Semantic color mapping

Stagecom uses a fixed semantic color system across the authenticated app. These meanings are not interchangeable.

- `theater` uses the mint blue theater color: `#82bfb6`
- `event` / `show` uses the yellow event color: `#eaa542`
- `performer` / `people` / relationship-oriented surfaces use the red performer color: `#c76056`

These map to the shared tokens already defined in `project/app/assets/css/main.css`:

- `--stage-theater` = `#82bfb6`
- `--stage-event` = `#eaa542`
- `--stage-performer` = `#c76056`

When choosing accents, chips, section wrappers, button tones, markers, or badges:

- theater-wide context, theater dashboards, approvals, and theater destinations use mint blue
- shows, schedules, calendars, and event-programming surfaces use yellow
- people, cast, performer identity, and relationship-driven actions use red

Do not swap these meanings for variety. Semantic consistency matters more than local novelty.

### Semantic tones

- `theater`: theater-wide context, approvals, theater destinations, community surfaces
- `event`: schedules, shows, calendars, event creation
- `performer`: account, people, cast, self-oriented or relationship-oriented actions
- `neutral`: overflow actions, generic navigation, low-priority controls

### Surface hierarchy

- Primary dashboard modules should be readable, cream-forward, and ink-framed.
- Dark or louder accent treatments should be selective, not the default wrapper for dense information.
- Alerts, boards, and action groups should feel composed rather than ornamental.

### Semantic surface variants

Use semantic surface variants instead of passing raw color strings into components.

The shared surface vocabulary is:

- `theater`: mint-leaning dashboard and community summary surfaces
- `event`: yellow-leaning programming and schedule surfaces
- `performer`: red-leaning people or relationship surfaces
- `paper`: neutral cream-forward supporting surfaces

These variants should resolve through shared theme tokens in `project/app/assets/css/main.css`, not ad hoc `rgba(...)` values at call sites.

For reusable components, prefer a semantic prop such as `surfaceTone="theater"` over a freeform class prop like `surfaceClass`.

If a new surface tone is needed:

1. add the token to the shared theme layer
2. document the meaning here
3. expose it through a semantic variant or prop

Do not introduce one-off arbitrary color strings in page templates when a semantic surface already exists.

### Tone workflow for new components

When building a new reusable component that needs color or surface control, use this sequence:

1. Decide the semantic meaning first.
   Choose whether the component is `theater`, `event`, `performer`, or `paper`.

2. Check whether the need belongs to a Nuxt UI primitive.
   If the component is fundamentally a `UButton`, `UBadge`, `UCard`, `UInput`, or similar primitive, prefer expressing the tone in `project/app/app.config.ts`.

3. If it is an app-specific composite component, expose a semantic prop.
   Use a prop such as `surfaceTone`, `tone`, or `accentTone` rather than a freeform class string.

4. Map that semantic prop to shared theme tokens.
   Resolve the prop inside the component to shared theme-backed classes from `project/app/assets/css/main.css`.

5. Only add a new semantic token when the existing set is insufficient.
   If none of `theater`, `event`, `performer`, or `paper` is correct, add a new token in the shared theme layer first, then document its meaning here.

6. Keep call sites semantic.
   Page templates should say what the component means, for example `surface-tone="event"`, not how to paint it with ad hoc utility strings.

7. Verify the result against nearby surfaces.
   Make sure the new component still looks like it belongs with the authenticated app and does not introduce a local color dialect.

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
