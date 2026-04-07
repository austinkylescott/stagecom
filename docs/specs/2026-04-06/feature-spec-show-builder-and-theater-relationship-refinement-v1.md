# Feature Spec: Show Builder and Theater Relationship Refinement v1

## Summary
Build a theater-centered event proposal flow that treats Stagecom as the canonical system of record for show data, review, and eventual public representation. Keep theater pages under `/theaters/[slug]`, add a clearer top-level `/shows` workspace, and reframe theater relationships around `public viewer -> theater member -> show producer / cast / show staff / theater admin`.

This slice should replace the current thin `new show` form with a guided draft-to-review builder that captures enough structured data for theater staff to evaluate calendar fit and, once approved and published, power the public event page without a separate CMS.

## Product Direction

### Theater relationship model
- Non-members are public viewers only.
- Theater membership is the main authenticated relationship to a theater.
- Home theater remains a separate hub-pinning concept, not a substitute for membership.
- A theater member may submit event proposals for that theater.
- The creator of an event is considered a producer for that event.
- Cast membership remains explicit and separate from producer status.
- Show staff is a separate event-level role from cast and producer.
- Theater admins and theater staff retain broader theater oversight and show-level override capability.

### Vocabulary direction
- Replace `follow/unfollow` language in authenticated theater surfaces with `join/leave theater` or `membership` language.
- Keep discovery available, but make it a secondary action rather than the default theater workflow.
- Update theater CTAs so members see a clear event action such as `Propose Event` or `Book an Event`.
- Non-members should see public-view and join-theater actions instead of producer-oriented actions.

## Route and Workspace Direction
- Keep the canonical theater hub at `/theaters/[slug]`.
- Keep the creation route at `/theaters/[slug]/shows/new`, but reframe it as a generic event proposal builder for `show`, `workshop`, `practice`, `audition`, and `meeting`.
- Keep the canonical operational record at `/theaters/[slug]/shows/[id]`.
- Strengthen `/shows` into the cross-theater work board for the signed-in user’s owned, assigned, and monitored events.
- Do not move theater pages to top-level `/<slug>` in this slice.

## Builder Workflow

### Goal
Replace the current single-screen basic form with a guided builder that captures enough structured data for:
- theater staff to evaluate fit against calendar and other proposals
- Stagecom to power the public-facing representation of the event once approved and published

### Proposed builder steps
1. Event basics
   - event type
   - title
   - short promo summary
   - full description
   - optional internal note to theater management
2. Schedule and occurrences
   - one or more occurrences
   - timezone-aware scheduling
   - optional end time
   - optional runtime or door notes if already known
3. Public listing essentials
   - ticket URL
   - optional on-sale timing
   - placeholder poster state until artwork exists
   - public-facing listing readiness fields
4. Casting and staffing
   - casting mode
   - cast min and max
   - early casting notes
   - optional preliminary staff needs and assignments
5. Review and submission
   - preview of public-facing representation
   - clear missing-field warnings
   - save draft or submit for review

### Draft and review behavior
- Drafts remain producer-editable and private to authorized users.
- Submission moves the event to `pending_review` and creates a structured review record.
- Approval is not the same thing as publication.
- `approved + is_public_listed = false` means approved but not live publicly.
- `approved + is_public_listed = true` means approved and publicly visible.
- Rejection or changes-requested should return the event to producer follow-up without losing management notes.

## Data and Permission Changes

### Show data expansion
Extend `shows` to hold the minimum public-representation fields needed for Stagecom to be the final source of truth.

Recommended additions:
- short summary field for cards and listing copy
- nullable poster or image metadata with placeholder support
- optional internal producer note to theater management

Recommended reuse:
- keep `description` as the long description

### Occurrence handling
- Extend creation from optional single occurrence entry to explicit multi-occurrence creation and editing in the builder.
- Show detail and theater views should understand grouped occurrences as first-class event data.

### Show staff assignments
Add first-class show staff assignment data instead of treating staff as freeform notes.

Recommended table:
- `show_staff_assignments(show_id, user_id, assignment_type, status, note)`

Recommended minimum assignment types:
- `front_of_house`
- `box_office`
- `bar`
- `tech`
- `other`

### Permission rules
- Public viewers see only approved and public-listed event data.
- Theater members can create proposals and see theater-member-only context where allowed.
- Producers can edit proposal content and see full event operations.
- Show staff can see full event operations but cannot edit proposal-defining fields.
- Theater admins and theater staff can review, edit, publish, and assign roles.

## API and Interface Changes
- Expand `POST /api/theaters/:slug/shows` to accept the full builder payload, including multiple occurrences and the new listing and review fields.
- Add show update endpoints for draft sections instead of forcing all edits through the create payload.
- Expand `GET /api/shows/:id` so the show workspace can render:
  - public-facing fields
  - internal review notes
  - staffing assignments
  - occurrence groups
- Expand shared app query types for:
  - public summary vs internal notes
  - poster placeholder or image state
  - multiple occurrences
  - show staff assignments
  - publication state separate from approval state

## Documentation Changes
- Update `docs/data/data-model.md` for new show fields, multi-occurrence expectations, and show staff assignments.
- Update theater relationship wording in relevant product and UX docs so membership language replaces follow language where appropriate.
- Update review-flow docs that currently imply approval and publication are the same step.

## Acceptance Criteria
- A theater member can open the builder, save an incomplete draft, return later, and continue editing.
- A non-member cannot access the builder and is redirected into the membership path.
- Submitted proposals create a pending-review record and appear in theater review surfaces.
- Approved-but-unpublished events remain hidden from public theater boards.
- Published events appear on theater public surfaces and contain enough content to stand as the full public event record.
- Multi-occurrence events render correctly in theater and show views.
- Producers, cast, show staff, and theater admins each receive the intended visibility and edit permissions.

## Testing
- Extend server tests for builder creation payload validation.
- Extend visibility and permission tests for the new role rules and public listing states.
- Extend show detail tests for multi-occurrence and staffing payloads.
- Run `npm run check:server-conventions` after route changes.
- Run `npm run build` before implementation is considered ready.

## Assumptions
- No external CMS is introduced in this slice.
- Stagecom plus Supabase remains the canonical content system.
- Route overhaul to top-level theater slugs is deferred.
- The producer checklist informs field coverage, but v1 captures approval-critical and public-representation essentials first rather than every downstream operational task.
- Chat, deep staffing workflows, and the full casting system remain follow-on slices, but this work should add the data hooks and permissions needed so the show workspace can grow into them cleanly.
