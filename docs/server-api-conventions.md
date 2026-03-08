# Server API Conventions

This project standardizes server route behavior to keep auth, permissions, and validation logic consistent.

## Auth

- Use `requireUser(event, supabase)` when authentication is required.
- Use `requireUserId(event, supabase)` when only the user id is needed.
- Use `getOptionalUser(event, supabase)` / `getOptionalUserId(event, supabase)` for anonymous-friendly routes.
- Do not call `serverSupabaseUser` or `supabase.auth.getUser()` directly in route files.

## Permissions

- Use `hasStaffRole(roles)` for staff checks.
- Use `staffRoles` from `server/utils/permissions.ts` for shared role definitions.
- Do not redefine staff role arrays or role-check helpers inside routes.

## Validation

- Validate route input at the request boundary before database writes.
- Use `parseParams(event, schema)`, `parseQueryParams(event, schema)`, and `parseBody(event, schema)` from `server/utils/validation.ts`.
- Validation failures return a consistent `400` payload:
  - `error: "validation_error"`
  - `source: "params" | "query" | "body"`
  - `issues: [{ code, message, path }]`

## Guardrail Check

- Run `npm run check:server-conventions` to detect:
  - direct route usage of `serverSupabaseUser` / `supabase.auth.getUser()`
  - duplicated inline staff role array definitions
  - redefined `hasStaffRole` in route files

In CI, add `npm run check:server-conventions` as a required check.
