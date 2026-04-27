# Google Stitch Prompt: Stagecom App Redesign v3

Design a multi-page web application for **Stagecom**, a community management platform built first and foremost for **improv theaters, comedy theaters, indie venues, and community arts spaces**.

This is **not** a traditional-theater management suite, **not** a generic SaaS dashboard, and **not** a landing-page-only concept.

The app should feel like software that understands improv communities and the way they actually run shows, classes, workshops, jams, rehearsals, and theater life.

## Core brief

Stagecom helps theaters, producers, performers, and theater staff coordinate:

- theater identity and community presence
- event creation and management
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

Important product truth:

- producers are **not** automatically performers
- cast membership must feel explicit
- `event` is the umbrella term
- event types include **shows, workshops, classes, jams, auditions, rehearsals, and meetings**

Do **not** center the app around traditional productions alone.

## Cultural and language direction

This app should speak to improv and community theater culture directly.

It should feel:

- fun
- specific
- collaborative
- practical
- warm
- sharp
- a little bold

It should **not** feel:

- stuffy
- elite
- archival
- reverent toward traditional theater institutions
- like improv is a secondary use case

Use language that feels contemporary and grounded in improv/community spaces.

Good directional language:

- Callsheet
- lineup
- jam
- class
- workshop
- rehearsal
- theater crew
- upcoming events

Avoid or explicitly do not center language like:

- playbill
- archive
- repertory
- scripts
- accounting
- theater elite
- high-stakes productions

`Callsheet` is a strong and correct label. Use `Callsheet` wherever the authenticated home/dashboard is referenced, including navigation.

## Aesthetic direction

The design should feel:

- brutalist in structure
- fun in spirit
- tactile
- editorial in hierarchy
- bold and clear
- warm rather than stark
- expressive without becoming chaotic

It should combine:

- the clarity of a modern product app
- the punch of posters, flyers, rehearsal boards, community bulletin boards, and clipboards
- the energy of improv and grassroots venue culture

It should **not** feel like:

- a black-heavy fashion editorial
- a grayscale theater archive
- a luxury-minimal product
- a corporate admin suite
- a generic AI-generated startup site

## Color direction

Build the system around this semantic palette and use it **boldly**:

- **Ink**: `#2B2926`
- **Paper**: `#F5EFE2`
- **Cream**: `#FBF7EF`
- **Theater / Mint**: `#82BFB6`
- **Theater Soft**: `#CFE7E3`
- **Event / Amber**: `#EAA542`
- **Event Soft**: `#F4D7AA`
- **Performer / Coral**: `#C76056`
- **Performer Soft**: `#E8B3AC`

Color usage must be semantic:

- theater/community context uses **mint**
- callsheet, schedule, and event/programming context uses **amber**
- people, cast, and relationship context uses **coral**
- ink is used for text, framing, borders, and contrast
- paper/cream are the main neutral surfaces

Critical correction from prior attempts:

- do **not** overuse black or near-black as the dominant background everywhere
- do **not** let neutral dark surfaces overpower the three brand colors
- the three brand colors should carry major context shifts and large UI moments

The app should feel **brand-color-forward**, not black-forward.

## Typography direction

Use **Cubano** for the main display typography direction and **Public Sans** for the body and operational typography direction.

If the tool cannot output those exact fonts, approximate their roles:

- bold, poster-like, compact display typography for major titles
- clean, practical, highly readable sans-serif typography for interface text

Desired effect:

- headlines feel punchy and poster-like
- body text feels useful and scannable
- labels and overlines provide structure without sounding ceremonial

Avoid:

- default startup sans-only systems
- mono-heavy tech aesthetics
- elegant luxury fashion typography

## Layout and surface direction

The system should favor:

- strong page hierarchy
- obvious section breaks
- framed modules
- reusable layouts
- bounded work surfaces
- crisp edges and intentional structure

Useful visual cues:

- paper-like surfaces
- ink-like borders and framing
- offset shadows or hard structural edges
- color-blocked headers
- strong labels and sectional rhythm

Do **not** make the whole app look like stacked generic rounded cards.

## Product modes to design

### 1. Public / auth mode

Pages:

- homepage
- login
- signup
- confirm

Needs:

- brand and trust
- clear onboarding
- simple auth flow

### 2. Hybrid mode

Pages:

- theater overview
- event overview

Needs:

- works for anonymous visitors first
- presents public information clearly
- reveals richer member/admin controls without becoming a different design language
- theater page feels theater-owned, not show-owned
- event page combines public identity with role-aware working context

### 3. Authenticated workspace mode

Pages:

- Callsheet
- notifications
- profile
- theaters collection
- theater admin
- theater-scoped event creation

Needs:

- strong desktop and mobile navigation
- dense information without clutter
- repeatable workspace patterns
- clear filtering, status, list, and form behavior

## Exact routes to design

Generate concepts for these exact Stagecom routes:

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

## Navigation rules

Do **not** invent unrelated top-level product areas.

Primary app navigation should be constrained to:

- `Callsheet`
- `Theaters`
- `Notifications`
- `Profile`

Allowed contextual actions or destinations:

- theater creation from `/theaters`
- event creation inside a theater
- theater admin inside a theater context

Do **not** invent navigation items like:

- `Scripts`
- `Accounting`
- unrelated analytics or back-office sections

Navigation should reflect real Stagecom user flows, not a generic theater-management template.

## Page expectations

### Homepage

- should be a strong marketing page
- should clearly explain the product
- should feature patterns and components from the rest of the app to showcase the feature set
- should feel aligned with improv/community culture, not generic B2B software

### Callsheet

- this is the authenticated home
- call it **Callsheet** everywhere
- should feel like the operational heartbeat of the app
- schedule-first, scannable, practical
- should support day/week/upcoming thinking
- should make navigation into event detail fast

### Confirm

- treat this as a low-priority utility/auth-status screen
- keep it lightweight and functional
- do **not** turn it into a major brand or hero page

### Dev components

- should be a comprehensive internal design-system overview and testing ground
- should show tokens, components, page-pattern excerpts, and important states
- should adhere to brand color rules
- should feel useful to designers and engineers, not like an afterthought

### Event overview

- strong first-pass event page
- one surface for public identity and associated-user working context
- content can be rich, but tone should not be stuffy or traditional-theater-specific

### Login / signup

- can stay structurally simple
- should feel warm, branded, and clear
- avoid elite or archival theater tone

### Event creation

- starts inside a specific theater
- should not be framed narrowly as a “production builder”
- must support the broader event set: shows, workshops, classes, jams, auditions, rehearsals, and meetings
- should avoid wasted space and overly ceremonial composition
- should feel like a practical builder for real community programming

### Notifications

- inbox-like
- fast to scan
- solid first pass is acceptable
- should still align with the broader design shift

### Profile

- should feel specific to improv/community theater needs
- should not read like a generic traditional-theater résumé page

### Theater admin

- should be operational and useful
- current direction is broadly good
- may need refinements, but should remain a strong task-oriented surface

### Theater overview

- current direction is broadly good
- should remain theater-first
- should feel inviting, specific, and color-confident

### Theaters collection

- should remain strong as a discovery and creation surface
- may need refinement, but the direction is solid

## Reuse and system thinking

Design the app as a reusable system, not a collection of isolated mockups.

Favor:

- repeated layout logic
- repeated section patterns
- repeated component logic
- consistent semantic use of color
- shared structural rhythm across the product

## Hard negatives

Do **not** produce:

- traditional-theater-first branding
- black-dominant or grayscale-dominant layouts
- invented nav items outside the approved product model
- overly formal editorial language
- a production-only worldview
- a homepage that does not visibly sell the real feature set
- a bloated confirm-success page
- a components page that ignores brand color semantics

## Output quality bar

The result should feel like **fun, brutalist, color-forward software for improv communities**.

It should look like a production-grade foundation for a real app with strong personality and practical UX.

It should feel like Stagecom understands improv theaters and community spaces as the primary audience, not a niche adaptation of traditional theater software.
