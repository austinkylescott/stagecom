# Stagecom Wiki

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/data/data-model.md]], [[raw/product/visibility-policy.md]], [[raw/product/events-and-notifications.md]], [[raw/development/coding-rules.md]], [[raw/development/server-api-conventions.md]], [[raw/development/ai-interaction.md]], [[raw/development/data-layer.md]], [[raw/design/app-design-bible.md]], [[raw/design/google-stitch-brief.md]], [[raw/specs/2026-01-09/feature-spec-show-lifecycle-v1.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/specs/2026-03-31/feature-spec-authenticated-work-experience-refinement-v1.md]], [[raw/specs/2026-04-02/feature-spec-multi-home-theater-hub-and-calendar-v1.md]], [[raw/specs/2026-04-07/feature-spec-schedule-system-unification-v1.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-design-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]], [[raw/specs/2026-04-12/feature-spec-component-system-v1.md]]

Stagecom is a community management platform for improv theaters. Its product center of gravity is theater-owned programming, contextual roles, explicit cast membership, and privacy-aware operational coordination.

The current source set establishes stable product/data invariants, but it still contains unresolved route-model conflicts. The strongest current design authority is the 2026-04-12 reset/spec bundle, while the product/data docs still describe older `/theater/...` canonical routes.

## Project Overview

- Product summary: [[wiki/product/overview]]
- Roles and principles: [[wiki/product/roles-and-principles]]
- MVP scope and non-goals: [[wiki/product/mvp-and-non-goals]]

## Data Model

- Theaters: [[wiki/data/theaters]]
- Theater memberships: [[wiki/data/theater-memberships]]
- Shows and occurrences: [[wiki/data/shows]]
- Show cast: [[wiki/data/show-cast]]
- Profiles: [[wiki/data/profiles]]
- Permissions model: [[wiki/data/permissions-model]]

## Architecture

- Stack and layout: [[wiki/architecture/stack-and-layout]]
- Route model: [[wiki/architecture/route-model]]
- Server API patterns: [[wiki/architecture/server-api-patterns]]
- Data fetching: [[wiki/architecture/data-fetching]]
- Notifications service: [[wiki/architecture/notifications-service]]

## Features

- Theater creation and membership: [[wiki/features/theater-creation-and-membership]]
- Show lifecycle: [[wiki/features/show-lifecycle]]
- Casting system: [[wiki/features/casting-system]]
- Visibility policy: [[wiki/features/visibility-policy]]
- Schedule and callsheet: [[wiki/features/schedule-and-callsheet]]
- Notifications: [[wiki/features/notifications]]
- Theater admin and review: [[wiki/features/theater-admin-and-review]]
- Profile and identity: [[wiki/features/profile-and-identity]]

## Design

- Design system summary: [[wiki/design/design-system]]
- Surface map: [[wiki/design/surface-map]]
- Page archetypes: [[wiki/design/page-archetypes]]

## Decisions

- Contextual roles: [[wiki/decisions/contextual-roles]]
- Producers are not cast: [[wiki/decisions/producers-are-not-cast]]
- Multi-home theaters: [[wiki/decisions/multi-home-theaters]]
- Nuxt UI v4 only: [[wiki/decisions/nuxt-ui-v4-only]]
- No ORM policy: [[wiki/decisions/no-orm]]
- Lint log: [[wiki/decisions/lint-log]]

## Known Active Conflicts

> ⚠️ Conflict: The canonical route model is not fully aligned across sources. [[raw/data/data-model.md]] and [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]] use `/theater/[slug]` and `/theater/[theaterSlug]/event/[eventSlug]`, while the 2026-04-12 redesign specs use `/{theaterSlug}` and `/{theaterSlug}/{eventSlug}`.

> ⚠️ Conflict: [[raw/product/visibility-policy.md]] says protected visibility failures should return `403`, while [[raw/research/visibility-rules.md]] records current non-public show behavior as `404` to hide existence.

## Related
- [[wiki/product/overview]]
- [[wiki/architecture/route-model]]
- [[wiki/decisions/lint-log]]
