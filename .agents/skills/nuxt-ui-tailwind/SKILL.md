---
name: nuxt-ui-tailwind
description: Use when working on Nuxt 4 interfaces built with Nuxt UI v4 and Tailwind CSS. Prioritize Nuxt UI components over custom markup, prefer sitewide theme changes in app.config.ts, then component-level :ui overrides, and use inline Tailwind only as a last resort. Prefer canonical Tailwind utility classes over custom CSS classes unless the styling is truly reusable across the app.
---

# Nuxt UI v4 + Tailwind Workflow

Use this skill when editing UI in `project/app/` that should follow Nuxt UI v4 and Tailwind CSS best practices.

## Priorities

Follow this order unless there is a concrete reason not to:

1. Use an existing Nuxt UI component.
2. Adjust the sitewide theme in `project/app/app.config.ts`.
3. Use component-level `:ui` overrides for page- or component-specific tailoring.
4. Use inline Tailwind utilities in templates.
5. Add or extend custom CSS in `project/app/assets/css/main.css` only when the pattern is truly shared and repeated.

Do not jump straight to raw divs plus Tailwind when a Nuxt UI primitive already fits.

## Nuxt UI Rules

- Prefer `UButton`, `UCard`, `UBadge`, `UInput`, `USelect`, `UTable`, `UTabs`, `UFormField`, `UTextarea`, `UDropdownMenu`, `UPopover`, and related Nuxt UI primitives for app surfaces.
- Check whether a styling concern belongs in `project/app/app.config.ts` before adding per-instance classes.
- Use `:ui` for local shape, spacing, slot, or variant adjustments when the change should not affect the whole app.
- Keep overrides slot-oriented. Match Nuxt UI’s component structure instead of fighting it with wrapper divs.
- When a page repeats a visual module, prefer a reusable component or theme override over copied `:ui` objects.

## Tailwind Rules

- Prefer canonical utility classes directly in templates: spacing, layout, typography, borders, sizing, flex/grid, and color utilities.
- Avoid inventing custom semantic classes when a one-off or local layout can be expressed with normal Tailwind utilities.
- Avoid custom CSS for things Tailwind already expresses cleanly.
- Treat custom classes as design-system primitives, not as a substitute for utility composition.
- When using arbitrary values, first check whether a standard Tailwind token already works.

## CSS Rules

- `project/app/assets/css/main.css` should contain shared tokens and reusable cross-page primitives, not page-specific fixes.
- Add a custom class only if at least one of these is true:
  - the pattern is repeated across multiple screens
  - the selector needs pseudo-elements or media-query behavior that is awkward inline
  - the styling represents a stable design-system concept
- If a custom class is added, keep it small and generic enough to be reused.

## Expected Workflow

For each UI task:

1. Inspect the existing page and identify which parts can map to Nuxt UI components.
2. Check `project/app/app.config.ts` for an existing theme pattern to extend.
3. Use `:ui` overrides where the page needs a local variation.
4. Use canonical Tailwind utilities for local layout and composition.
5. Only then add shared CSS primitives if repetition justifies it.

## Review Checklist

Before finishing, verify:

- A Nuxt UI component was used wherever it reasonably could be.
- Global theme changes went into `project/app/app.config.ts` when they should affect multiple surfaces.
- `:ui` overrides were used instead of ad hoc wrapper styling when local component customization was enough.
- Inline Tailwind uses canonical utilities rather than avoidable custom classes.
- No new custom CSS class was introduced without a reuse case.
- Build still passes with `npm run build` from `project/`.
