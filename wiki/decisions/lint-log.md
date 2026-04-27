# Lint Log

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/data/data-model.md]], [[raw/product/visibility-policy.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]], [[raw/research/visibility-rules.md]]

## 2026-04-21 Initial Seed Lint

### Outdated pages

- None yet. This is the initial seeded wiki set.

### Contradictions

- Canonical route conflict:
  - [[raw/data/data-model.md]] and [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]] document `/theater/[slug]` and `/theater/[theaterSlug]/event/[eventSlug]`.
  - [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]] and [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]] document `/{theaterSlug}` and `/{theaterSlug}/{eventSlug}`.
- Protected-response conflict:
  - [[raw/product/visibility-policy.md]] says protected visibility failures should return `403`.
  - [[raw/research/visibility-rules.md]] records current non-public show behavior as `404`.
- Schedule-home evolution conflict:
  - [[raw/specs/2026-04-07/feature-spec-schedule-system-unification-v1.md]] makes `/schedule` canonical.
  - [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]] and [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]] replace that with `/callsheet`.

### Orphan pages

- None found in the seeded wiki set. Every page is linked from [[wiki/_index]] and at least one related page.

### Referenced Concepts Missing Their Own Page

- `show_staff_assignments` has not been split into its own page yet; it is currently summarized inside [[wiki/data/shows]].
- `/dev/components` fixture strategy is covered inside design-system pages but does not yet have a dedicated wiki page.
- The route-model conflict may eventually justify a dedicated decision page if a final canonical path structure is chosen.

### Notes

- The wiki currently treats the 2026-04-12 design bundle as the strongest design authority while preserving earlier contradictions explicitly.

## Related
- [[wiki/_index]]
- [[wiki/architecture/route-model]]
- [[wiki/features/visibility-policy]]
