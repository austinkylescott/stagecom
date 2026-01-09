# Coding Rules (Stagecom)

These rules exist to support AI-assisted development and prevent drift.

- Do not add tables without updating docs/data-model.md
- All notifications must go through Notification Service: emitEvent()
- Producers are never assumed to be cast
- Cast membership requires explicit show_cast entry
- Every feature must map back to docs/PRD.md
- Significant behavior changes require updating docs (PRD/specs/events)

Recommended:
- Keep docs in version control
- Treat changes as intentional PRD/spec bumps (v0.3, etc.)
