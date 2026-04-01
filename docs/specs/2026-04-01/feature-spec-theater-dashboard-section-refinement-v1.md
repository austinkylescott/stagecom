# Theater Dashboard Section Refinement v1

## Status

Draft

## Scope

Refine only the top theater-owned section of [project/app/pages/theaters/[slug]/index.vue](/Users/austinscott/Code/stagecom/project/app/pages/theaters/[slug]/index.vue) so it behaves as a theater dashboard rather than a generic stage section.

This spec covers:

- the theater dashboard section currently rendered inside the first `StageSection`
- the layout and responsive behavior of theater identity, metadata, actions, alerts, and next-up summary cards
- extraction of that dashboard UI into a dedicated theater dashboard component that can slot into the page cleanly

This spec does not cover:

- the lower "Upcoming Shows" section
- the lower "All upcoming events" section
- admin alert management workflows
- data model or API changes beyond using fields already available or adding placeholder display fields later

## Problem Statement

The current first section is directionally correct in color and typography, but it still reads as a rough layout pass rather than a stable theater dashboard. The main issues are:

- theater identity, relationship state, and actions do not land consistently across breakpoints
- the alert block and summary stats are not serving the most useful next-step scan
- the mobile layout overflows horizontally instead of collapsing cleanly within the viewport
- the current section is still implemented as page-local markup instead of a dedicated theater dashboard component

## Goals

- Replace the current top-section page markup with a dedicated theater dashboard component.
- Keep the dashboard visually owned by the theater brand color.
- Preserve all currently visible theater metadata across breakpoints.
- Add a theater avatar/logo placeholder aligned with the theater title.
- Keep Theater Alerts on their own row and never inline with theater metadata.
- Replace the current `Shows / Other Events / Next Date` stat boxes with:
  - `Up Next Event`
  - `Up Next Show`
- Ensure the next show card includes a poster/image area that preserves a `1080 / 1350` aspect ratio at every breakpoint.
- Remove horizontal overflow at narrow widths so the page never requires sideways scrolling.
- Use Nuxt UI primitives where they fit, and Tailwind canonical utilities for layout behavior.

## Non-Goals

- Do not redesign fonts, color tokens, or the broader visual language of the page.
- Do not introduce ticketing, marketing, or other out-of-spec actions.
- Do not add alert authoring controls beyond layout placeholders.
- Do not convert the entire theater page into a new architecture in this pass.

## Product Alignment

This section must continue to support the PRD goal that theaters provide a clear public home base for:

- theater identity and trust signals
- location and basic context
- visibility into upcoming programming
- quick access to the full schedule

The section should read as a theater dashboard first, with shows and events presented as programming signals rather than as the sole identity of the page.

## Component Direction

Create a dedicated component for this section, replacing the current page-local hero markup.

Working name:

- `TheaterDashboardSection.vue`

Expectations:

- It should slot into the existing first `StageSection` region of the theater page.
- It should fill that region with the theater-owned brand color already used by the page.
- It should own the layout of:
  - passive relationship label
  - theater avatar + title
  - tagline + address metadata
  - action suite
  - theater alerts
  - up-next cards
- The shared `StageSection` wrapper does not need to be renamed globally in this pass.
- The outer page-level `div.space-y-0` is not the primary design target for this work and should only be removed if implementation proves it is unnecessary.

## Content Requirements

The dashboard must keep all currently visible metadata available at every breakpoint:

- passive relationship label, when present
- theater name
- theater tagline, when present
- full address
- oversight access indicator, when present
- existing action access:
  - Full calendar
  - Create an event
  - Theater admin
  - Theater Actions

Action simplification is allowed at smaller breakpoints:

- `Full calendar` and `Create an event` may collapse into the Theater Actions menu on small screens if needed to preserve layout integrity.
- `Theater admin` may remain visible or collapse into Theater Actions depending on implementation fit, but no currently available action should become inaccessible.

## Dashboard Structure

The dashboard should render in this order on the page:

1. Relationship/status row
2. Theater identity block
3. Theater metadata
4. Action row
5. Theater Alerts
6. Up Next Event
7. Up Next Show

### 1. Relationship/Status Row

- Left side: passive relationship label, when present
  - examples: `Following`, `Home theater`, `Following + home theater`
- Right side: Theater Actions button
- Both items must align on the same horizontal axis at larger breakpoints.
- On small screens, this row may wrap, but the passive relationship label must remain above the theater title block.

### 2. Theater Identity Block

- Add a theater avatar to the left of the theater title.
- Use `UAvatar` as the placeholder implementation until real theater logos exist.
- The avatar must align to the vertical center of the full title block, whether the title wraps to one line or two lines.
- The title remains the dominant element in the section.
- Oversight access can remain as a secondary status line near the identity block, but it should not compete with the title.

### 3. Theater Metadata

- Keep tagline and full address visible below the theater identity.
- Metadata must wrap cleanly and never overflow the viewport.
- Long addresses or taglines must break naturally within the content width.

### 4. Action Row

- The desktop row may include:
  - Full calendar
  - Create an event
  - Theater admin
- The Theater Actions dropdown remains available as the overflow/control surface.
- At medium widths, the main action suite should move below metadata.
- At small widths, action density should reduce before layout breaks.

### 5. Theater Alerts

- Alerts must remain in a dedicated row below theater metadata and actions.
- Alerts should never sit inline with theater metadata.
- The current carousel structure is directionally acceptable.
- Each alert card should display:
  - alert title
  - alert description
  - posted date
  - expiration date
- The UI can still label the message as theater-admin-authored, but the emphasis should be on the alert content and timing.
- Expiration remains visible for now, even though it is mainly an admin-facing operational field.

### 6. Up Next Event

- Replace one of the current stat boxes with a real summary card for the next non-show event.
- This card should call out the next upcoming event whose type is not `show`.
- Include:
  - event type
  - date
  - time
  - title
  - short description or fallback copy
  - producer label
  - CTA to open the event
- If there is no upcoming non-show event:
  - keep the card visible
  - show an empty-state message
  - include a CTA encouraging the user to host an event

### 7. Up Next Show

- Replace one of the current stat boxes with a real summary card for the next show.
- Include:
  - poster/image area
  - date
  - time
  - show title
  - short description or fallback copy
  - producer label
  - CTA to open the show
- The poster/image area may use a `placehold.co` placeholder for now.
- The image container must preserve the `1080 / 1350` aspect ratio at all sizes.
- The image must never stretch, squish, or distort.
- The card layout should allow the image to shrink responsively while remaining legible.
- Target minimum useful thumbnail behavior is approximately in the range of `96x120` to `108x135`, while preserving ratio and layout stability.
- If there is no upcoming show:
  - keep the card visible
  - show an empty-state message
  - include a CTA encouraging the user to host a show

## Responsive Behavior

### Desktop: ~1440px

The dashboard should read as a composed theater board with three distinct bands:

- top band: relationship row, identity block, metadata, and actions
- middle band: Theater Alerts
- bottom band: two side-by-side up-next cards

Desktop requirements:

- The avatar sits to the left of the theater title.
- The avatar stays vertically centered against the title block even when the title wraps.
- Theater Actions is right-aligned on the same horizontal axis as the passive relationship label.
- Alerts appear below the metadata/action area, not beside it.
- `Up Next Event` and `Up Next Show` appear as the replacement for the stat boxes.
- The show card image area must maintain the poster aspect ratio without forcing layout breakage.

### Tablet / Small Desktop: ~1024px

This breakpoint should preserve the current general collapse direction with better content:

- theater metadata remains above the action row
- the action suite moves underneath the theater metadata
- alerts remain below the header area
- the two replacement cards sit below alerts

The behavior the user already liked at this size should be preserved:

- cards may stack beneath the alerts rather than forcing a side-by-side squeeze
- the layout should still feel intentionally composed rather than merely wrapped

### Mobile: ~425px

Mobile must fully collapse without any horizontal scroll.

Required order:

1. passive relationship label
2. avatar + title
3. tagline / address metadata
4. actions
5. alerts
6. up next event
7. up next show

Mobile requirements:

- no container may render wider than the viewport
- borders, padding, and card shadows must remain visible within the viewport
- text and metadata must wrap instead of overflowing
- action buttons may stack or reduce to maintain fit
- alert content must remain fully visible without horizontal scrolling
- the up-next cards must collapse to a single-column stack
- the poster image must shrink proportionally and remain legible

## Layout and Implementation Guidance

Use Nuxt UI and Tailwind best practices:

- Prefer `UAvatar`, `UButton`, `UDropdownMenu`, and existing carousel usage before custom base primitives.
- Use Tailwind grid/flex layout with canonical utilities for breakpoint behavior.
- Prefer local `:ui` overrides for Nuxt UI slot adjustments before adding new shared CSS.
- Avoid page-specific custom CSS unless a pattern becomes reusable.

Implementation direction:

- Use `min-w-0` aggressively on shrinking text containers inside flex/grid rows.
- Avoid grid templates that force a minimum width wider than small screens.
- Use single-column mobile defaults, then layer on `lg:` and `xl:` compositions.
- Keep alert and up-next cards in separate rows so each layout concern can collapse independently.
- For the show poster, use an aspect-ratio container rather than fixed height assumptions.
- If a wrapper is only present to neutralize spacing and provides no layout value, it may be removed during implementation, but that is not the primary fix called for by this spec.

## Acceptance Criteria

- The first section of the theater page is implemented as a dedicated theater dashboard component.
- The dashboard retains the theater-owned color treatment.
- The passive relationship label and Theater Actions align horizontally on large screens.
- A `UAvatar` placeholder appears to the left of the title and stays vertically centered relative to the title block.
- Theater Alerts remain below metadata/actions at all breakpoints.
- The current `Shows / Other Events / Next Date` boxes are removed.
- They are replaced with:
  - an `Up Next Event` card
  - an `Up Next Show` card
- Both cards support real-content and empty-state variants with CTAs.
- The show card image area preserves a `1080 / 1350` aspect ratio without distortion.
- At approximately `1024px`, the action suite moves beneath the metadata cleanly.
- At approximately `425px`, the dashboard renders without horizontal overflow or horizontal scrollbars.
- All current theater metadata remains accessible at every breakpoint.

## Verification Notes

Implementation should be checked in the browser at minimum around:

- `1440px`
- `1024px`
- `425px`

Verification should confirm:

- no horizontal overflow
- correct stacking order on mobile
- correct alignment of relationship label and Theater Actions on large screens
- centered avatar behavior for one-line and two-line title cases
- stable poster ratio behavior in the next show card

