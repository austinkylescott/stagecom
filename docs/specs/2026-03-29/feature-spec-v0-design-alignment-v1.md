# Feature Spec: V0 Design Alignment v1 (Stagecom)
Derived from PRD v0.2 (Locked)

---

## Summary
Align the current Stagecom frontend with the approved V0 design direction captured in the design brief, screenshots, and gap analysis.

This feature is a visual-system and product-surface redesign, not a product-model rewrite. The goal is to preserve the current app's functional structure while introducing a coherent branded experience that better reflects Stagecom as both:

- a theater operations tool for managers, staff, and producers
- a community hub that performers want to use

The work should follow the implementation order already agreed:

1. global theme and shell
2. homepage rewrite to match the V0 direction
3. theater list + home theater hero
4. show detail restyle

---

## Goals

- Bring the frontend materially closer to the V0 reference direction
- Establish a reusable visual system instead of page-by-page ad hoc styling
- Emphasize casting, lineup clarity, theater management, and operational workflows
- Preserve readability and approachability despite the stronger brutalist visual direction
- Keep the existing product behavior intact unless a specific UX adjustment is required to better express current features

---

## Non-Goals

- Change the PRD, role model, or data model
- Introduce new backend features or schema changes
- Add ticketing, payroll, or other out-of-scope product areas
- Fully redesign every page in the application during the first pass
- Treat the V0 reference as pixel-perfect source code to reproduce exactly

---

## Source Of Truth

### Product / repo rules
- `docs/product/PRD.md`
- `docs/data/data-model.md`
- `docs/development/coding-rules.md`
- `docs/development/ai-interaction.md`

### Design direction
- `docs/design/google-stitch-site-brief.md`
- `docs/design/stagecom-v0-reference-desktop-full.png`
- `docs/design/stagecom-v0-reference-mobile-full.png`
- `docs/design/stagecom-v0-reference-structure.md`
- `docs/design/v0-gap-analysis.md`

### Primary implementation surfaces
- `project/app/assets/css/main.css`
- `project/app/app.config.ts`
- `project/app/layouts/default.vue`
- `project/app/components/AppNav.vue`
- `project/app/pages/index.vue`
- `project/app/pages/theaters/index.vue`
- `project/app/components/HomeTheaterHero.vue`
- `project/app/components/TheaterCard.vue`
- `project/app/pages/theaters/[slug]/index.vue`
- `project/app/pages/shows/index.vue`
- `project/app/pages/theaters/[slug]/shows/[id].vue`
- `project/nuxt.config.ts`

---

## Problem Statement

The current app is functionally solid but visually under-expressive. It reads as a working internal skeleton built on mostly default Nuxt UI patterns.

The V0 reference demonstrates a clearer product point of view:

- stronger brand identity
- bolder typography and contrast
- a more memorable shell and navigation system
- better section rhythm and module framing
- clearer emphasis on the workflows that matter most: casting, lineup management, approvals, and theater operations

Without a deliberate design-system pass, future page work will continue to drift and the product will remain structurally useful but visually generic.

---

## Product Positioning To Preserve

The redesign must reinforce these product truths:

- Stagecom is built for improv theaters first, but can naturally extend to broader performance communities
- roles are contextual, not global
- producers are never assumed to be cast
- cast membership is explicit
- privacy and theater oversight matter
- the product reduces off-platform coordination
- performers should feel that the product is for them too, not just administrators

---

## Design Direction

### Overall tone
- community-first
- neighborhood-local
- scrappy in a capable way
- warm, clear, and confident
- culturally alive without becoming chaotic

### Visual language
- fun brutalist direction
- strong black structural framing using `#2B2926`
- brand accents:
  - `#EAA542`
  - `#82BFB6`
  - `#C76056`
- thick borders
- poster-like modular composition
- alternating light and dark sections where appropriate
- strong information hierarchy

### Typography
- Cubano for high-impact brand or headline moments when available
- a clean, highly legible supporting typeface for body and UI
- avoid drifting back to generic SaaS type choices

### UX guardrails
- do not make the product intimidating to use
- preserve scanability on dense operational pages
- mobile layouts should feel intentionally stacked, not just collapsed

---

## Feature Scope

This feature is intentionally broken into four implementation phases.

### Phase 1. Global Theme And Shell

Purpose:
Create the visual foundation that all later page work will inherit.

Required work:

- add reusable design tokens and CSS custom properties in `project/app/assets/css/main.css`
- define the core brand palette and structural colors
- establish the new typography direction
- configure Nuxt UI defaults in `project/app/app.config.ts` where it improves consistency
- redesign `project/app/layouts/default.vue`
- redesign `project/app/components/AppNav.vue`
- update `project/nuxt.config.ts` only if font or theme setup requires it

Expected outcome:

- the app no longer feels like default Nuxt UI
- shell, nav, spacing, borders, and surface treatment establish the product identity before deeper page redesigns

### Phase 2. Homepage Rewrite

Purpose:
Replace the current placeholder homepage with a product-facing landing surface aligned to the V0 reference.

Required work:

- replace the “Walking skeleton” content in `project/app/pages/index.vue`
- build a real story arc that reflects the approved design brief
- communicate:
  - community-first positioning
  - problem framing
  - feature emphasis
  - role-based value
  - product concept previews
  - trust / principles

Expected outcome:

- the homepage communicates what Stagecom is and why it exists
- the page feels consistent with the shell and visual system from Phase 1

### Phase 3. Theater Discovery Surfaces

Purpose:
Bring the theater discovery experience closer to the reference direction and make theater/community context feel more tangible.

Required work:

- restyle `project/app/pages/theaters/index.vue`
- restyle `project/app/components/HomeTheaterHero.vue`
- restyle `project/app/components/TheaterCard.vue`
- if needed, lightly align `project/app/pages/theaters/[slug]/index.vue` with the new system so the flow from browse to theater detail remains coherent

Expected outcome:

- home theater becomes a stronger flagship panel
- theater cards feel more like venue/community objects
- operational actions remain obvious without reverting to generic utility styling

### Phase 4. Show Detail Restyle

Purpose:
Make the show detail surface feel like one of the product’s core operational screens.

Required work:

- restyle `project/app/pages/theaters/[slug]/shows/[id].vue`
- visually prioritize:
  - show status
  - cast count and cast range
  - producer actions
  - lineup / program access
  - schedule
  - cast management

Expected outcome:

- show detail becomes a strong expression of the product’s center of gravity
- the page feels intentionally designed for producer workflow, not just data display

---

## Design Rules For Implementation

### Reuse over one-off styling
- Prefer reusable classes, shared tokens, and repeatable layout patterns
- Avoid embedding unrelated one-off visual decisions in individual pages

### Product continuity
- The marketing-facing homepage and logged-in surfaces should feel like the same product family
- Do not make the homepage highly branded while leaving the app shell generic

### Operational clarity
- Dense screens must remain readable
- Status, dates, counts, and action areas should become easier to scan, not harder

### Respect existing behavior
- Do not break auth flow, theater membership flow, show detail behavior, or cast logic during visual changes
- Keep the PRD and data-model invariants intact

---

## Acceptance Criteria

- A reusable visual foundation exists in the app for colors, typography, borders, and spacing
- The shell and navigation are recognizably aligned with the V0 direction
- The homepage is no longer placeholder content and reflects the approved product/design brief
- Theater discovery surfaces feel materially closer to the V0 reference than the current default-card implementation
- Show detail is visually elevated and clearly centered on operational workflow
- The redesigned surfaces remain readable on mobile and desktop
- Existing functional behavior remains intact unless an intentional UX refinement is documented during implementation
- `npm run build` passes before the feature is considered complete

---

## Suggested Work Order

1. Implement the global visual foundation in `main.css`, `app.config.ts`, `default.vue`, `AppNav.vue`, and supporting font config.
2. Replace the homepage with the V0-inspired narrative landing page.
3. Restyle theater discovery and home theater surfaces.
4. Restyle show detail.
5. Run build verification and do a final cross-page consistency pass.

---

## Risks

- If theme decisions are made too locally, later pages will drift instead of converging
- A more aggressive visual direction can hurt usability if spacing, contrast, and data hierarchy are not handled carefully
- Font availability may constrain full fidelity to the brief unless a brand-approved fallback is chosen
- It is easy to over-focus on the homepage and under-deliver on the logged-in product surfaces

---

## Open Questions For Implementation

- How should Cubano be introduced if a licensed or repo-approved font asset is not yet available locally?
- Should the same shell treatment apply to both anonymous and authenticated routes, or should the homepage use a looser variation on the same system?
- Which secondary pages should receive light consistency updates during this feature if visual drift becomes obvious after Phases 1-4?

---

## Accompanying Reference Files

### Design inputs
- `docs/design/google-stitch-site-brief.md`
- `docs/design/stagecom-v0-reference-desktop-full.png`
- `docs/design/stagecom-v0-reference-mobile-full.png`
- `docs/design/stagecom-v0-reference-structure.md`
- `docs/design/v0-gap-analysis.md`

### Current implementation targets
- `project/app/assets/css/main.css`
- `project/app/app.config.ts`
- `project/app/layouts/default.vue`
- `project/app/components/AppNav.vue`
- `project/app/pages/index.vue`
- `project/app/pages/theaters/index.vue`
- `project/app/components/HomeTheaterHero.vue`
- `project/app/components/TheaterCard.vue`
- `project/app/pages/theaters/[slug]/index.vue`
- `project/app/pages/shows/index.vue`
- `project/app/pages/theaters/[slug]/shows/[id].vue`
- `project/nuxt.config.ts`
