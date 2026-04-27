# Design System Summary

**Status:** current
**Last updated:** 2026-04-27
**Sources:** [[raw/design/app-design-bible.md]], [[raw/design/google-stitch-brief.md]], [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-component-system-v1.md]], [[raw/specs/2026-04-12/feature-spec-dev-components-reference-v1.md]], [[project/app/assets/css/main.css]], [[project/app/app.config.ts]], [[project/nuxt.config.ts]]

The current design authority is the 2026-04-12 reset/spec bundle plus the app design bible. The implemented theme tokens and Nuxt UI defaults in `project/app/assets/css/main.css` and `project/app/app.config.ts` are also part of the reference surface and should be reflected here.

## Stable Visual Rules

- Nuxt UI first
- semantic color mapping:
  - theater = mint
  - event = amber
  - performer = coral
- cream/paper-forward surfaces with ink framing
- display typography should be poster-like; operational text should be highly readable
- square corners are the default for system UI
- borders and shadows are part of the visual language, not incidental styling

## Design Tokens

### Typography

- Display font token: `--font-display`
  - stack: `"Cubano", "Bebas Neue", "Impact", sans-serif`
  - intended use: page titles, section titles, alert titles, major poster/playbill moments
- Body font token: `--font-sans`
  - stack: `"Public Sans", sans-serif`
  - intended use: operational body copy, forms, lists, navigation, and dense UI
- Serif token: `--font-serif`
  - stack: `"Merriweather", serif`
  - intended use: editorial or longform support copy only
- Monospace token: `--font-mono`
  - stack: `"JetBrains Mono", monospace`
  - intended use: code and technical reference surfaces
- Font loading:
  - `Cubano` is self-hosted from `/fonts/Cubano.ttf`
  - `Public Sans`, `Bebas Neue`, `Merriweather`, and `JetBrains Mono` are configured globally in `project/nuxt.config.ts`

### Core Light Tokens

- `--stage-ink`: `#2b2926`
- `--stage-ink-soft`: `#4b4842`
- `--stage-paper`: `#f5efe2`
- `--stage-paper-strong`: `#efe3cd`
- `--stage-paper-muted`: `#d8ccb5`
- `--stage-cream`: `#fbf7ef`
- `--stage-theater`: `#82bfb6`
- `--stage-theater-soft`: `#cfe7e3`
- `--stage-event`: `#eaa542`
- `--stage-event-soft`: `#f4d7aa`
- `--stage-performer`: `#c76056`
- `--stage-performer-soft`: `#e8b3ac`

### Core Dark Tokens

- `--stage-ink`: `#ede7dd`
- `--stage-ink-soft`: `#b8ad9e`
- `--stage-paper`: `#2a2623`
- `--stage-paper-strong`: `#201d1a`
- `--stage-paper-muted`: `#38332e`
- `--stage-cream`: `#1a1714`
- `--stage-theater`: `#7db8af`
- `--stage-theater-soft`: `#2d4541`
- `--stage-event`: `#dea03f`
- `--stage-event-soft`: `#3a2e18`
- `--stage-performer`: `#d4706a`
- `--stage-performer-soft`: `#3d2522`

### Semantic Surface Tokens

- `--color-stage-surface-theater`
  - light mix: theater 26% into white
  - dark mix: theater 18% into cream
- `--color-stage-surface-event`
  - light mix: event 18% into white
  - dark mix: event 14% into cream
- `--color-stage-surface-performer`
  - light mix: performer 16% into white
  - dark mix: performer 12% into cream
- `--color-stage-surface-paper`
  - light mix: paper 88% into white
  - dark mix: paper 88% into cream
- `--color-stage-surface-paper-strong`
  - light mix: paper 96% into white
  - dark mix: paper 96% into cream
- `--color-stage-surface-chip`
  - light mix: cream 84% into white
  - dark mix: cream 84% into paper

### Semantic Tone Mapping

- `theater`
  - meaning: theater-wide identity, community, approvals, dashboards, theater destinations
  - base hex: `#82bfb6`
  - Nuxt UI mapping: `primary` and `info`
- `event`
  - meaning: shows, calendars, schedules, event creation, programming
  - base hex: `#eaa542`
  - Nuxt UI mapping: `warning` and `success`
- `performer`
  - meaning: people, cast, performer identity, relationship-oriented actions
  - base hex: `#c76056`
  - Nuxt UI mapping: `error`
- `neutral`
  - meaning: generic navigation, low-priority controls, overflow actions
  - base treatment: ink-driven rather than accent-driven

## Implemented Defaults

### Shape, Border, And Shadow

- Corners are generally square via `rounded-none`.
- Primary framed surfaces use `3px` ink borders.
- Buttons and smaller controls typically use `2px` ink borders.
- Standard shadow token: `--stage-shadow = 8px 8px 0 0 var(--stage-ink)`.
- Small shadow token: `--stage-shadow-sm = 5px 5px 0 0 var(--stage-ink)`.
- Cards, dropdowns, alerts, and table-like surfaces use hard-edged offset shadows rather than soft blur.

### Background And Atmosphere

- Light mode body background is layered rather than flat:
  - gold tint at top left
  - blue tint at top right
  - coral tint near lower center
  - cream-to-paper vertical gradient
- Dark mode preserves the same structure with lower saturation and darker paper values.
- Selection highlight uses a theater-tinted mix rather than browser default blue.

### Motion

- Base interaction timing is `160ms` ease for color, background, border, shadow, and transform changes.
- Buttons use a small upward hover shift and return on active.
- Motion should feel tactile and quick, not floaty.

### Nuxt UI Component Defaults

- `UButton`
  - uppercase labels with strong tracking
  - square corners, `2px` ink border, semantic tone-based fills
  - `link` variant is borderless and underlined
- `UCard`
  - square corners, `3px` ink border, paper-strong background, hard offset shadow
- `UInput`, `UTextarea`, `USelect`
  - outline variant is the default
  - paper-strong background, `2px` inset ink ring
  - coral focus ring
- `UBadge`
  - `soft` is the default variant
  - uppercase, bold, framed treatment
  - semantic backgrounds use theater/event/performer/paper surfaces
- `UDropdownMenu` and `UNavigationMenu`
  - paper backgrounds, `3px` ink borders, square corners, hard offset shadows
  - item highlighting uses paper/theater semantic hover treatment rather than gray menus
- `UAlert`
  - display-font titles and framed paper surface

## Shared CSS Primitives

These classes are durable primitives and are safe reference points for future UI work:

- `stage-frame`
- `stage-panel`
- `stage-panel-dark`
- `stage-dark-inset`
- `stage-panel-accent`
- `stage-message`
- `stage-kicker`
- `stage-title`
- `stage-section-title`
- `stage-overline`

When a new shared primitive is introduced in CSS, it should represent a repeated concept at the system layer, not a one-off page treatment.

## Ownership Hierarchy

1. `app.config.ts`
2. component `:ui` overrides
3. inline Tailwind utilities
4. shared CSS only for durable tokens/primitives

Use this hierarchy for all future design changes. If a styling rule appears in multiple routes, it should usually move upward rather than being duplicated locally.

## Current-System Decision

The old Stage wrapper system is not assumed to be the target. Existing wrappers survive only if the new component taxonomy gives them a clear job.

## Internal Reference Surface

`/dev/components` is required as a permanent internal reference page. It should document the implemented system with deterministic sample data rather than invent design direction ad hoc.

It should cover, at minimum:

- token usage and semantic tones
- Nuxt UI primitives as configured in the app
- app-specific primitives that survive the redesign
- composite sections and page-pattern excerpts
- empty, loading, success, and error states where those states are part of the contract

## What The Wiki Should Capture

The design wiki should record durable facts the implementation and future agents need to reference quickly:

- exact token names and hex values
- font choices and fallback stacks
- semantic tone meanings
- layout ownership rules
- component defaults that are already encoded in theme files
- route and archetype expectations that affect UI composition

It should not stop at high-level adjectives once implementation-backed decisions already exist.

## Related
- [[wiki/design/surface-map]]
- [[wiki/design/page-archetypes]]
- [[wiki/decisions/nuxt-ui-v4-only]]
