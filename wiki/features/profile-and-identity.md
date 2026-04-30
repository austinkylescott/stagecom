# Profile And Identity

**Status:** current
**Last updated:** 2026-04-30
**Sources:** [[raw/product/PRD.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/research/visibility-rules.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]], [[raw/specs/2026-04-27/feature-spec-profile-page-utility-pass.md]], [[raw/specs/2026-04-30/feature-spec-profile-visibility-model-v1.md]]

Profiles are personal identity surfaces, not generic settings pages.

## Stable Rules

- Users always see their own profile.
- Visibility is user-controlled.
- Profile discoverability and field visibility are separate controls.
- `private` profile discoverability hides the user from other users without removing access to normal Stagecom tools.
- Profile editing lives on `/profile` as one account-settings surface rather than split read-only and editable panels.
- Handle, pronouns, city, bio, and contact visibility are part of the active profile surface.
- Identity fields on `/profile` each own their own visibility control.
- Theater affiliations for other users are filtered to shared-theater or explicit theater-context visibility.
- Home-theater preference is identity context, not authorization.

## Current Profile Surface

- `/profile` includes:
  - one editable profile card as the authoritative editing surface
  - one overall visibility preset row above the field-level controls with `Public`, `Theater only`, `Private`, and `Custom`
  - live per-field and per-contact visibility badges that reflect the current draft values
  - inline per-field identity and contact visibility controls
  - one preview-audience selector above the card, not inside it
  - `Custom` as a UI-only mixed state when field-level visibility no longer matches the overall preset
  - debounced autosave with visible save-state feedback and persisted toasts
  - actionable active-theater membership cards in a lower supporting section
- Membership actions on `/profile` are limited to:
  - open theater
  - make home / remove home
  - leave theater

## Contact Visibility

- Identity-field visibility and contact-method visibility are separate controls.
- Account email is always derived from auth, not stored as a second profile email.
- Phone number is profile-managed and visibility-controlled through `profiles.contact_links`.

## Product Direction

The redesign specs expect profile to feel specific to community-theater identity rather than a copied SaaS settings screen.
It should read as a user-first identity and visibility page before it reads as a theater-membership management surface.

## Privacy Implication

Profile discoverability, field visibility, and affiliation visibility are
separate concerns. A visible profile should not automatically expose every field
or all of that person's theater relationships.

Implementation detail:
- current server behavior enforces discoverability first, then filters field payloads by field-level visibility
- performer directories still require at least one visible identity field before a discoverable profile is returned

## Related
- [[wiki/data/profiles]]
- [[wiki/features/theater-creation-and-membership]]
- [[wiki/features/notifications]]
