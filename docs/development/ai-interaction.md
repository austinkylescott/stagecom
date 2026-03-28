# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Draft Spec** - Write or update the feature spec in `docs/specs/` when the work is spec-driven.
2. **Document** - Load that spec into `context/current-feature.md`.
3. **Branch** - Start from `main`, then create a new branch for the feature or fix
4. **Implement** - Switch to that new branch and do all implementation work there, not on `main`
5. **Test** - Verify it works in the browser. Implement unit testing later. Run `npm run build` and fix any errors
6. **Iterate** - Iterate and change things if needed
7. **Commit** - Only after build passes and everything works
8. **Push Branch** - Push the feature branch to origin
9. **Merge** - Merge into `main`
10. **Review** - Review AI-generated code periodically and on demand.
11. Mark as completed in `context/current-feature.md` and add to history

Use the feature skill to load written specs from `docs/specs/` into `context/current-feature.md` before starting implementation.

Do NOT commit without permission and until the build passes. If build fails, fix the issues first.

## Branching

We will create a new branch for every feature/fix from `main`. Name branch **feature/[feature]** or **fix[fix]**, etc.

After creating the branch, switch to it immediately and keep all feature work on that branch until it is merged.

Do not implement features on `main` and later move that work to a branch unless recovery is absolutely necessary.

Push the feature branch to `origin` before merging it into `main`.

Keep feature branches after merge unless explicitly asked to delete them. This preserves an easy place to return for post-merge fixes or rollback-related work.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Codex" or similar language in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features without permission
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)
