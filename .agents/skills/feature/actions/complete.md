# Complete Action

1. Verify the current branch is the active feature branch and not `main`
2. Stage all changes and commit with a descriptive message on the feature branch
3. Push the feature branch to origin so the branch exists remotely before merge
4. Switch to `main` and merge the feature branch (no push yet)
5. Keep the local feature branch after merge so it remains available for follow-up fixes or rollback work
6. Reset `context/current-feature.md`:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
7. Commit the reset: `chore: reset context/current-feature.md after completing [feature]`
8. Push `main` to origin
9. Do not delete the feature branch locally or on origin unless explicitly requested
