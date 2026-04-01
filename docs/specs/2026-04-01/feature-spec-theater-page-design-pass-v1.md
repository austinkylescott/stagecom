# Theater Page Design Pass v1

## Status

Draft

## Scope

Redesign `project/app/pages/theaters/[slug]/index.vue` so the theater page reads as the theater's home board first, with shows and other events presented as supporting programming modules.

This work remains on the current branch by request.

## Goals

- Lead with a theater-owned top section in the theater color, not a show-owned hero.
- Keep a clear alert near the top that explains what the page is for.
- Make location, theater identity, tagline, and calendar access immediately visible.
- Reduce the prominence of the upcoming shows module and limit it to the next 3 shows.
- Add a distinct "All Upcoming Events" section that includes every visible public event type.
- Preserve visibility-policy behavior by only presenting events already returned by the theater details API.
- Use the semantic palette intentionally:
  - theater surfaces use `--stage-theater`
  - show surfaces use `--stage-event`
  - people/relationship accents use `--stage-performer`

## Content Priorities

The page should answer:

- what this theater page is
- where the theater is
- what shows are next
- who is producing and who is on cast for upcoming shows
- what non-show events are coming up
- how to open the full theater calendar

## Layout Direction

### 1. Theater Header

- Saturated theater-color wrapper with the page alert integrated near the top.
- Theater name, tagline, address, and compact board summary in the main hero area.
- Calendar access should be a primary action.
- Membership/home/admin context can remain present, but secondary to theater identity.

### 2. Upcoming Shows

- Compact module focused on the next 3 shows only.
- Keep yellow as an accent, not as the dominant page background.
- Each card should make date/time, producer, cast preview, and show title easy to scan.

### 3. All Upcoming Events

- Show every upcoming visible event in chronological order.
- Include both shows and non-show event types.
- Clearly distinguish show rows from non-show rows using restrained semantic accents.
- Keep the full calendar link visible from this section as well.

## Implementation Notes

- Prefer existing Nuxt UI primitives plus Tailwind utility composition.
- Avoid global theme changes unless a reusable pattern clearly emerges.
- Do not add dead-end actions or placeholder ticket UI in this pass.
