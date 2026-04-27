# AGENTS.md

Repository guide for coding agents working in Stagecom.

## Scope

- This file applies to the entire repository.
- Main application code lives in `project/`.
- Product and architecture raw docs live in `docs/`.
- The maintained synthesis wiki lives in `wiki/`.
- Feature specs live in dated folders under `docs/specs/YYYY-MM-DD/`.

## Project Shape

- Stack: Nuxt 4, Nuxt UI 4, Vue 3, TypeScript, Supabase, Vitest.
- Frontend code is under `project/app/`.
- Server routes are under `project/server/api/`.
- Shared server utilities are under `project/server/utils/`.
- SQL and schema references are under `docs/sql/`.

## Context / Source Of Truth

Read these before making behavior changes:

- `wiki/_index.md`: wiki entry point and map of maintained knowledge pages.
- `wiki/product/overview.md`: synthesized product overview.
- `wiki/data/permissions-model.md`: synthesized permission and visibility model.
- `wiki/architecture/route-model.md`: current route-model synthesis, including known conflicts.
- `wiki/design/design-system.md`: current design-system synthesis.
- `docs/development/server-api-conventions.md`: required server auth, permission, and validation patterns.
- `docs/development/coding-rules.md`: repo-specific guardrails.
- `docs/development/ai-interaction.md`: workflow, branch, commit, and collaboration rules for AI-assisted work.

## Documentation Sources

- Consult `wiki/` first for product, data-model, architecture, feature, and design context.
- Treat `docs/` as the raw source layer, not the default first-read layer.
- Read raw docs in `docs/` when:
  - the wiki does not answer the question
  - the wiki page has a conflict callout
  - you are verifying or changing a source-of-truth document
  - you are ingesting new or updated docs into the wiki
- If you rely on raw docs because the wiki is missing or stale, update `wiki/` as part of the same work when feasible.
- Draft new feature specs in a dated folder under `docs/specs/YYYY-MM-DD/`, then load them into `context/current-feature.md` with the feature skill before implementation.
- Use Context7 for current framework and library documentation when working with Nuxt, Nuxt UI, Vue, Supabase, and Vitest.
- Prefer official or high-reputation Context7 libraries when multiple matches exist.
- Use Supabase MCP for live database and project inspection rather than documentation lookups.

## Non-Negotiable Rules

- Every feature change must map back to the maintained wiki and, where needed, the raw source docs it cites.
- Follow `docs/development/ai-interaction.md` for communication, workflow, branching, and commit behavior.
- Do not add tables or schema-level entities without updating `docs/data/data-model.md`.
- Any change to database schema, enums, relationships, seeded assumptions, or DB-backed product expectations must update the mock-data workflow and configs so seeded data still reflects the current model.
- All notifications must go through the notification service via `emitEvent()`.
- Producers are never assumed to be cast.
- Cast membership requires an explicit `show_cast` entry.
- Significant behavior changes require corresponding doc updates in `docs/`.
- When `docs/` changes in a way that affects product, data, architecture, features, design, or decisions, update the corresponding pages in `wiki/`.
- Ask before large refactors or architectural changes.
- Do not add features that are not in the project spec.
- Never delete files without clarification.
- Do not commit without permission.

## Server Route Conventions

For files in `project/server/api/`:

- Use `requireUser()`, `requireUserId()`, `getOptionalUser()`, or `getOptionalUserId()` from the shared auth utilities.
- Do not call `serverSupabaseUser` or `supabase.auth.getUser()` directly inside route files.
- Use shared permission helpers from `project/server/utils/permissions.ts`.
- Validate request params, query, and body at the boundary with helpers from `project/server/utils/validation.ts`.
- Run `npm run check:server-conventions` after route changes.

## Workflow

Run commands from `project/` unless there is a clear reason not to.

- Follow the feature workflow in `docs/development/ai-interaction.md`.
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Production build: `npm run build`
- Server convention check: `npm run check:server-conventions`

## Branching And Commits

- Use a new branch for each feature or fix, following the naming guidance in `docs/development/ai-interaction.md`.
- Create feature branches from `main`.
- Push the feature branch to `origin` before merging it into `main`.
- Keep feature branches after merge unless explicitly asked to delete them.
- Ask before committing.
- Do not commit until the relevant verification passes, especially `npm run build` when the task changes shipped application behavior.
- Use focused conventional commits such as `feat:`, `fix:`, or `chore:`.
- Never add AI-generated attribution text to commit messages.
  - That includes "Co-Authored by Claude \*\*\*\*" type messages.

## Change Discipline

- Prefer small, targeted edits that match existing patterns.
- Preserve uncommitted user changes; do not revert unrelated work.
- If something is still failing after 2 to 3 serious attempts, stop and explain the blocker instead of continuing with random fixes.
- Update docs in the same change when behavior, schema, roles, or events shift.
- Keep `wiki/` synchronized with meaningful doc or behavior changes; do not leave the repo-local wiki stale after changing the underlying source set.
- When database or data-model behavior changes, update the relevant mock-data assets in the same change:
  - `project/mock-data.config.example.json`
  - `project/mock-data.config.json` if it exists locally for the active workflow
  - `docs/data/mock-data-workflow.md`
  - related seed/auth scripts under `project/scripts/` when expectations change
- If a feature touches notifications, permissions, roles, or show/cast behavior, verify the change against the PRD and data model docs before finishing.
