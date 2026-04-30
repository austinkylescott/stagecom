# Visibility Policy

**Status:** current
**Last updated:** 2026-04-30
**Sources:** [[raw/product/visibility-policy.md]], [[raw/research/visibility-rules.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/specs/2026-04-27/feature-spec-profile-page-utility-pass.md]], [[raw/specs/2026-04-30/feature-spec-profile-visibility-model-v1.md]]

This page summarizes the maintained visibility vocabulary and the main implementation nuances captured by the research snapshot.

## Canonical Scopes

- `public`
- `authenticated`
- `theater_only`
- `relationship`
- `oversight_only`
- `self_only`

## Stable Surface Rules

- Theater identity is public.
- Theater review queue is oversight-only.
- Non-public shows are relationship-gated with oversight override.
- Performer profile discoverability is separate from performer field visibility.
- `private` performer profiles are self-only for discovery but still operationally valid for the owner.
- Performer affiliation visibility is overlap-based.
- Notifications are self-only.

## Current Implementation Nuances

- Accepted cast visibility is broader than pure public/program visibility.
- Invited pending performers currently have more pending-cast visibility than requested pending performers.
- Theater admin, manager, and staff are distinct model roles but often share current oversight behavior.
- Performer identity fields and contact methods are controlled separately from performer profile discoverability.
- Current performer discovery first checks `profiles.visibility`, then applies per-field visibility shaping.

> ⚠️ Conflict: The policy doc says protected visibility failures should return `403`; the research snapshot says current non-public show behavior returns `404` to hide existence. The wiki should treat this as unresolved API semantics rather than a settled rule.

## Recommended Mental Model

Keep these as separate questions:

- Can the viewer see the resource?
- Can the viewer see accepted cast?
- Can the viewer see pending cast?
- Can the viewer take a participation action?
- Can the viewer see the performer's email?
- Can the viewer see the performer's phone?
- Can the viewer see this specific performer profile field?
- Can the viewer encounter this performer in discovery surfaces at all?

## Related
- [[wiki/data/permissions-model]]
- [[wiki/data/show-cast]]
- [[wiki/features/theater-admin-and-review]]
