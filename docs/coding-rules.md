# Coding Rules (Stagecom)

These rules exist to keep Stagecom aligned with the current product docs, data model, and codebase conventions. Treat them as implementation guardrails, not optional style notes.

## 1. Source of truth

- Every feature must map back to `docs/PRD.md`.
- Follow `docs/ai-interaction.md` for AI workflow, branching, commit, and collaboration expectations.
- Do not introduce schema-level entities or change table meaning without updating `docs/data-model.md`.
- Do not change schema, DB-backed assumptions, or seed expectations without updating the mock-data workflow and example config in the same change.
- Significant behavior changes must update the relevant docs in the same change:
  - `docs/PRD.md` for product or role changes
  - `docs/data-model.md` for schema or relationship changes
  - `docs/events-and-notifications.md` for event or recipient changes
  - `docs/mock-data-workflow.md` and the mock-data configs/scripts when database-backed test expectations change
  - feature specs in `docs/` when behavior is spec-driven

## 2. Stack requirements

- Use TypeScript across application and server code.
- Frontend code targets Nuxt 4 with Vue 3 and lives under `project/app/` because `srcDir` is set to `app` in `project/nuxt.config.ts`.
- Use Nuxt UI v4 components and patterns for app UI. Do not introduce a second component library.
- Use Tailwind utilities and the shared theme in `project/app/assets/css/main.css`.
- Use Supabase for auth and database access patterns already established in the repo.
- The project does not currently use an ORM. Do not add Prisma, Drizzle, or another ORM unless there is a clear repo-wide need and the docs are updated first.
- Use Zod for server-side request validation.
- Use Vitest for tests.

## 3. TypeScript and typing rules

- Prefer explicit domain types over `any`.
- Reuse generated database types from `project/app/types/database.types.ts` for Supabase rows, inserts, updates, and enums.
- Prefer `Tables<...>`, `TablesInsert<...>`, and `Enums<...>` when mapping DB-backed payloads.
- Keep API response types near the query modules that own them, following existing `project/app/queries/*.ts` patterns.
- If a value is nullable in the database or API, model it explicitly instead of normalizing it away silently.

## 4. Nuxt and Vue rules

- Use Vue single-file components with `<script setup lang="ts">`.
- Server components by default. Pages and components should be rendered server-side when possible.
- Prefer Nuxt auto-imported composables and helpers instead of manual plumbing when that is already the repo pattern.
- Keep page-level route handling in pages and middleware, and shared data/state logic in composables.
- Use route middleware for auth gating, following `project/app/middleware/auth-guard.global.ts`.
- When building authenticated SSR queries, pass `useRequestHeaders(["cookie"])` on the server and `credentials: "include"` in `$fetch`.
- Keep components focused – One job per component. 
- Extract reusable logic into composables

## 5. Nuxt UI and styling rules

- Prefer Nuxt UI primitives such as `UButton`, `UCard`, `UInput`, `UFormField`, `UHeader`, `UNavigationMenu`, and related components before writing custom base UI.
- Match the visual language already configured in `project/app/assets/css/main.css` and `project/nuxt.config.ts`.
- Reuse the configured font tokens and shared theme variables rather than importing ad hoc fonts per page or component.
- Prefer utility classes and existing layout patterns over bespoke CSS files unless a shared style abstraction is clearly needed.

## 6. Data fetching and state rules

- Follow `docs/data-layer.md`.
- Reads are Pinia Colada queries.
- Writes are Pinia Colada mutations.
- Query keys must come from `project/app/composables/queryKeys.ts`.
- Shared fetch logic belongs in `project/app/queries/*.ts`.
- Shared consumer logic belongs in `project/app/composables/*.ts`.
- Mutations must invalidate or update the relevant query keys on success.
- For single-use page fetches, local code is acceptable only when extracting a shared composable would add noise.

## 7. Server API rules

- Follow `docs/server-api-conventions.md`.
- Route files belong in `project/server/api/`.
- Use shared auth helpers:
  - `requireUser()`
  - `requireUserId()`
  - `getOptionalUser()`
  - `getOptionalUserId()`
- Do not call `serverSupabaseUser` or `supabase.auth.getUser()` directly inside route files.
- Use shared permission helpers from `project/server/utils/permissions.ts`.
- Validate params, query strings, and request bodies at the boundary with `parseParams()`, `parseQueryParams()`, and `parseBody()`.
- Run `npm run check:server-conventions` after changing route behavior or adding routes.

## 8. Domain invariants

- Producers are contextual show-level roles, not assumed performers.
- Producers are never assumed to be cast.
- Cast membership requires an explicit `show_cast` entry.
- Theater and show permissions must follow the contextual role model in `docs/PRD.md`.
- Do not infer notification recipients from UI state when domain data already defines the relationship.

## 9. Notifications and events

- Follow `docs/events-and-notifications.md`.
- All notifications must go through the notification service via `emitEvent()`.
- No route, component, or direct DB write should create notifications outside that service.
- Notification changes must preserve recipient rules, dedupe behavior, and the principle that producers receive operational notifications even when not cast.
- New notification types or event flows require doc updates in `docs/events-and-notifications.md`.

## 10. Database and persistence rules

- Keep the project Postgres-first and Supabase-friendly, as described in `docs/data-model.md`.
- Prefer Supabase client access plus generated database types over introducing a parallel ORM abstraction.
- Respect existing naming and enum values in the schema docs and SQL files under `docs/sql/`.
- Keep `project/mock-data.config.example.json` aligned with the current schema and product expectations so seeded data remains a trustworthy dev/test fixture.
- Do not bypass documented role, cast, review, or notification invariants for convenience in UI code.

## 11. Testing and verification

- Add or update tests with Vitest when logic becomes complex enough to regress easily.
- At minimum, run the narrowest relevant verification for the change:
  - `npm test` for tested logic
  - `npm run check:server-conventions` for route changes
  - `npm run build` when changing framework-level wiring or app-wide behavior

## 12. Change discipline

- Keep docs in version control and update them as part of the same change.
- Treat mock-data configs and seed scripts as part of the database contract; update them whenever schema or seeded workflows change.
- Prefer small, targeted changes that match existing repo patterns.
- Ask before large refactors or architectural changes.
- Do not add out-of-spec "nice to have" features without permission.
- Never delete files without clarification.
- If a new abstraction does not clearly reduce duplication or improve consistency, do not add it.
- Do not commit without permission, and do not commit failing builds.
- Treat architecture changes as intentional PRD/spec evolution, not incidental cleanup.
