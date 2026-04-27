# Server API Patterns

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/development/server-api-conventions.md]], [[raw/development/coding-rules.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]]

Server routes are expected to keep auth, permissions, and validation explicit at the boundary.

## Auth Helpers

- `requireUser()`
- `requireUserId()`
- `getOptionalUser()`
- `getOptionalUserId()`

Routes should not call `serverSupabaseUser` or `supabase.auth.getUser()` directly.

## Permission Rules

- Sensitive reads must make an explicit authorization decision before returning data.
- Shared theater-staff logic should use permission helpers, not route-local arrays.
- If a service-role client is used for reads, authorization must be computed first and the query must stay narrowly scoped.

## Validation Boundary

- `parseParams()`
- `parseQueryParams()`
- `parseBody()`

Validation failures should return a consistent `400` payload with source and issue data.

## Guardrail

`npm run check:server-conventions` is a required verification step after route changes, but it only checks convention usage, not correctness of the permission model.

## Related
- [[wiki/data/permissions-model]]
- [[wiki/architecture/data-fetching]]
- [[wiki/features/theater-admin-and-review]]
