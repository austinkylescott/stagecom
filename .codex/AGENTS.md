# AGENTS.md

Repo-local Codex override for Stagecom.

## Wiki-First Rule

- Consult `wiki/_index.md` first for project understanding.
- Use `wiki/` as the default context layer for product, data, architecture, feature, design, and decisions knowledge.
- Use `docs/` in this repo as the raw source layer when:
  - the wiki is missing detail
  - the wiki contains a conflict callout
  - you are updating a source doc
  - you are ingesting new raw docs into the wiki

## Maintenance Rule

- When a meaningful raw doc changes in `docs/`, update the corresponding material in `wiki/`.
- Do not leave the wiki stale after changing product, data-model, architecture, feature, or design guidance.
