# Stagecom V0 Reference Gap Analysis

Reference artifacts:

- `docs/design/stagecom-v0-reference-desktop-full.png`
- `docs/design/stagecom-v0-reference-mobile-full.png`
- `docs/design/stagecom-v0-reference-structure.md`

Current implementation surfaces reviewed:

- `project/app/pages/index.vue`
- `project/app/layouts/default.vue`
- `project/app/components/AppNav.vue`
- `project/app/assets/css/main.css`
- `project/app/pages/theaters/index.vue`
- `project/app/components/HomeTheaterHero.vue`
- `project/app/components/TheaterCard.vue`
- `project/app/pages/theaters/[slug]/index.vue`
- `project/app/pages/shows/index.vue`
- `project/app/pages/theaters/[slug]/shows/[id].vue`
- `project/app/app.config.ts`
- `project/nuxt.config.ts`

## Summary

The current app is a functional skeleton built on mostly default Nuxt UI patterns. The V0 reference is a branded product system with strong visual identity, tighter hierarchy, and deliberate marketing-to-product continuity.

The gap is not mainly about adding decoration. It is about introducing a coherent visual system across:

- typography
- color
- borders and surfaces
- spacing rhythm
- page section structure
- information density
- role-aware product framing

If the goal is to make the current product feel closer to the V0 reference, the first work should be foundational theme and layout changes, not isolated page polish.

## Major Gaps

### 1. Brand system is not present in the current app

Reference:

- heavy use of `#2B2926` as the structural black
- saturated warm accents
- thick borders
- strong contrast between light and dark sections
- headline styling with clear visual personality

Current app:

- [`main.css`](/Users/austinscott/Code/stagecom/project/app/assets/css/main.css) only sets default fonts
- [`app.config.ts`](/Users/austinscott/Code/stagecom/project/app/app.config.ts) does not theme Nuxt UI components
- current pages rely on stock card, badge, and button presentation

Impact:

- the app reads as an internal prototype instead of a product with point of view
- the V0 reference has a recognizable identity; the current app does not

### 2. Typography is pointed in the wrong direction

Reference:

- compact, high-impact display typography
- stronger visual contrast between headline and body copy
- type used as layout material, not just text styling

Current app:

- [`nuxt.config.ts`](/Users/austinscott/Code/stagecom/project/nuxt.config.ts) and [`main.css`](/Users/austinscott/Code/stagecom/project/app/assets/css/main.css) use `Space Grotesk`, `Silkscreen`, and `Merriweather`
- `Silkscreen` and `Space Grotesk` are not aligned with the desired brutalist/community direction you described
- `Cubano` is not represented in the codebase yet

Impact:

- even if colors were updated, the app would still not feel like the V0 reference

### 3. Layout is app-shell generic rather than designed

Reference:

- strong horizontal section rhythm
- alternating light and dark bands
- intentional framing of each product story block
- hero and product areas have clear “poster panel” composition

Current app:

- [`default.vue`](/Users/austinscott/Code/stagecom/project/app/layouts/default.vue) wraps everything in a single `UContainer` with uniform `py-8`
- most pages are vertical stacks of cards inside the same width and spacing logic
- there is no section-based composition system

Impact:

- every page feels operationally similar, even when the content should carry different weight

### 4. Navigation has no strong product identity

Reference:

- top bar is visually integrated into the branded system
- the nav feels like part of the same poster/grid language as the rest of the page

Current app:

- [`AppNav.vue`](/Users/austinscott/Code/stagecom/project/app/components/AppNav.vue) uses a standard `UHeader` with default presentation
- the title is plain text
- no custom header rhythm, no visible brand framing, no distinctive CTA treatment

Impact:

- first impression remains generic even before the content loads

### 5. Homepage is placeholder copy instead of product narrative

Reference:

- clear story arc: community-first hero, problem framing, feature grid, role framing, product concept, principles, closing CTA

Current app:

- [`index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/index.vue) is explicitly a “Walking skeleton”
- it communicates mechanics, not product value
- it does not reflect the theater/community positioning in the reference

Impact:

- the product direction is invisible unless someone already understands the repo

### 6. Product pages are clean but visually flat

Reference:

- cards feel like modules in a branded system
- high-value data is framed with stronger labels, state chips, and section contrast
- mockups emphasize casting, lineup, review, and notifications as product centerpieces

Current app:

- [`theaters/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/index.vue), [`theaters/[slug]/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/[slug]/index.vue), [`shows/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/shows/index.vue), and [`theaters/[slug]/shows/[id].vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/[slug]/shows/[id].vue) all use sensible but plain card stacks
- state is present, but not visually prioritized
- casting and theater management exist functionally, but do not yet look like the product center of gravity

Impact:

- the core workflows do not feel as important or usable as they should

## Page-Level Notes

### Home

Current:

- single card
- internal-product copy
- no visual hierarchy beyond default card header

Target direction:

- replace with a real landing page that borrows the V0 structure
- use alternating section backgrounds
- make casting, theater ops, and community connection the core story

Primary files:

- [`index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/index.vue)
- [`default.vue`](/Users/austinscott/Code/stagecom/project/app/layouts/default.vue)
- [`AppNav.vue`](/Users/austinscott/Code/stagecom/project/app/components/AppNav.vue)

### Theater discovery

Current:

- useful data model and actions
- visual treatment is standard app UI
- home-theater module is functionally strong but not visually memorable

Target direction:

- treat the home-theater area as a flagship panel
- use larger labels, stronger stats treatment, and more deliberate grouping
- make theater cards feel like venue/community objects, not generic list rows

Primary files:

- [`theaters/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/index.vue)
- [`HomeTheaterHero.vue`](/Users/austinscott/Code/stagecom/project/app/components/HomeTheaterHero.vue)
- [`TheaterCard.vue`](/Users/austinscott/Code/stagecom/project/app/components/TheaterCard.vue)

### Theater detail

Current:

- good data summary
- plain card header followed by public show grid

Target direction:

- make the theater header feel like a venue identity panel
- separate community metadata, management actions, and public programming more clearly
- apply stronger visual emphasis to review state and operational controls

Primary file:

- [`theaters/[slug]/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/[slug]/index.vue)

### Shows index

Current:

- useful operational page
- calendar is low-emphasis and visually repetitive
- upcoming shows list is functional but not distinctive

Target direction:

- elevate the upcoming/casting-heavy items visually
- make dates and statuses scan faster
- let the page feel more like a programming board than a default dashboard

Primary file:

- [`shows/index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/shows/index.vue)

### Show detail

Current:

- strong functionality already exists
- information architecture is reasonable
- presentation is a sequence of neutral cards

Target direction:

- this should become one of the most designed pages in the app
- casting summary, status, actions, schedule, and lineup should feel like explicit operational modules
- state chips, panel borders, labels, and spacing should reinforce producer workflow importance

Primary file:

- [`theaters/[slug]/shows/[id].vue`](/Users/austinscott/Code/stagecom/project/app/pages/theaters/[slug]/shows/[id].vue)

## Recommended Implementation Order

### Phase 1. Foundation

Do this first, otherwise page work will drift:

- add design tokens and CSS custom properties in [`main.css`](/Users/austinscott/Code/stagecom/project/app/assets/css/main.css)
- introduce the brand palette:
  - `#2B2926`
  - `#EAA542`
  - `#82BFB6`
  - `#C76056`
- replace current font direction with brand-aligned typography, including `Cubano` for display moments if licensing/setup is available
- configure global Nuxt UI styling in [`app.config.ts`](/Users/austinscott/Code/stagecom/project/app/app.config.ts)
- redesign the app shell in [`default.vue`](/Users/austinscott/Code/stagecom/project/app/layouts/default.vue)
- redesign the header in [`AppNav.vue`](/Users/austinscott/Code/stagecom/project/app/components/AppNav.vue)

### Phase 2. Marketing / Entry surface

- replace the homepage with a V0-aligned narrative version
- create reusable section wrappers for light/dark banding, framed panels, and brutalist cards
- establish the visual language that product pages will inherit

Primary file:

- [`index.vue`](/Users/austinscott/Code/stagecom/project/app/pages/index.vue)

### Phase 3. Product-center pages

These matter most because they align with the product center of gravity:

- show detail
- theaters index
- theater detail
- shows index

### Phase 4. Secondary consistency pass

- profile
- notifications
- review inbox
- performers directory
- auth pages

## Concrete Design Moves

These are the most direct changes to close the gap.

### Surfaces

- move from soft rounded SaaS cards to sharper, heavier framed panels
- reduce overuse of pale slate borders
- use black structure lines more consistently
- alternate cream/light and dark sections at the page level

### Buttons and badges

- make primary CTAs denser and more graphic
- use accent blocks, stronger borders, and more contrast
- standardize state badge styling so status reads immediately

### Spacing

- increase contrast between macro spacing and micro spacing
- use bigger sectional breaks
- keep dense data modules tight inside larger framed containers

### Labels

- add more eyebrow labels, module labels, and small utility captions
- this is a major part of the V0 rhythm

### Data emphasis

- make dates, cast counts, status, and review state more prominent
- current screens often place important workflow data at the same visual priority as supporting copy

### Mobile

- preserve the strong stacked-card rhythm from the V0 mobile reference
- avoid default responsive collapse patterns that make everything feel the same

## What To Keep From The Current App

The current app is not wrong. It already has useful structure worth preserving:

- the route and data architecture is sensible
- show detail page information architecture is good
- theater discovery already has strong functional concepts like home theater
- the app is readable and not intimidating

The right move is not a total rewrite. It is to keep the functional structure and replace the visual system around it.

## Recommended Next Task

If the goal is to start implementation, the best first slice is:

1. redesign global theme and shell
2. replace homepage with the V0-inspired landing page
3. restyle theater list + home theater hero
4. restyle show detail

That sequence establishes the system before trying to polish every page.
