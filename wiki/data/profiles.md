# Profiles

**Status:** current
**Last updated:** 2026-04-30
**Sources:** [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/research/visibility-rules.md]], [[raw/data/data-model.md]], [[raw/specs/2026-04-27/feature-spec-profile-page-utility-pass.md]], [[raw/specs/2026-04-30/feature-spec-profile-visibility-model-v1.md]]

Profiles are user-owned identity records with user-controlled visibility.

## Visibility Levels

- `public`
- `theater_only`
- `private` / self-only

## Stable Rules

- Users can always view and update their own profile.
- Anonymous viewers only see public profiles.
- Signed-in viewers may see `theater_only` profiles when they share an active theater membership.
- `profiles.visibility` is the profile discoverability control:
  - `public` lets the profile appear app-wide
  - `theater_only` limits profile appearance to shared-theater viewers
  - `private` hides the profile from other users but does not disable the owner's normal product access
- Theater affiliation visibility is stricter than profile visibility and should not leak unrelated memberships.
- `profiles.handle` is the active optional public identity field.
- `profiles.contact_links` is the active storage for contact visibility and phone value.
- `profiles.field_visibility` is the active storage for per-field identity visibility.
- Account email is auth-derived and should not be duplicated into `profiles`.

## Identity Field Visibility

`profiles.field_visibility` is currently normalized as:

```ts
{
  displayName: "public" | "theater_only" | "private",
  handle: "public" | "theater_only" | "private",
  pronouns: "public" | "theater_only" | "private",
  city: "public" | "theater_only" | "private",
  bio: "public" | "theater_only" | "private"
}
```

Field visibility is evaluated only after the profile itself is discoverable to
that viewer. It does not widen discoverability beyond `profiles.visibility`.

## Contact Links Shape

`profiles.contact_links` is currently normalized as:

```ts
{
  email: { source: "auth", visibility: "public" | "theater_only" | "private" },
  phone: { value: string | null, visibility: "public" | "theater_only" | "private" }
}
```

## Discoverability And Operations

Private profiles are still operationally valid users. A private user may still:

- join theaters
- hold memberships and home-theater state
- produce or participate in shows when otherwise authorized
- use schedule, notifications, and account tooling

Private users should not appear to others in discovery-driven people surfaces.

## Home Theater Note

`profiles.home_theater_id` is legacy compatibility state, not the intended long-term source of truth for home-theater preference once multi-home is enabled.

## Related
- [[wiki/features/profile-and-identity]]
- [[wiki/data/theater-memberships]]
- [[wiki/data/permissions-model]]
