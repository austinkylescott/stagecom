# Feature Spec: Show Lifecycle v1 (Stagecom)
Derived from PRD v0.2 (Locked)

---

## Summary
Defines the creation, approval, casting, and execution lifecycle of a show.

This is the first complete vertical slice.

---

## Show Creation Rules
- Any authenticated user may create a show
- Creator is automatically assigned as Producer
- Producer is **not automatically cast**
- Shows begin in Draft state

---

## Approval Workflow
- All shows must enter a Review Queue
- Theater Managers or Staff may approve or reject
- Only approved shows may be publicly listed or put on sale

### Show States
- Draft
- Pending Review
- Approved
- Rejected
- Cancelled

---

## Casting Modes
All casting modes support **direct invites**.

### Invite-Only (Direct Invite)
- Only invited performers may respond

### Theater Community Casting
- Visible to theater members
- Members may request to play
- Producer selects performers
- Producer may still invite performers directly

### Public Casting Call
- Visible to all users on the platform
- Anyone may request to play
- Producer approves requests
- Producer may still invite performers directly

---

## Cast Size Range
Each show defines either:
- An exact cast size (e.g. 2 players)
- A range (e.g. 8–10 players)

Behavior:
- UI shows confirmed count vs range
- Warnings when exceeding max (do not hard-block in v1)
- Producer may mark the show “Cast Finalized”

---

## Performer Assignment Flow
- Invitations and requests create pending assignments
- Performers may accept or decline
- Accepted performers appear in program view
- Withdrawals notify producers

---

## Program View
- Read-only
- Accepted performers only
- Ordered lineup (program_order)
- Optimized for mobile

---

## Acceptance Criteria
- Producers are never assumed to be performers
- Cast membership requires an explicit show_cast entry
- Only accepted performers appear in program
- Unapproved shows are not publicly visible
- Assignment and schedule changes trigger notifications
