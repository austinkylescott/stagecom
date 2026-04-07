# Show Builder Review Follow-Ups

Open follow-up items from feature review for `Show Builder and Theater Relationship Refinement v1`.

These are intentionally narrow implementation issues to revisit after the current UI/design swing. They are not new feature ideas.

## 1. Restrict draft editing by show status

### Problem

The draft update path currently allows producers or theater staff to edit event setup regardless of the show status.

This means submitted or approved events can still have proposal-defining fields changed through the draft editor.

### Why it matters

The current spec treats draft editing, review, approval, and publication as distinct states.

If approved or pending-review events stay fully editable through the draft endpoint, the approval model becomes unreliable and theater staff may approve one version while the producer later changes core details.

### Current locations

- `project/server/api/shows/[id]/draft.patch.ts`
- `project/server/api/shows/[id]/index.get.ts`
- `project/app/pages/theaters/[slug]/shows/[id].vue`

### Expected follow-up

- Gate draft edits by status, not just by role.
- Revisit when `Edit setup` should be shown in the UI.
- Align the permitted edit states with the feature spec.

## 2. Make occurrence and staff replacement safe

### Problem

Occurrence and staff updates currently use a delete-then-insert replacement flow.

If the insert step fails after deletion, the event can lose all occurrences or all staff assignments.

### Why it matters

This creates a real data-loss path during normal editing.

The risk is higher for staff assignments because the new table has a uniqueness constraint on `(show_id, user_id, assignment_type)`, so duplicate rows in the payload can cause the insert to fail after the delete already succeeded.

### Current locations

- `project/server/utils/show-draft.ts`
- `project/supabase/migrations/20260406120000_show_builder_refinement.sql`

### Expected follow-up

- Replace the destructive delete-then-insert flow with a transactional or otherwise safe replacement strategy.
- Add validation to reject duplicate staff assignments before mutation.
- Add targeted tests for replacement failure cases.

## 3. Reconcile draft-save rules with the spec

### Problem

The builder currently requires a non-empty title even for draft saves.

That means the implementation does not fully match the spec language that says a user should be able to save an incomplete draft and return later.

### Why it matters

Either the implementation is too strict, or the acceptance criteria are overstated.

This should be resolved explicitly so the product behavior is intentional rather than incidental.

### Current locations

- `project/server/utils/show-draft.ts`
- `project/server/api/theaters/[slug]/shows.post.ts`
- `project/server/api/shows/[id]/draft.patch.ts`
- `docs/specs/2026-04-06/feature-spec-show-builder-and-theater-relationship-refinement-v1.md`

### Expected follow-up

- Decide whether draft saves may be truly incomplete.
- If yes, loosen draft validation and keep readiness checks for review submission.
- If no, update the spec and acceptance criteria to reflect the stricter rule.
