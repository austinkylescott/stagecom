# Feature Spec: Shows Dashboard Refresh v1
Derived from PRD v0.2 (Locked)

---

## Summary
Refresh the member-facing `Shows` page so it becomes a compact operational dashboard instead of a large static month grid.

The new page should combine:

- a smaller month calendar built with Nuxt UI calendar primitives
- a dashboard-style agenda showing upcoming items in chronological order
- a selected-day detail surface that responds to calendar clicks
- shared filters that affect both the calendar and the agenda

This work is a usability and presentation upgrade for existing show/event information. It does not change role philosophy, approval rules, or cast behavior.

The implementation should use a dedicated schedule read model for this page rather than overloading the existing member-shows payload that only represents one next occurrence per show.

---

## Problem Statement
The current `Shows` page is functional but not immediately usable for theaters with lighter schedules.

Current issues:

- the custom month grid takes too much space for smaller theaters
- the calendar is visually louder than the actual decision-making surfaces
- the list and calendar feel like separate modules instead of one coordinated workflow
- clicking around the calendar does not produce a focused day-level view
- the page styling does not match the intended Stagecom brutalist dashboard language

The page should feel like a programming board: quick to scan, compact, and useful whether a theater has 3 events this month or 30.

---

## Product Goals

- Make the `Shows` page useful for theaters with sparse or dense schedules.
- Preserve fast month-to-month scanning without dedicating most of the screen to the calendar.
- Let users inspect a single day without losing the broader chronological view.
- Keep all page surfaces aligned with the Stagecom visual system established in the V0 design work.
- Reuse Nuxt UI primitives where they fit, especially for calendar behavior and controls.

---

## Non-Goals

- No change to show lifecycle states, permissions, approval workflow, or casting rules.
- No new scheduling entity or schema change in this pass.
- No occurrence editing or authoring workflow in this pass.
- No public theater calendar redesign in this pass; this scope is the member `Shows` page only.

---

## UX Direction

### Page structure
The page should move from a two-card list-plus-calendar layout to a compact dashboard layout with three coordinated areas:

1. A concise page header with page title, supporting copy, and the existing `New show` action.
2. A filter bar that controls all schedule views on the page.
3. A main content area with:
   - a compact month calendar
   - a selected-day detail panel
   - a chronological upcoming agenda panel

### Calendar
Use the Nuxt UI calendar component as the base month view instead of the current custom grid.

Calendar requirements:

- Month navigation must support browsing forward and backward across months.
- The calendar should be visually compact enough to sit beside dashboard panels without dominating the screen.
- Days with one or more matching events should show an event marker or count indicator.
- Selecting a day updates the selected-day detail panel.
- Filter changes update the calendar markers immediately.
- If the selected day has no matching events after filtering, the selected-day panel should show an explicit empty state.

### Selected-day detail panel
The selected-day panel should answer: "What is happening on this date?"

Panel requirements:

- Shows the selected date clearly.
- Lists all matching items for that day in time order.
- Each row should expose at minimum:
  - title
  - start time
  - theater name
  - event type
  - status
- Each row should link to the show detail page.
- If no items exist on that day, show an empty state that still preserves the selected date context.

### Upcoming agenda panel
The agenda should answer: "What is next?"

Agenda requirements:

- Display matching items in chronological order.
- Remain visible even when a specific date is selected.
- Support moving through both upcoming and past items so users can inspect schedule history as well as future programming.
- Support empty states when filters remove all matches.
- Reuse the same underlying filtered dataset as the calendar.

This preserves the broad operational view while still letting a user drill into a specific date.

### Timeline controls
The agenda should expose simple timeline controls so users can intentionally inspect the past, future, or both.

Initial timeline scope:

- all
- upcoming
- past

---

## Filters
Filters must affect both the calendar markers and the agenda/day-detail surfaces.

Initial filter scope:

- theater
- event type
- show status

Filter behavior:

- Filters should default to `All`.
- Filter state should update all page modules in one pass.
- Filter state should sync to the URL query string so views are shareable and restorable.
- Changing filters should preserve the currently selected month.
- If the selected date remains in view, keep it selected after filtering.
- If a filter removes all items from the selected date, show the selected-date empty state rather than silently changing the date.

Search is out of scope for this pass unless it becomes necessary during implementation.

---

## Styling Direction
All dashboard surfaces should follow the visual language already used in the stronger Stagecom panels:

- thick ink borders
- warm cream paper background
- structured header rows with strong separators
- compact utility badges
- dense but readable item rows
- bold, practical, neighborhood-brutalist styling

The provided reference panel is the target style signal for:

- selected-day detail card
- upcoming agenda card
- filter container
- supporting stat or status chips if included

The calendar itself may remain a Nuxt UI primitive, but it should be themed or wrapped so it feels part of the same page system rather than a default widget dropped into the layout.

Calendar markers should encode event type and status rather than using a single generic indicator, as long as the result remains legible at compact sizes.

---

## Data Requirements
The current member shows payload only returns one `nextStartsAt` value per show. That is not sufficient for a true month browser that marks matching dates, powers selected-day detail, or supports reliable history browsing.

This feature should therefore be treated in two layers:

### Near-term implementation layer
Ship the dashboard refresh using the occurrence data the app already stores, with a new read model for this page.

Near-term expectations:

- the page should not rely on the existing `/api/shows` shape for calendar or agenda rendering
- the page should read directly from an occurrence-aware payload built from existing `show_occurrences` rows
- the calendar should still adopt the compact Nuxt UI-based interaction model and shared filters
- the page may ship without occurrence editing because this spec only depends on reading existing occurrence data
- any remaining gaps between intended UX and current data support should be documented explicitly, not hidden

### Follow-up data layer needed for full behavior
To support the intended calendar completely, the product will later need occurrence-aware data for the visible month range and for past/future browsing.

Required future data capability:

- return schedule items by occurrence date, not only one next occurrence per show
- support month navigation so the page can request or derive the visible month's items
- support historical browsing, not only the next upcoming occurrence
- preserve enough show metadata for dashboard rows and navigation

Minimum item shape needed by the page:

- show id
- show title
- theater id, name, and slug
- event type
- show status
- occurrence start time
- occurrence end time if present
- occurrence status

Implementation for this feature should favor a dedicated schedule query and response shape for the `Shows` page rather than overloading a payload that only represents "next show".

---

## API / Query Shape
The member `Shows` page should use a dedicated schedule endpoint instead of the current one-row-per-show response.

Recommended route:

- `GET /api/shows/schedule`

Recommended query params:

- `month` as `YYYY-MM`
- `date` as `YYYY-MM-DD`
- `theater`
- `type`
- `status`
- `timeline`

Recommended response shape:

- `items`
  - `occurrenceId`
  - `startsAt`
  - `endsAt`
  - `occurrenceStatus`
  - `show`
    - `id`
    - `title`
    - `status`
    - `eventType`
    - `theaterId`
    - `theaterName`
    - `theaterSlug`
- `filters`
  - available theater options
  - available event type options
  - available status options

The endpoint should apply the same visibility policy already used for member show listing, but return occurrence rows instead of only the next upcoming occurrence per show.

---

## Interaction Rules

- Default selected date should be today when the calendar opens on the current month.
- If today is outside the visible month, select the first day of the visible month.
- Clicking an agenda item or selected-day item navigates to the show detail page.
- Month navigation updates the calendar and refreshes the event markers for that month.
- The agenda should continue to represent the broader chronological dataset, not only the selected date.
- Users should be able to move through past and future items from the dashboard experience.
- Calendar selection is for inspection, not for navigation away from the page.

### URL state
The page should sync its dashboard state to the URL query string so views are shareable and recoverable on refresh.

Initial URL state:

- `month=YYYY-MM`
- `date=YYYY-MM-DD`
- `theater=<id>|all`
- `type=<event-type>|all`
- `status=<show-status>|all`
- `timeline=all|upcoming|past`

---

## Acceptance Criteria

- The `Shows` page uses a compact calendar instead of the current large custom month grid.
- Calendar month navigation works across months.
- Days with matching items are visibly marked, with markers encoding event type and/or status.
- Clicking a day updates a selected-day detail surface.
- A separate agenda remains visible in chronological order and is designed to support both past and future browsing.
- Theater, event type, and status filters affect the calendar and both dashboard panels consistently.
- Filter state syncs to the URL query string.
- The page styling aligns with the Stagecom brutalist dashboard system rather than default Nuxt UI presentation.
- The page remains useful for small theaters with few events and large theaters with many events.
- Existing show detail navigation still works.

---

## Implementation Notes

- Prefer Nuxt UI components for filters and calendar structure.
- Keep custom CSS minimal and reuse shared tokens or patterns where possible.
- If the dashboard panel styling becomes repeated across multiple pages, extract a shared surface primitive instead of duplicating ad hoc wrappers.
- Prefer a dedicated schedule query/composable for this page over extending the existing `useMemberShows()` shape past its intended purpose.
- This spec depends on reading existing `show_occurrences` data, not on building occurrence editing.
- Because this changes shipped application behavior and data flow, final implementation should run `npm run build` from `project/`.

---

## Open Questions

- What is the cleanest temporary UX for month views that do not yet have full occurrence-backed data?
