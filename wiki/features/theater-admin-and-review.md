# Theater Admin And Review

**Status:** current
**Last updated:** 2026-04-21
**Sources:** [[raw/product/PRD.md]], [[raw/product/visibility-policy.md]], [[raw/specs/2026-03-27/feature-spec-auth-security-hardening-v1.md]], [[raw/specs/2026-04-08/feature-spec-sitemap-reset-v1.md]], [[raw/specs/2026-04-12/feature-spec-app-sitemap-and-surface-map-v1.md]]

Review is theater governance, not producer-only workflow.

## Stable Rules

- Theater review queues are oversight-only.
- Producers submit proposals into the review system but do not get review access by default.
- Theater admin/manager/staff can approve, reject, and otherwise oversee theater programming.

## Surface Direction

The latest route/design bundle converges on one theater-admin operations home rather than scattered queue/settings/member surfaces.

Likely responsibilities:

- review queue
- protected theater stats
- management actions
- member/admin tooling

## Queue Semantics

- Submission should create a `submitted` review event.
- Approvals and rejections should create matching review events.
- Producer submissions may use a privileged server-side workflow even if direct SQL policies remain tighter.

## Related
- [[wiki/features/show-lifecycle]]
- [[wiki/features/visibility-policy]]
- [[wiki/architecture/server-api-patterns]]
