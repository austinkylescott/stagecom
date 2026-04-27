# No ORM Policy

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/development/coding-rules.md]], [[raw/data/data-model.md]]

## Decision

Stagecom remains Postgres-first and Supabase-friendly without introducing a separate ORM layer.

## Reasoning

- The project already depends on Supabase client patterns plus generated database types.
- The docs explicitly reject adding Prisma, Drizzle, or another ORM without a repo-wide justification and synchronized documentation changes.
- Product/data invariants are expected to stay close to the documented schema.

## Related
- [[wiki/architecture/stack-and-layout]]
- [[wiki/data/shows]]
- [[wiki/decisions/nuxt-ui-v4-only]]
