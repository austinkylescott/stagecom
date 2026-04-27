# Show Cast

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/product/visibility-policy.md]], [[raw/research/visibility-rules.md]]

`show_cast` is the explicit performer-membership record for a show/event.

## Key Fields

- `show_id`
- `user_id`
- `source`
- `status`
- `program_order`
- `note`

## Stable Rules

- Producers do not appear here unless explicitly added.
- Only accepted performers appear in the public/program-facing lineup.
- `program_order` is application-managed and must remain collision-free.
- Accepted performers may still have `program_order = null` until placed.

## Status Model

- `pending`
- `accepted`
- `declined`
- `withdrawn`
- `removed`

## Visibility Model

- Producers and authorized theater oversight can inspect full cast state.
- Performers can inspect their own cast record.
- Accepted cast is the broadest visible program state.

> ⚠️ Conflict: [[raw/product/visibility-policy.md]] treats pending-cast visibility as a scoped policy decision, while [[raw/research/visibility-rules.md]] records current behavior where accepted castmates can also see pending cast and invited pending performers can see broader pending state. This should be treated as implemented behavior, not a settled product invariant.

## Related
- [[wiki/data/shows]]
- [[wiki/features/casting-system]]
- [[wiki/data/permissions-model]]
