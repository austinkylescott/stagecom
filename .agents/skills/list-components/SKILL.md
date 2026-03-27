---
description: List project components
arguments: [subdirectory]
---

## Task
List all Vue component files in the components folder.

If a [subdirector] is provided via $ARGUMENTS, only list files in that subdirectory.

## Output Format
- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end

If no files found, say "No components found."
