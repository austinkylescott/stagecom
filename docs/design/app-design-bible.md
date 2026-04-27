# Stagecom App Design Bible

## Purpose

This document is the source of truth for the Stagecom app design system.

Its job is to stop drift.

When a screen, component, or agent needs a design reference, start here before inventing a new pattern.

## Active Design Authority

Start with these documents, in this order:

- `docs/specs/2026-04-12/feature-spec-app-design-reset-v1.md`
- `docs/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md`
- `docs/specs/2026-04-12/feature-spec-component-system-v1.md`
- `docs/specs/2026-04-12/stitch-translation-matrix-v1.md`

These documents are the new design authority. They replace the prior assumption that the current authenticated surfaces are the reference implementation.

## Historical Context

Use the following only as context while migrating:

- current production surfaces under `project/app/`
- April 2026 design specs under `docs/specs/2026-04-01/`
- `docs/specs/2026-04-08/feature-spec-sitemap-reset-v1.md`

These are not locked references. They are material to evaluate, replace, merge, or remove during the redesign.

## System Reference Surface

`/dev/components` must remain as the internal overview of the implemented design system.

Use it to:

- inspect every durable component and important variant
- review key page-pattern excerpts with dummy data
- verify empty, loading, and other contract states where relevant
- confirm the system still reads coherently in one place

The page should use deterministic demo data so examples remain useful regardless of the real date or backend state.

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

### 3. Use the component-system spec before preserving wrappers

Do not assume current Stage wrappers should be extended.

For each reused pattern, first decide whether it belongs in:

1. `project/app/app.config.ts`
2. component-level `:ui`
3. a small app primitive
4. a composite section
5. a page composition

Current Stage components are candidates for replacement or removal.

### 4. Layout intent must be explicit

Authenticated app structure should not be inferred from loose path matching.

Use:

1. `default` for public marketing and auth pages
2. `app` for authenticated-only work surfaces such as `/callsheet`, `/profile`, `/notifications`, `/theaters`, `/[theaterSlug]/new`, and `/[theaterSlug]/admin`
3. `hybrid` for canonical public/member pages such as `/[theaterSlug]` and `/[theaterSlug]/[eventSlug]`

Hybrid pages must work as public pages first, then reveal richer member/admin affordances when auth and permissions allow.

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

- Display headlines should use `Cubano` as the target display font and preserve the bold poster/playbill character it brings.
- Dense operational text should use `Public Sans` as the target body font and optimize for scanability.
- If a design tool cannot output those exact fonts, approximate their role and feel rather than changing the typography strategy.
- Overlines and chips are for structure, not decoration.

## Tailwind Rules

- Prefer canonical utilities over ad hoc custom class names.
- Prefer `size-*` over separate `h-*` and `w-*` when they match.
- Prefer standard spacing and sizing tokens before arbitrary values.
- Use custom classes only for true design-system concepts already repeated across the app, such as `stage-list-card` or `stage-chip`.

## Component Guidance

### Buttons

- Prefer a Nuxt UI-first implementation.
- Reintroduce an app-specific wrapper only if it adds a stable semantic API or shared behavior.
- Do not keep wrapper components whose main job is forwarding classes.

### App shell

- Desktop authenticated routes use a sidebar shell.
- Mobile authenticated routes use a bottom navigation bar with limited primary destinations.
- Primary nav should stay small: `Callsheet`, `<home theater>`, `Profile`.
- Secondary tools such as notifications and theater-admin controls should not crowd the primary nav.

### Dropdowns

- Prefer `UDropdownMenu` directly unless a smaller semantic wrapper is justified by the new component-system spec.
- Shared dropdown treatment belongs in theme config or a narrow primitive, not a broad pass-through abstraction.

### Section headers

- Repeated page-section headers should become a systemized section pattern in the new component taxonomy.
- Do not default to preserving `StageSectionHeader` by name or shape.

### Theater detail composition

- The theater dashboard owns the identity of the page.
- Upcoming shows and all-upcoming-events sections are supporting programming modules.
- Keep extracted theater detail pieces composable so other theater routes can reuse them without inheriting page-only markup.

## Design Review Questions

Before shipping a UI change, answer these:

- Does it match the locked sitemap, page archetype, and new design-reset spec?
- Did the work use Nuxt UI where it reasonably could?
- Was shared styling moved up to `app.config.ts` when appropriate?
- Did the implementation choose the correct ownership layer instead of inventing a new wrapper?
- Is Tailwind usage canonical and restrained?
- Did this reduce drift, or just move drift into a new component?
