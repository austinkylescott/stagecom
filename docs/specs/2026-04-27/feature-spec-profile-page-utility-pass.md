# Feature Spec: Profile Page Utility Pass

## Date

2026-04-27

## Summary

Rework `/profile` from a decorative account page into a practical `account_settings` surface that lets a user:

- edit public-facing profile identity in one place
- control per-field identity visibility plus contact-method visibility
- manage existing theater memberships directly from the page

## Scope

This pass keeps the current domain model where possible:

- reuse `profiles.handle`
- reuse `profiles.contact_links`
- keep `profiles.visibility` as the profile discoverability control for this pass
- reuse the existing home-theater and membership-toggle flows

A schema migration is required for `profiles.field_visibility`.

## Durable Behavior

### Profile editing

- `/profile` uses one editable profile card rather than split preview and edit panels.
- The card itself is the live editing surface and the only source of truth on the page.
- Profile edits autosave after a short debounce when the user pauses typing or toggling visibility.
- The page should expose save state clearly and may retain a manual `Save now` action as an immediate fallback.
- The editable fields are:
  - display name
  - handle
  - pronouns
  - city
  - bio
  - phone
  - per-field visibility for display name, handle, pronouns, city, and bio
  - email visibility
  - phone visibility
- Timezone remains stored for compatibility but is not shown or edited on `/profile`.
- Each editable field shows an inline icon-based visibility toggle group beside the control.
- Each editable field also shows a live visibility badge or indicator that reflects the draft value currently set on that field.

### Display name fallback

- The form must initialize from the same fallback chain used by `useUserIdentity()`, not only `profiles.display_name`.
- Blank `displayName` submissions are allowed and should fall back through profile metadata and auth email rather than failing validation.

### Field visibility

- Field and contact visibility use the same vocabulary:
  - `public`
  - `theater_only`
  - `private`
- `profiles.field_visibility` is normalized to this shape:

```ts
{
  displayName: "public" | "theater_only" | "private",
  handle: "public" | "theater_only" | "private",
  pronouns: "public" | "theater_only" | "private",
  city: "public" | "theater_only" | "private",
  bio: "public" | "theater_only" | "private"
}
```

- `profiles.contact_links` is normalized to this shape:

```ts
{
  email: { source: "auth", visibility: "public" | "theater_only" | "private" },
  phone: { value: string | null, visibility: "public" | "theater_only" | "private" }
}
```

- Email is always derived from the authenticated user record.
- Phone is stored in `profiles.contact_links.phone.value`.
- `profiles.visibility` remains the saved profile discoverability setting.

### Membership management

- `/api/me/theater-hub` returns one shared membership summary shape for home and non-home memberships.
- `/profile` renders one actionable card per active membership with:
  - theater identity
  - membership status
  - role badges
  - `Open theater`
  - `Make home` / `Remove home`
  - `Leave theater`

## API Changes

### `GET /api/me/profile`

Add:

- `handle`
- `fieldVisibility`
- `contactLinks`
- `shareableContacts`

### `POST /api/me/profile`

Accept:

- `handle`
- normalized `fieldVisibility`
- normalized `contactLinks`
- compatibility `timezone`

Return field-level validation issues for invalid or duplicate handles so the page can surface them inline.

### `GET /api/me/theater-hub`

Return active memberships in one summary array regardless of `is_home`.

## Documentation Follow-through

Update:

- `docs/product/visibility-policy.md`
- `docs/data/data-model.md`
- `wiki/features/profile-and-identity.md`
- `wiki/data/profiles.md`
- `wiki/features/visibility-policy.md`
