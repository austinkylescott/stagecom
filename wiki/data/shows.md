# Shows

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/data/data-model.md]], [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/specs/2026-04-06/feature-spec-show-builder-and-theater-relationship-refinement-v1.md]]

`shows` is the canonical event record even though the table name still says "shows." By 2026-04-06, the product direction is to treat event as the umbrella concept while keeping theater ownership explicit.

## Key Fields

- ownership: `theater_id`, `created_by_user_id`
- routing: `slug` unique within a theater
- workflow: `status`, `is_public_listed`
- public content: `title`, `summary`, `description`, `poster_url`, `ticket_url`, `on_sale_at`
- internal review: `producer_note`
- classification: `event_type`
- casting: `casting_mode`, `cast_min`, `cast_max`, `is_cast_finalized`

## Workflow State

- `draft`
- `pending_review`
- `approved`
- `rejected`
- `cancelled`

Approval and public listing are separate:

- `approved + is_public_listed = false` means approved but not publicly live
- `approved + is_public_listed = true` means publicly visible

## Occurrences

`show_occurrences` is the occurrence-first schedule layer.

- shows may have multiple occurrences
- occurrence rows drive schedule surfaces
- occurrence editing was originally deferred, then later expanded by the builder spec

## Show Staff

The 2026-04-06 builder spec adds `show_staff_assignments` as a first-class event-operations relationship. Show staff can inspect operations but do not automatically receive producer-level editing powers.

## Related
- [[wiki/data/show-cast]]
- [[wiki/features/show-lifecycle]]
- [[wiki/features/schedule-and-callsheet]]
