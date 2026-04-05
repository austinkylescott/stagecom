# Feature Spec: Multi-Home Theater Hub And Calendar v1
Derived from PRD v0.2 (Locked)

---

## Status

Draft

## Summary

Stagecom should stop assuming a user has exactly one home theater.

Some users actively work across multiple theaters in the same city and need a faster way to monitor, compare, and enter those theater contexts without constantly resetting one global home value. The authenticated theater experience should evolve from a single-home preference into a multi-home hub model:

- `/theaters` becomes a personalized theater hub that can show multiple home theater dashboards at once
- each theater dashboard links into the full theater page at `/theaters/[slug]`
- the full theater page remains the main theater-specific destination
- the full theater page continues to lead with the theater dashboard, followed by upcoming shows and upcoming public non-show events
- the full calendar route at `/theaters/[slug]/calendar` becomes the theater-wide date inspection surface, where clicking a day reveals rows of events for that date

This spec also resolves the performance concerns discovered in the current theater hub implementation by separating discovery data from hub data and by moving to section-specific event payloads rather than broad, mixed-purpose fetches.

---

## Problem Statement

The current theater model and route structure assume a single home theater:

- `profiles.home_theater_id` represents one preferred theater
- `/theaters` behaves like a hybrid of:
  - home theater dashboard
  - home theater onboarding
  - theater discovery
  - followed-theater management

This creates both product and technical problems.

### Product problems

- Users who are meaningfully active in multiple theaters cannot reflect that reality in Stagecom.
- Changing the one home theater is too blunt for users who want to keep multiple theaters in active rotation.
- `/theaters` currently tries to serve setup, discovery, and steady-state theater work in one place.
- The product needs an easy way to move between theater contexts without turning the main hub into a search-first directory.

### Technical problems

- The current `/theaters` page requests full directory data that it does not render.
- The current `/api/theaters` route is doing browse-oriented work for a page that mainly needs personalized hub data.
- The current home-theater payload fetches more show and occurrence data than its visible sections require.
- The current directory query shape will scale poorly because it sorts and substring-searches on theater fields without the indexes needed for those access patterns.

---

## Product Goals

- Allow a user to designate multiple theaters as home theaters.
- Make it easy to scan and switch among home theaters.
- Keep theater relationship rules explicit and respected for every theater.
- Make `/theaters` a true personalized hub instead of a half-directory.
- Keep `/theaters/[slug]` as the main theater-specific board.
- Keep `/theaters/[slug]/calendar` as the theater-wide calendar workspace.
- Reduce unnecessary data fetching and query cost on theater surfaces.
- Preserve the existing product philosophy that home theater preference never creates or upgrades membership.

---

## Non-Goals

- No change to contextual role philosophy in the PRD.
- No change to show-level producer/cast invariants.
- No ticketing, payouts, or out-of-spec theater marketing features.
- No collapse of browse/discovery into the theater hub.
- No giant page-local components that combine all theater hub and theater page logic into one file.

---

## Decision Analysis

### 1. Split discovery from the hub

This is the clearest structural correction.

The browse endpoint and the hub endpoint serve different jobs:

- browse needs search, sorting, pagination, and total counts
- the hub needs personalized theater summaries and section-specific event slices

The current `/theaters` page is paying for browse-style data while mostly rendering personalized state. That is the wrong contract.

Decision:

- keep `/api/theaters` as the browse/discovery route
- introduce a dedicated personalized theater hub route for `/theaters`

### 2. Stop using a single global home theater preference

A single `home_theater_id` cannot model real user behavior once multiple home theaters are allowed.

Decision:

- replace the single-home assumption with a multi-home preference model
- a user may have zero, one, or many home theaters
- every home theater must also be an active theater membership

### 3. Model home theater preference as a relationship, not as an array on `profiles`

A simple array on `profiles` is not the right long-term structure because:

- membership and home status are relationship-driven
- ordering and toggling become awkward
- per-theater preference metadata becomes harder to validate and evolve

Preferred direction:

- represent home theater preference through a dedicated relationship structure tied to theater membership

Implementation may use one of these patterns:

1. add a dedicated `home_theaters` relationship table
2. extend `theater_memberships` with explicit home-preference fields such as `is_home` and `home_rank`

Recommended direction:

- extend `theater_memberships` rather than using a `profiles` array

Reasoning:

- home status is only valid when membership is active
- relationship state stays attached to the existing theater-user pair
- toggling and ordering remain easy to query
- this avoids introducing a second user-theater relationship table unless future product needs truly justify one

Open implementation detail:

- if ranking or pinning order becomes part of the UX, add a nullable `home_rank`
- if order is not yet user-visible, `is_home` alone is sufficient for v1

### 4. Use section-specific event queries

The current home-theater fetch path is too broad:

- it fetches a capped set of shows
- then fetches occurrences for those shows
- then sorts and slices in application code

That should be replaced with event slices shaped around actual UI sections.

Decision:

- query for exactly the sections the page renders
- use occurrence-backed event items as the main event representation for the hub and calendar-related surfaces

This is especially important because the theater page and calendar page need:

- show-specific sections
- all-event sections
- date-grouped sections

Those are occurrence-first concerns, not raw show-list concerns.

### 5. Index the browse surface for the way it will be used

The browse route sorts and searches by theater fields.

Decision:

- add a btree index on `theaters.name`
- add a btree index on `theaters.created_at`
- add trigram search support for `theaters.name` if substring search remains part of the browse experience

Explanation:

- btree helps sorting and exact/prefix-friendly access patterns
- trigram helps `ILIKE '%term%'` style contains-search
- trigram is the correct tool if browse is meant to support substring matching at moderate scale

Trigram search is not needed for the personalized hub endpoint because the hub should not be doing broad directory search at all.

---

## Product Behavior

## Multi-Home Theater Rules

- A user may mark multiple theaters as home theaters.
- A theater may only be marked home if the user has an active membership in that theater.
- Clearing or setting home theater status must never create, reactivate, or upgrade membership.
- Leaving a theater must remove home-theater status for that theater.
- If a user leaves their final home theater, they return to the no-home hub state.

## Theater Hub: `/theaters`

`/theaters` becomes the multi-home theater hub.

### State A: no home theaters

The page should:

- explain what home theaters do
- show followed/member theaters the user could mark as home
- provide a clear path to browse theaters
- provide a clear path to create a theater

Discovery remains secondary but available.

### State B: one or more home theaters

The page should:

- show a compact dashboard module for each home theater
- support quick switching into the full theater page
- provide clear controls to:
  - add another home theater
  - remove a theater from home status
  - browse theaters

The page should not request or display the full theater directory by default in this state.

### Dashboard responsibilities per home theater

Each home theater module should provide at-a-glance information only:

- theater identity
- relationship label
- oversight signal if applicable
- up next show
- up next non-show event, when available
- the next 30 days preview summary
- links to:
  - open theater page
  - open full calendar
  - create event/show if authorized
  - theater admin if authorized

These modules are summaries, not full workspaces.

## Theater Page: `/theaters/[slug]`

The theater page remains the primary theater-specific destination.

It should continue to feel like checking into a specific theater, not browsing a directory card in expanded form.

### Page structure

The page should render in this order:

1. theater dashboard section
2. upcoming shows section
3. upcoming public non-show events section

### Dashboard section

This should continue to follow the theater-dashboard direction already established in the April 1 specs:

- theater-owned top section
- identity and location visible immediately
- relationship state visible but secondary to theater identity
- quick actions visible
- alerts and up-next summaries visible

### Theater board display settings

Theater oversight roles should be able to control how much programming the main board displays.

- each theater stores:
  - `upcoming_shows_limit`
  - `upcoming_other_events_limit`
- these limits represent the total number of items shown on the theater board per type
- the first item in each slice feeds the dashboard card
- the remaining items feed the lower sections
- fetch size should match these limits directly rather than over-fetching and slicing excess items on the client

### Upcoming shows section

- show the next 3 visible show events
- focus on show-specific programming
- reuse shared theater detail components where possible

### Next 30 days section

- show every visible event in the next 30 days
- include all event types, not just shows
- group or structure rows so scanning by date is easy
- include a visible path to the full calendar page

This section is a preview, not a replacement for the full calendar.

## Theater Calendar Page: `/theaters/[slug]/calendar`

The theater calendar page becomes the full theater-wide date inspection route.

### Required behavior

- render a compact month calendar using the established app design language
- allow the user to click or select a day
- show rows of events occurring on the selected date
- each row links to the show/event detail page
- support month-to-month navigation
- remain occurrence-driven rather than trying to derive the view from broad show lists

### Visual/component direction

- keep using Nuxt UI calendar primitives where they fit
- keep the calendar visually compact enough that day-detail rows remain the main decision surface
- reuse theater event row/date-group components where practical instead of creating a separate visual system for the calendar page

---

## Data Contract Direction

## Hub Endpoint

Add a dedicated endpoint for the multi-home theater hub.

Working name:

- `GET /api/me/theater-hub`

This route should return only personalized hub data.

### Suggested response shape

```ts
type TheaterHubResponse = {
  homeTheaters: {
    theater: {
      id: string;
      name: string;
      slug: string;
      tagline: string | null;
      city: string | null;
      state_region: string | null;
      country: string | null;
    };
    membership: {
      status: string;
      roles: string[];
      isHome: boolean;
      homeRank?: number | null;
    };
    permissions: {
      canCreateShow: boolean;
      canReview: boolean;
    };
    dashboard: {
      upNextShow: TheaterEventItem | null;
      upNextOtherEvent: TheaterEventItem | null;
      nextThirtyDaysCount: number;
      pendingReviewCount: number;
    };
  }[];
  candidateTheaters: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    city: string | null;
    state_region: string | null;
    country: string | null;
  }[];
};
```

### Hub query rules

- do not fetch paginated directory results
- do not fetch `totalPages`
- do not do browse-style search
- do fetch only the home theaters and the member theaters needed for onboarding/manage-home flows
- do fetch dashboard summaries per home theater using section-specific queries

## Theater Page Endpoint

The theater page should use a theater-specific endpoint that is shaped for the actual page sections.

The payload should include:

- theater identity
- relationship and permission state
- dashboard-specific up-next data
- next 3 show events
- next 30 days visible events

It should not rely on a broad raw `shows + occurrences later` pattern when the page already knows what slices it needs.

## Calendar Endpoint

The calendar endpoint should be occurrence-first.

The payload should support:

- visible month markers
- selected-day rows
- month navigation
- all supported event types

It should not require the client to download large unstructured event sets and then compute all calendar behavior locally.

---

## Route Responsibilities

### `/theaters`

- personalized multi-home hub
- home-theater management
- candidate home-theater onboarding
- links into theater-specific destinations

### `/theaters/browse`

- discovery
- search
- pagination
- relationship management across all theaters

### `/theaters/[slug]`

- theater-specific dashboard and programming board

### `/theaters/[slug]/calendar`

- full theater-wide calendar and day inspection

### `/theaters/[slug]/admin`

- oversight-only management workspace

---

## Component Architecture

This work should favor thin, composable components over giant page files.

### Rules

- Keep page files focused on route state and composition.
- Move section rendering into dedicated components.
- Keep fetch logic in query/composable files, not embedded across multiple templates.
- Reuse existing theater detail components before introducing new wrappers.

### Preferred component decomposition

For `/theaters`:

- `MultiHomeTheaterHub.vue`
- `HomeTheaterDashboardCard.vue`
- `HomeTheaterSwitcher.vue`
- `HomeTheaterCandidateList.vue`

For `/theaters/[slug]`:

- keep `TheaterDashboardSection.vue`
- add or refine a dedicated upcoming shows section component
- add or refine a dedicated next-30-days preview component

For `/theaters/[slug]/calendar`:

- keep the calendar page as a route composition surface
- extract compact pieces such as:
  - `TheaterCalendarMonthCard.vue`
  - `TheaterCalendarDayRows.vue`
  - reuse `TheaterEventDateGroup.vue` where possible

### Design-system alignment

Follow the design bible:

- use Nuxt UI primitives first
- prefer shared Stage primitives over bespoke wrappers
- treat `TheaterDashboardSection.vue`, `AppNav.vue`, and theater detail components as locked references
- keep surfaces cream-forward and ink-framed
- use semantic theater/event/performer tones intentionally

### Required semantic color mapping

This feature must explicitly preserve the app's semantic color system:

- theater-wide surfaces use the mint blue theater color `#82bfb6`
- show and event-programming surfaces use the yellow event color `#eaa542`
- people, cast, performer, and relationship-oriented surfaces use the red performer color `#c76056`

In implementation terms, this means:

- theater hub cards, theater destination actions, theater dashboard wrappers, and theater admin-oriented accents should resolve to `--stage-theater`
- upcoming shows, schedule indicators, event rows, calendar markers, and event-preview surfaces should resolve to `--stage-event`
- people-related chips, cast/performer accents, and relationship-state surfaces should resolve to `--stage-performer`

Do not introduce a separate theater-hub visual language that drifts from the current authenticated app system.

---

## Performance Requirements

## Hub performance

- `/theaters` must not fetch the full theater directory when rendering the personalized hub state.
- hub payloads should be shaped around visible sections only.
- queries should be scoped to home theaters and candidate theaters only.

## Browse performance

- `/api/theaters` remains the browse endpoint and should be optimized for search/sort usage.
- add indexes for `name` and `created_at`.
- if substring search remains, add trigram support on `name`.

## Event-query performance

- event sections must be backed by occurrence-aware queries.
- fetch only the items needed for:
  - up next show
  - up next non-show event
  - next 3 shows
  - next 30 days preview
- avoid broad fetching followed by client-side slicing when the section requirements are already known on the server.

---

## Data Model Implications

This spec changes the current single-home assumption and therefore requires data model updates before implementation.

At minimum:

- remove the product assumption that `profiles.home_theater_id` is the sole home-theater source of truth
- update the data model docs to reflect multi-home preference
- keep the invariant that home preference never creates membership

Recommended schema direction for implementation:

- move home-theater preference onto `theater_memberships`

Possible fields:

- `is_home boolean not null default false`
- `home_rank integer null`

If this direction is adopted, implementation must also update:

- generated database types
- docs/data/data-model.md
- mock-data workflow/configs if seeded assumptions depend on home theater

---

## Migration / Compatibility Notes

- existing users with `profiles.home_theater_id` should be migrated so that theater remains home after the schema transition
- existing UI language that implies only one home theater must be updated
- navigation labels such as `My Theater` may need to become plural or support a switcher/dropdown concept

---

## Open Questions

- Should home theaters be ordered manually by the user, or is unordered membership enough for v1?
- Should the top nav point to `/theaters` always, or should it expose a quick switcher for home theaters?
- Should the hub show all home theater dashboard cards at once on desktop, or limit the visible set and require expansion when there are many?
- Should the next-30-days preview on the theater page be grouped by date, or be a flat chronological list with date separators?
- If a user has many home theaters, should the hub support pinning one as the primary top card without reintroducing the old single-home model?

---

## Acceptance Criteria

- A user can mark multiple active-member theaters as home theaters.
- A user can remove a theater from home status without leaving that theater.
- Leaving a theater removes its home status automatically.
- `/theaters` no longer depends on the browse endpoint for personalized hub rendering.
- `/theaters` shows one summary dashboard per home theater.
- `/theaters/[slug]` remains the main theater-specific page.
- `/theaters/[slug]` shows the next 3 show events and a next-30-days all-events preview.
- `/theaters/[slug]/calendar` supports day selection and shows date-specific event rows.
- Browse/discovery remains on `/theaters/browse`.
- Theater browse queries are indexed for their supported sort/search patterns.
- The implementation uses thin composable components rather than expanding route files into large mixed-responsibility templates.
