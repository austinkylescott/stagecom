# Data Fetching Conventions

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/development/data-layer.md]], [[raw/development/coding-rules.md]]

The frontend data layer uses Pinia Colada.

## Rules

- Reads are queries.
- Writes are mutations.
- Query keys come from `queryKeys.ts`.
- Shared fetch logic lives in `project/app/queries/*.ts`.
- Shared consumer logic lives in `project/app/composables/*.ts`.
- SSR auth-aware fetches use request cookies on the server and `credentials: "include"` in `$fetch`.

## Extraction Guidance

- Use a composable when the query is shared.
- Keep truly single-use fetches local to the page.
- Mutations must invalidate or update the relevant query keys on success.

## Product Implication

Later schedule and theater specs repeatedly push toward dedicated read models rather than overloading broad list payloads. The wiki should assume "fetch the slice the UI actually renders" is the preferred architecture.

## Related
- [[wiki/features/schedule-and-callsheet]]
- [[wiki/features/theater-creation-and-membership]]
- [[wiki/architecture/server-api-patterns]]
