# Google Stitch Prompt: Stagecom App Redesign v2

Design a multi-page web application for **Stagecom**, a community management platform for improv theaters.

This should feel like a real product for live-performance communities, not a generic SaaS dashboard and not a landing-page-only concept.

## Core brief

Stagecom helps theaters, producers, performers, and theater staff coordinate:

- theater identity and programming
- show and event creation
- scheduling and callsheets
- cast and producer context
- notifications
- profile and account context

Roles are contextual, not global:

- performer
- producer
- theater manager
- theater staff
- theater member

Producers are **not** automatically performers. Cast membership should feel explicit.

## Aesthetic direction

The design should feel:

- theatrical
- editorial
- tactile
- sharp and intentional
- warm rather than cold
- expressive without becoming messy

It should combine:

- the clarity of a modern product app
- the personality of venue posters, playbills, rehearsal boards, and cultural programming materials
- a sense of real-world theater operations rather than generic startup software

The interface should not feel luxury-minimal, futuristic, glossy, corporate, or AI-generic.

## Color direction

Build the system around this semantic palette:

- **Ink**: `#2B2926`
- **Paper**: `#F5EFE2`
- **Cream**: `#FBF7EF`
- **Theater / Mint**: `#82BFB6`
- **Theater Soft**: `#CFE7E3`
- **Event / Amber**: `#EAA542`
- **Event Soft**: `#F4D7AA`
- **Performer / Coral**: `#C76056`
- **Performer Soft**: `#E8B3AC`

Color usage should be semantic, not decorative:

- theater context and destinations use mint
- event, schedule, and programming context use amber
- performer, cast, and relationship context use coral
- the primary neutral system should be ink on warm paper/cream surfaces

The app should feel cream-forward and ink-anchored, not white-and-gray.

## Typography direction

Use **Cubano** for the main display typography direction and **Public Sans** for the body/operational typography direction.

If the tool cannot output those exact fonts, it should approximate the same feel:

- bold, poster-like, compact display typography for major titles
- clean, practical, highly readable sans-serif typography for interface text

Desired effect:

- headlines feel poster-like or playbill-like
- body text feels practical and scan-friendly
- labels and overlines help structure the interface without becoming noisy

Avoid:

- default startup sans-only systems
- ultra-techy mono-heavy UI
- elegant luxury fashion typography

## Layout and surface direction

The system should favor:

- strong page hierarchy
- clear section breaks
- intentional framing of modules
- reusable patterns across pages
- tactile surfaces that feel composed and bounded

Potentially useful visual qualities:

- paper-like surfaces
- ink-like framing
- offset shadows or crisp structural edges
- bold headers
- restrained but meaningful color-blocking

Do not make everything look like one stack of generic rounded cards.

## Product modes to design

### 1. Public / auth mode

Pages:

- homepage
- login
- signup
- confirm

Needs:

- brand and trust
- clear onboarding path
- simple, clean auth flow

### 2. Hybrid mode

Pages:

- theater overview
- event overview

Needs:

- works for anonymous visitors first
- clearly communicates public information
- reveals richer member/admin controls without becoming a separate UI language
- theater page should feel theater-owned, not show-owned
- event page should combine public identity with role-aware working context

### 3. Authenticated workspace mode

Pages:

- callsheet
- notifications
- profile
- theater collection / create
- theater admin
- theater-scoped event creation

Needs:

- strong desktop and mobile navigation
- denser information without visual clutter
- reusable workspace structures
- clear filtering, list, status, and form patterns

## Exact routes to design

Generate concepts for these Stagecom routes:

- `/`
- `/login`
- `/signup`
- `/confirm`
- `/callsheet`
- `/notifications`
- `/profile`
- `/theaters`
- `/[theaterSlug]`
- `/[theaterSlug]/admin`
- `/[theaterSlug]/new`
- `/[theaterSlug]/[eventSlug]`
- `/dev/components`

`/dev/components` should look like a real internal design-system overview and testing ground, not a tiny style tile page.

## Page expectations

### Homepage

- communicates the product clearly
- feels culturally aligned with improv theaters and live programming
- should not look like a generic B2B software homepage

### Callsheet

- this is the authenticated home
- schedule-first, operational, scannable
- should support day/week/upcoming thinking
- should make event navigation fast and obvious

### Theater collection

- a place to find, join, or start a theater
- should support discovery and creation without looking like a marketplace clone

### Theater overview

- theater identity first
- upcoming public programming
- relationship state for signed-in users
- member/admin affordances layered into the same page

### Theater admin

- operational home for theater management
- more task-oriented than the public theater page
- review queue, settings, and oversight should feel organized and purposeful

### Event overview

- canonical event page
- one surface for public identity and associated-user working context
- should clearly support producers, cast, and theater oversight users without splitting into separate pages

### Event creation

- starts inside a specific theater
- should feel like building a real production
- should be more like a guided production builder than a generic CRUD form

### Notifications

- inbox-like
- fast to scan
- read/unread should be obvious

### Profile

- identity and account oriented
- should feel part of the same design family, not a default settings screen

### Dev components

- full system overview
- tokens, components, page-pattern excerpts, and important states
- should feel useful to designers and engineers, not like an afterthought

## Reuse and system thinking

Design the app as a reusable system, not a collection of unrelated mockups.

Favor:

- repeated layout logic
- repeated section patterns
- repeated component logic
- consistent semantic use of color and emphasis

## Avoid

- generic startup gradients
- default SaaS dashboards
- placeholder analytics charts
- fintech, crypto, or AI-assistant aesthetics
- all-white minimalism
- glassmorphism
- over-rounded, soft, interchangeable component styling
- anything that feels like a template instead of a product with a point of view

## Output quality bar

The result should look like a production-grade foundation for a Nuxt app with a clear design system, strong personality, and practical operational UX.

It should feel like **theater operations software with cultural taste**, not corporate software re-skinned with brighter colors.
