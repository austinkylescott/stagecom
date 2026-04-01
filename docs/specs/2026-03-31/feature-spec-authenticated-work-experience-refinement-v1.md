# Feature Spec: Authenticated Work Experience Refinement v1
Derived from PRD v0.2 (Locked)

---

## Summary
Refine the authenticated Stagecom experience by rethinking which surfaces exist, what each surface is responsible for, and which users should see which levels of information.

This feature is not just a polish pass. It is a structural UX pass intended to reduce mixed-purpose pages, align dashboards to actual concern levels, and make the product easier to evolve under the existing visibility policy.

The implementation should use a mix of:

- splitting overloaded pages into clearer surfaces
- simplifying pages that currently try to satisfy multiple goals at once
- gating sections, fields, and actions more intentionally by viewer relationship and role
- unifying dashboard presentation so similar work surfaces feel related instead of drifting visually

---

## Problem Statement
Several authenticated surfaces currently serve too many purposes at once.

The clearest example is `project/app/pages/theaters/index.vue`, which currently combines:

- theater discovery
- following / membership management
- home theater onboarding
- home theater dashboarding

Those are related, but they are not the same job.

Once a user has chosen a home theater, they are far less likely to need a broad discovery board every time they visit that route. At that point, the route should primarily support their ongoing theater relationship, while discovery becomes secondary, intentionally triggered, or moved to a more clearly framed surface.

Related issues exist across the authenticated app:

- some pages are trying to be both dashboard and directory
- some pages are trying to support multiple concern levels in one undifferentiated layout
- visibility-sensitive information is not always organized around the policy vocabulary already defined in product docs
- dashboard styles drift from surface to surface, which makes the app feel less coherent and can harm readability
- some sections use contrast patterns that are weaker than the clearer board/list treatments already used elsewhere in the product

The result is that the app can feel structurally noisy even when the underlying features are correct.

---

## Product Goals

- Decompose overloaded authenticated surfaces into clearer jobs.
- Align page structure with real concern levels: general member, relationship-based participant, and theater oversight.
- Use the visibility policy as a first-class UX organizing principle, not only a backend authorization rule.
- Make it easier to expose different information and actions to different viewer states without making every page bespoke.
- Establish a unified dashboard language that is readable, durable, and reusable across authenticated surfaces.

---

## Non-Goals

- No change to the PRD, contextual role philosophy, or notification/event model.
- No schema changes or new core entities in this pass.
- No hidden permission shortcuts that bypass the visibility policy.
- No feature additions that are outside the existing product direction.
- No requirement that every concern level gets a fully separate route; some cases should be solved with stronger composition and gating inside a shared page.

---

## Core Product Framing

The authenticated app should stop treating every page as if it serves one generic signed-in user.

The product already distinguishes materially different concern levels:

- signed-in user with no special relationship
- theater member
- relationship-based participant on a show such as producer or explicit cast
- theater oversight user such as admin, manager, or staff
- self-only viewer for personal records like notifications

This iteration should make those distinctions easier to express in the UI, using the visibility policy vocabulary already defined in `docs/product/visibility-policy.md`.

The UI should increasingly organize authenticated surfaces around these scope patterns:

- `authenticated`
- `theater_only`
- `relationship`
- `oversight_only`
- `self_only`

This does not mean the UI must expose the policy words directly to users. It means the surface design should map cleanly to them.

---

## Strategic Direction

### 1. Separate discovery from ongoing operations
Discovery tools should not dominate routes that become repeat operational destinations after setup.

Example direction:

- the theaters route should become primarily about the user’s theater context, especially after home theater selection
- broad theater discovery should become secondary, triggered, or moved into a dedicated browse surface
- onboarding states may still introduce discovery, but they should not permanently define the route for established users

### 2. Decompose pages by job, not by data source
If one page is acting as both directory and dashboard, or both inbox and workspace, it should be reconsidered.

The goal is not route sprawl. The goal is clearer jobs per surface.

### 3. Use role-sensitive dashboards instead of one dashboard for everyone
The same route may need different modules, summaries, and actions depending on who the viewer is.

Examples:

- a theater oversight user should see queue and operations signals that a general theater member does not
- a producer should see readiness and cast management signals that a general viewer does not
- a performer should see participation and response state, not back-office controls

### 4. Build a reusable authenticated dashboard system
The product needs a stronger shared dashboard language so pages stop drifting visually and structurally.

This should favor readable, cream-surface, ink-framed dashboard modules that already work better elsewhere in the app over overextending dark hero treatments into dense operational surfaces.

---

## Surface Rethink

### Theater Pages
Current issue:
The current theater surfaces still blur together three different jobs:

- choosing or switching theater context
- living inside a home theater as a regular member
- overseeing theater-wide operations as staff or management

The theater detail page in particular should not open with a generic identity hero that says little beyond the theater name and a few counts. For most signed-in users, the home theater page should feel like checking into their actual theater, not reading a brochure or an abstract dashboard.

Target roles:

- theater page as the steady-state member-facing home theater surface
- browse / selection surface as secondary discovery and context management
- admin surface as the oversight workspace for theater-wide operations

Spec direction:

- Treat `project/app/pages/theaters/[slug]` as the primary home theater destination.
- Make this page useful for the most common viewer first:
  - active member of the theater
  - regular signed-in user who follows the theater
  - public viewer checking what is coming up
- The page should lead with theater context that matters now:
  - upcoming public programming
  - quick links into the theater’s current shows
  - membership context and next actions
  - a concise explanation of what makes this theater relevant to the viewer
- Remove low-information hero treatments, especially dark intro sections that reduce readability on the page most likely to be used repeatedly.
- Keep broad theater discovery secondary through `/theaters/browse` or equivalent.
- Keep `/theaters` as a supporting authenticated context route, not the main steady-state destination once a home theater exists.
- Add a dedicated oversight surface, such as `project/app/pages/theaters/[slug]/admin.vue`, for:
  - approvals and pending review counts
  - top-down view of theater activity
  - at-a-glance community and staffing signals
  - theater-wide management actions

The member-facing theater page should answer:

- what is happening at my theater soon
- what can I attend, open, or work on from here
- what is my relationship to this theater
- where do I go if I need discovery or theater administration

The admin page should answer:

- what needs theater-level attention right now
- what is moving through review and scheduling
- how active is the theater overall
- where can an oversight user step in quickly

### Shows
Target role:
Cross-theater operational board.

Spec direction:

- Keep this as the broader schedule/work board rather than duplicating the theater-hub dashboard.
- Let it surface information that is different from the theater dashboard:
  - cross-theater commitments
  - relationship-based workload
  - upcoming assignments
  - schedule items that matter because of the viewer’s participation or monitoring role
- Avoid making this page a second copy of the home theater page with slightly different labels.

### Review
Target role:
Oversight queue, not general dashboard.

Spec direction:

- Keep the review surface tightly queue-shaped.
- Increase the separation between review work and general creator tracking if necessary.
- If one page cannot cleanly serve both oversight review and creator follow-up, prefer a clearer split or stronger internal segmentation.

### Notifications
Target role:
Self-only triage feed.

Spec direction:

- Keep this focused on events that happened to the user, not as a general operational dashboard.
- Improve routing and grouping so it works as a handoff surface into the correct workspace.
- Avoid overloading it with summaries that belong more naturally on dashboard pages.

### Show Detail
Target role:
Relationship-aware workspace.

Spec direction:

- Continue to use one canonical show workspace, but make its modules more role-sensitive.
- Producers, performers, oversight users, and general viewers should not all receive the same information emphasis.
- Preserve shared core context, but gate controls, labels, and deeper operational detail more intentionally.

### Performers
Target role:
Staffing support tool.

Spec direction:

- Keep this intentionally secondary.
- Do not let it accumulate dashboard responsibilities that belong elsewhere.

---

## Role-Sensitive UX Model

This feature should explicitly design for different concern levels across the app.

### Concern level: general authenticated user
Needs:

- broad orientation
- simple schedule awareness
- clear path into theaters and shows they care about

Should usually see:

- general summaries
- public or member-appropriate actions
- less operational noise

### Concern level: theater member
Needs:

- theater context
- member-relevant upcoming activity
- clear distinction between theater hub information and broader app-wide work

Should usually see:

- home theater dashboard modules
- theater-only information where appropriate
- join/follow/home controls where still relevant

### Concern level: relationship-based show participant
Includes:

- producer
- accepted cast
- pending invited cast
- pending requested cast where appropriate

Needs:

- assignment-specific context
- response state
- schedule changes
- show-level action cues

Should usually see:

- relationship-specific show modules
- participation state
- focused actions tied to that show

### Concern level: theater oversight
Includes:

- admin
- manager
- staff

Needs:

- queue visibility
- review visibility
- protected theater operations context
- enough detail to make oversight decisions without exposing everything everywhere by default

Should usually see:

- oversight modules on theater and review surfaces
- protected stats/actions where the visibility policy allows them

### Concern level: self-only
Needs:

- personal inboxes and user-owned records

Should usually see:

- notifications and similar self-scoped information without broader dashboard overreach

---

## Visibility Policy As UX Structure

This feature should explicitly use `docs/product/visibility-policy.md` as a structuring tool for interface decisions.

### Rules

- Do not design major dashboard modules as if they are universally visible if they are actually `relationship` or `oversight_only`.
- Prefer modular composition so protected sections can appear or disappear cleanly without breaking the page.
- Distinguish between:
  - hidden actions on a shared surface
  - hidden fields inside a shared module
  - fully separate protected sections
  - fully separate routes when the job itself is different
- A route can remain shared while still presenting different levels of density and control based on viewer qualification.

### Outcome

The UI should become easier to extend because visibility-sensitive modules have clearer homes and boundaries.

---

## Dashboard Design System Direction

The authenticated app needs a more unified dashboard presentation.

### Current issue
Dashboard-like surfaces use inconsistent panel treatments, and some darker sections have readability and contrast problems for operational content.

The current home-theater hero is the clearest example:

- it uses a dark board treatment for content that should be quickly scanned
- some supporting text sits too close to the background value
- it reads more like a promotional hero than a durable operational dashboard

### Direction
Use other stronger authenticated surfaces as the baseline for a shared dashboard system.

Prefer patterns closer to:

- `stage-panel`
- `stage-list-card`
- `stage-article-card`
- readable cream-background modules with strong ink borders
- stacked-board treatments as selective accent objects, not the default for dense dashboard content

### Dashboard rules

- Primary dashboard surfaces should prioritize readability over spectacle.
- Dark backgrounds should be used selectively for emphasis, not as the default container for dense operational information.
- Summary stats, queue cards, and upcoming-item modules should share a common internal rhythm and contrast model.
- Accent modules can retain the established Stagecom visual personality, but repeated dashboard cards should be calmer and more legible.
- Theaters, Shows, Review, and Notifications should feel like members of the same dashboard family even when their jobs differ.

---

## Proposed Information Architecture Direction

The exact route names can be finalized during implementation, but the spec should support this shape:

### Theater hub
Primary steady-state route for the user’s home theater context.

Responsibilities:

- home theater summary
- upcoming theater programming
- theater-relevant actions based on viewer qualification
- lightweight handoff into review, show creation, or theater detail when appropriate

### Theater discovery
Secondary route or triggered browse surface.

Responsibilities:

- search all theaters
- browse and join/follow theaters
- choose or change home theater intentionally

### Cross-theater work board
Primary route for app-wide show commitments and schedule context.

Responsibilities:

- upcoming assignments and monitored shows
- cross-theater workload
- relationship-based schedule context

### Oversight queue
Protected review surface.

Responsibilities:

- pending review work
- oversight actions
- blocked items that need theater decisions

### Personal updates
Self-only notification feed.

Responsibilities:

- personal updates
- response prompts
- handoff into show or theater workspace

---

## Concrete Route Plan

This feature should proceed with a route plan concrete enough to guide implementation decisions.

### Primary authenticated routes

#### `/theaters`
Primary role:
Theater hub.

Steady-state purpose:

- anchor the user in their home theater
- show theater-relevant upcoming activity
- expose theater-level next actions appropriate to the viewer

Should not remain:

- the permanent all-theaters discovery page for established users

#### `/theaters/browse` or equivalent secondary browse surface
Primary role:
Theater discovery.

Purpose:

- search all theaters
- browse and join/follow theaters
- intentionally change or choose home theater

Implementation note:
This may be a dedicated route or an intentionally triggered discovery surface if that better fits the current shell. The important constraint is that discovery becomes secondary to theater-hub use.

#### `/shows`
Primary role:
Cross-theater work board.

Purpose:

- show app-wide schedule context
- represent the user’s commitments, monitored work, and relationship-based schedule signals
- avoid duplicating theater-hub content

#### `/review`
Primary role:
Oversight queue.

Purpose:

- hold theater review work
- expose oversight tasks clearly

Implementation note:
If creator-follow-up and oversight review continue to conflict on one screen, split them into clearer segments or separate surfaces.

#### `/notifications`
Primary role:
Personal updates.

Purpose:

- self-only feed
- routing layer into the right workspace

#### `/theaters/[slug]/shows/[id]`
Primary role:
Show workspace.

Purpose:

- canonical operational record for one show
- role-sensitive presentation of actions, state, and participation

### Navigation direction

The main authenticated navigation should distinguish between:

- theater context
- app-wide work
- approvals
- people/discovery support
- personal updates

Working direction:

- keep `Theaters` as the theater-hub entry point
- keep `My Schedule` or equivalent as the cross-theater work board
- keep `Approvals` explicitly queue-like
- avoid making theater discovery feel like the same class of destination as the steady-state theater hub

---

## Theater Surface Breakdown

The current `Theaters` route should be decomposed into explicit modules with different priorities by state.

### State A: no home theater selected
Primary page job:
onboarding into theater context

Priority order:

1. choose or create a home theater
2. understand what a home theater does
3. browse available theaters

Recommended modules:

- home-theater explainer / setup panel
- candidate theaters
- create theater action
- optional broader browse/search section

### State B: home theater selected, general member
Primary page job:
steady-state theater hub

Priority order:

1. home theater summary
2. upcoming programming at that theater
3. member-relevant theater actions
4. intentional path to browse or switch theaters

Recommended modules:

- home theater identity panel
- upcoming shows panel
- quick links into theater detail and schedule
- lower-priority browse/switch affordance

### State C: home theater selected, oversight user
Primary page job:
theater hub plus protected operations signals

Priority order:

1. home theater summary
2. pending oversight work
3. upcoming theater programming
4. oversight shortcuts
5. browse/switch affordance

Recommended additional modules:

- pending review count / queue module
- protected theater operations summary
- shortcuts to review and show creation

### Theater-hub modules that should move out of the default route

- full all-theaters browse results
- discovery search as the dominant page block
- directory-style browsing that is not needed for steady-state theater use

### Theater-hub modules that should stay

- home theater identity
- upcoming theater programming
- role-sensitive next actions
- intentional route into theater discovery

---

## Page Module Inventory By Surface

This inventory defines what kinds of modules each primary surface should prefer.

### Theater hub modules

- home theater identity
- upcoming theater programming
- theater quick actions
- oversight queue summary when qualified
- browse/switch theaters entry point
- clear handoff into a theater-scoped programming calendar/agenda route

### Cross-theater work board modules

- next assignments
- relationship-based upcoming shows
- cross-theater agenda
- selected-day detail
- filtered workload summaries

Should not lead with:

- general theater discovery
- home-theater identity as the main story

### Review modules

- items needing theater decision
- review reasons / status explanation
- shortcuts into show workspace

Should not lead with:

- broad dashboard stats that dilute the queue job

### Notifications modules

- grouped personal updates
- response-needed items
- recently changed schedule or cast items
- direct links into show or theater workspaces

Should not lead with:

- theater-hub summaries
- oversight summaries

### Show workspace modules

- show state summary
- viewer relationship summary
- next relevant action
- occurrences / timing
- cast and staffing modules
- protected producer / oversight controls when qualified

---

## Module Gating Rules

The implementation should favor modular composition with predictable gating.

### Visible to `authenticated`

- broad orientation modules
- non-sensitive route introductions
- public or user-safe summaries

### Visible to `theater_only`

- member-specific theater context
- theater-hub modules tied to active membership

### Visible to `relationship`

- show participation state
- cast or assignment context
- relationship-based show actions

### Visible to `oversight_only`

- review counts
- protected theater operations summaries
- approval and oversight actions

### Visible to `self_only`

- notification feeds
- personal response states where applicable

### Design rule

When a module is not visible, the page should still remain structurally coherent. The layout should not depend on every viewer qualifying for the same cards.

---

## Dashboard Component Direction

This feature should standardize a smaller set of dashboard building blocks.

### Preferred building blocks

- cream-background primary panels for dense operational content
- bordered list cards for repeated rows
- compact stat cards with strong labels and calm backgrounds
- accent boards used sparingly for hero moments or singular callouts

### Anti-patterns to avoid

- dark hero containers used as the default wrapper for scan-heavy dashboard content
- mixed contrast rules from card to card on the same page
- switching between promotional and operational visual logic inside one dashboard section

### Specific implication for home theater

The current `HomeTheaterHero` should likely stop being the dominant dark-board object and instead become a clearer theater-hub panel system, potentially split into:

- home theater identity panel
- upcoming theater programming panel
- optional setup/switch panel

That split should make the route easier to read and easier to gate by viewer qualification.

---

## Implementation Focus Areas

### Phase 1. Surface decomposition spec pass

Purpose:
Define which overloaded pages should be split, simplified, or re-scoped before implementation drifts into component-level tweaks.

Expected outcome:

- clearer route responsibilities
- fewer mixed-purpose pages

### Phase 2. Role-sensitive module system

Purpose:
Refactor the authenticated experience so modules can be shown, hidden, or simplified by concern level and visibility scope.

Expected outcome:

- easier role-sensitive presentation
- less duplication and less ad hoc conditional UI

### Phase 3. Dashboard visual unification

Purpose:
Establish and apply a shared dashboard system that fixes contrast drift and improves scanability.

Expected outcome:

- theater, show, review, and notification surfaces feel related
- operational panels are more readable

### Phase 4. Cross-surface continuity

Purpose:
Make navigation and handoff between hub, board, queue, feed, and workspace surfaces feel intentional.

Expected outcome:

- users can move between different concern levels without losing orientation

---

## Source Of Truth

- `docs/product/PRD.md`
- `docs/product/visibility-policy.md`
- `docs/product/events-and-notifications.md`
- `docs/data/data-model.md`
- `docs/development/ai-interaction.md`
- `docs/development/coding-rules.md`

Primary implementation surfaces likely include:

- `project/app/pages/theaters/index.vue`
- `project/app/components/HomeTheaterHero.vue`
- `project/app/components/TheaterList.vue`
- `project/app/components/AppNav.vue`
- `project/app/pages/shows/index.vue`
- `project/app/pages/review/index.vue`
- `project/app/pages/notifications/index.vue`
- `project/app/pages/theaters/[slug]/index.vue`
- `project/app/pages/theaters/[slug]/calendar.vue`
- `project/app/pages/theaters/[slug]/shows/[id].vue`

---

## Acceptance Criteria

- The spec clearly identifies which current authenticated surfaces are overloaded and how they should be re-scoped.
- The theaters experience is no longer defined as one permanent combination of discovery and dashboarding.
- The product has a defined direction for separate theater-hub and theater-discovery responsibilities.
- The spec explicitly maps UX structure to the visibility policy concern levels and scopes.
- The dashboard system direction is readable, consistent, and based on reusable authenticated patterns rather than ad hoc page styling.
- The resulting architecture makes it easier to expose different information and controls to general users, theater members, relationship-based participants, and oversight users.
- Existing PRD, permission, cast, and notification invariants remain intact.

---

## Suggested Work Order

1. Finalize route and surface responsibilities, starting with `Theaters`.
2. Define the shared dashboard module patterns and where dark accent treatments should still be allowed.
3. Audit each authenticated page by concern level:
   - general authenticated
   - theater member
   - relationship-based participant
   - oversight
   - self-only
4. Implement the theaters split or re-scope first, because it is currently the strongest example of mixed responsibilities.
5. Apply the same decomposition and dashboard rules to `Shows`, `Review`, `Notifications`, and `Show detail`.
