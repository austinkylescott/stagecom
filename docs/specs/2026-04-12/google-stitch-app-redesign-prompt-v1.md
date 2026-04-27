# Google Stitch Prompt: Stagecom App Redesign v1

Design a multi-page web application for **Stagecom**, a community management platform for improv theaters.

This is **not** a generic SaaS dashboard and **not** a landing-page-only concept. The app must feel purpose-built for live performance communities and theater operations.

## Product context

Stagecom helps improv theaters, producers, and performers coordinate:

- theater identity and programming
- show/event creation
- scheduling and callsheets
- cast and producer context
- notifications
- account/profile management

Roles are contextual, not global:

- performer
- producer
- theater manager
- theater staff
- theater member

Producers are not automatically performers. Cast membership must feel explicit.

## Design goals

- Create a distinctive, coherent visual system across the whole app.
- The style can change substantially from the current implementation.
- Avoid generic analytics-dashboard tropes, placeholder charts, and enterprise admin clichés.
- Prioritize operational clarity, hierarchy, and reusable page systems.
- The app should feel editorial and intentional, but still practical for dense working interfaces.
- Public pages, hybrid pages, and authenticated workspace pages should feel related but not identical.

## Product modes to design

### 1. Public / auth mode

Pages:

- homepage
- login
- signup
- confirm / email-complete state

Need:

- brand and trust
- clear onboarding path
- simple, crisp conversion and auth flow

### 2. Hybrid mode

Pages:

- theater overview page
- event overview page

Need:

- works for anonymous visitors first
- presents public information clearly
- reveals richer member/admin controls without becoming a different page
- theater page should feel theater-owned, not show-owned
- event page should combine public event identity with inline working context for associated users

### 3. Authenticated workspace mode

Pages:

- callsheet
- notifications
- profile
- theater admin
- theater collection / create
- theater-scoped event creation

Need:

- strong navigation system for desktop and mobile
- operational density without clutter
- repeatable page structures
- clear handling of filters, status, inline actions, and dense lists/forms

## Specific surfaces to generate

Create concepts for these exact Stagecom routes:

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

Also include an internal design-system/reference view concept for `/dev/components`, but treat it as documentation of the system, not the source of the design language.

That internal reference view should feel comprehensive: a place to inspect tokens, components, page-pattern excerpts, and deterministic sample states in one overview.

## Page expectations

### Callsheet

- authenticated home
- calendar / schedule orientation
- filters and scope controls
- clear day/week/upcoming scanning
- fast navigation into event detail

### Theater overview

- theater identity first
- upcoming public programming
- visible relationship state for signed-in users
- public-first structure with layered member/admin affordances

### Theater collection / create

- collection entry for finding, joining, or starting a theater
- should support both discovery and creation initiation without becoming a cluttered marketplace
- should establish the user's next theater context clearly

### Theater admin

- operational home for a specific theater
- review queue, oversight, and management context
- should feel more task-oriented than the public theater page

### Event overview

- canonical event page
- public-facing event identity
- inline working sections for cast, producer, and theater oversight users
- one surface, not a separate public page and admin page

### Event creation

- begins already inside a theater context
- then becomes a focused builder/editor
- should feel like creating a real production, not filling a generic CRUD form

### Notifications

- inbox-like
- operational and scannable
- clear read/unread state

### Profile

- account and identity oriented
- should not feel like a generic settings page copied from another app

## Output guidance

- Show a coherent design family across all pages.
- Use realistic modules and labels for theater/community operations.
- Prefer purposeful typography, layout rhythm, and visual hierarchy over decorative gimmicks.
- Desktop and mobile behavior should both feel intentional.
- Favor reusable page structures rather than one-off page art direction.
- Make the `/dev/components` concept read like a real system overview and testing ground, not a minimal style tile page.

## Avoid

- generic startup gradients and default SaaS cards
- crypto / fintech / AI-assistant visual language
- placeholder analytics charts where the app really needs lists, schedule views, queues, and entity detail
- design decisions that require a second component library

The result should look like a credible foundation for a production Nuxt app with a strong design system, not a one-off mockup.
