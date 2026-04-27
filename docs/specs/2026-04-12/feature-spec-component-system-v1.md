# Feature Spec: Component System v1

## Status

Draft

## Summary

Define the frontend ownership boundaries for the redesign so the next implementation pass does not recreate today's overlap between theme config, wrappers, page-specific patterns, and design tokens.

## System Layers

### 1. Theme layer

Files:

- `project/app/app.config.ts`
- `project/app/assets/css/main.css`

Responsibilities:

- global Nuxt UI styling decisions
- color, typography, spacing, radius, and elevation tokens
- a very small set of durable app-wide CSS primitives when Nuxt UI and utilities are insufficient

Not allowed:

- page-specific layout fixes
- route-specific visual language
- one-off composite classes that encode product structure

### 2. Primitive layer

Files:

- new app-specific primitive components, only if justified

Responsibilities:

- thin, reusable wrappers when the app needs a consistent behavior or semantic API not provided cleanly by Nuxt UI alone

Allowed examples:

- semantic action button wrapper if the redesign still needs one
- shared shell/navigation trigger
- shared entity status chip

Not allowed:

- wrappers whose only job is forwarding classes to Nuxt UI
- broad visual abstractions that hide page structure

### 3. Composite section layer

Files:

- reusable sections for repeated product modules

Responsibilities:

- page sections such as shell header bands, entity hero blocks, program lists, inbox rows, settings groups, or event schedule modules
- semantic composition of primitives and Nuxt UI components

Not allowed:

- page-specific business logic that belongs in a page composition or composable
- global style ownership that belongs in the theme layer

### 4. Page composition layer

Files:

- route pages and their direct page-level compositions

Responsibilities:

- page structure
- route-specific data wiring
- choosing which composite sections appear and in what order

Not allowed:

- reimplementing system primitives locally
- introducing page-local design dialects

## Current-System Decisions

These current pieces are not automatically preserved:

- `project/app/components/stage/StageButton.vue`
- `project/app/components/stage/StageDropdown.vue`
- `project/app/components/StageSection.vue`
- `project/app/components/StageFeatureCard.vue`
- `project/app/components/StageStackedBoard.vue`
- `project/app/components/AuthenticatedAppShell.vue`
- `project/app/components/app-shell/*`

Each must be classified in the rebuild as one of:

- replace with direct Nuxt UI usage
- replace with a smaller primitive
- replace with a higher-level composite
- delete with no successor

## Rules For The Rebuild

### Nuxt UI first

Prefer `UButton`, `UCard`, `UDropdownMenu`, `UNavigationMenu`, `UFormField`, `UInput`, `UTextarea`, `USelect`, `UAvatar`, `UBadge`, `UTabs`, `UDrawer`, and similar primitives before inventing app-specific base components.

### Semantic APIs only when they reduce ambiguity

If a reusable app-specific component exists, its public API should express product semantics rather than freeform class passthroughs.

### Shared CSS stays small

`project/app/assets/css/main.css` should end the redesign with tokens and a small set of truly reusable primitives, not a second template language.

### Internal reference page is downstream

`/dev/components` documents the implemented system after decisions are made. It must not become the place where the system is invented ad hoc.

It must remain comprehensive enough to review the whole system in one place, including:

- theme tokens
- primitives
- composite sections
- important page-pattern excerpts
- variant, empty, loading, error, and success states where those states are part of the design contract
- deterministic sample data that does not break as the real date moves forward

Use `docs/specs/2026-04-12/feature-spec-dev-components-reference-v1.md` as the detailed coverage contract for this page.

### Route-coupled composites should follow the flatter sitemap

When naming or extracting page compositions, align to the canonical route model:

- theater collection at `/theaters`
- theater overview at `/{theaterSlug}`
- theater admin at `/{theaterSlug}/admin`
- event creation at `/{theaterSlug}/new`
- event overview at `/{theaterSlug}/{eventSlug}`

Do not keep older `theater/.../event/...` nesting assumptions in new component naming or ownership.

### Demo coverage is part of the contract

When a durable component or pattern is added to the design system, add or update its `/dev/components` demo coverage in the same change unless there is a clear reason not to.

## Acceptance Criteria

- Every repeated design concern has one clear owning layer.
- The rebuild can remove most class-forwarding wrappers.
- The next implementation pass can classify existing Stage components without ambiguity.
