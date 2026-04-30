# Feature Spec: Profile Visibility Model V1

## Date

2026-04-30

## Summary

Clarify and implement Stagecom profile visibility as two separate controls:

- profile discoverability controls whether a person can appear across the app
- field visibility controls which saved profile fields a qualified viewer can see

This keeps Stagecom usable both as a social/discovery surface and as a theater operations tool.

## Product Rules

### 1. Profile discoverability

Each profile has one primary visibility scope stored in `profiles.visibility`:

- `public`
  - visible to anyone using the app where people can appear
- `theater_only`
  - visible only to users who share at least one active theater membership with that person
- `private`
  - visible only to the profile owner
  - the user still keeps full access to their own tools, memberships, scheduling, casting participation, and account actions
  - the user does not appear in discovery/search results, theater rosters, show people surfaces, or invite pickers for others

Default profile discoverability is `theater_only`.

### 2. Field visibility

Each saved field still has its own visibility:

- `public`
- `theater_only`
- `private`

Field visibility never makes a profile appear more broadly than the profile's own discoverability setting.

That means:

- a `private` profile stays undiscoverable even if one field is marked `public`
- a `theater_only` profile may expose some fields as `public`, but only after a viewer is already allowed to encounter that profile through theater-scoped discovery
- a `public` profile may still keep individual fields at `theater_only` or `private`

### 3. Practical interpretation

Use the profile-level setting to answer:

- can other users encounter this person in the app at all?

Use field-level settings to answer:

- once the person is visible, which saved fields can this viewer inspect?

### 4. Theater-scoped behavior

For profile discoverability, `theater_only` is overlap-based:

- a viewer must share at least one active theater membership with the profile owner
- this applies across search, theater pages, show pages, performer lists, and similar people-discovery surfaces

### 5. Private operational behavior

`private` does not disable the user's normal product participation.

Private users can still:

- join theaters
- set home theaters
- create and produce shows if otherwise authorized
- be cast when they initiate or participate in workflows that do not require public discovery
- use schedules, notifications, and profile tools

Private users should not:

- appear in general people search
- appear in theater/show/member discovery surfaces for other users
- be available in invite/search pickers driven by profile discovery

## Data Model

`profiles.visibility` is the profile discoverability field and is no longer documented as a derived compatibility summary.

`profiles.field_visibility` stores per-field rules for:

- `display_name`
- `handle`
- `pronouns`
- `city`
- `bio`

`profiles.contact_links` stores per-contact-method visibility.

## API / Enforcement Direction

- Route and helper logic should enforce discoverability first, then field visibility.
- RLS should continue to help with row-level profile access where practical.
- Field-level hiding still requires route/helper shaping because the visible fields live inside one profile row and JSON payload.

## UI Direction

The profile page should present:

- one overall visibility preset row with `Public`, `Theater only`, `Private`, and `Custom`
- separate field-level controls beside each editable field
- copy that explains discoverability and field privacy are separate
- one preview-audience selector outside the profile card itself
- one preview card that reflects the same unsaved draft state regardless of which viewer perspective is selected

The overall preset row should behave like this:

- choosing `Public`, `Theater only`, or `Private` updates `profiles.visibility` and all field/contact visibility toggles to match
- `Custom` is a UI-only mixed state, not a stored database value
- when field-level toggles no longer match the current overall preset, the overall row switches to `Custom`
- choosing `Custom` does not rewrite the lower-level field toggles

The discoverability default remains `theater_only`, and preview controls should not require a separate save cycle.
