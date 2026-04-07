# Start Action

1. Read `context/current-feature.md` - verify Goals are populated
2. If empty, error: "Run /feature load first"
3. Set Status to "In Progress"
4. Switch to `main` and make sure the feature branch is created from `main`
5. Create and checkout the feature branch (derive name from H1 heading)
6. Verify the current branch is the new feature branch before making any code changes
7. Do all implementation work on that feature branch until the feature is merged
8. If work is accidentally happening on `main`, stop and switch back to the feature branch before continuing
9. List the goals, then implement them one by one
