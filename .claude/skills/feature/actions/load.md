# Load Action

1. Check $ARGUMENTS (after "load"):
   - If it looks like a filename (single word, no spaces): Look for a matching file anywhere under `docs/specs/**/{name}.md`
   - If it's multiple words: Use as inline feature description, generate goals
   - If empty: Error - "load" requires a spec filename or feature description

2. When working from a written spec, treat `docs/specs/` as the canonical feature-spec root and store specs in dated folders under `docs/specs/YYYY-MM-DD/`.

3. Update `context/current-feature.md`:
   - Update H1 heading to include feature name (e.g., `# Current Feature: Add Navbar`)
   - Write goals as bullet points under ## Goals
   - Write any additional notes/context under ## Notes
   - Set Status to "Not Started"

4. Confirm spec loaded and show the feature summary
