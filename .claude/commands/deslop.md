---
description: "Remove AI-generated code slop introduced in this branch vs main"
allowed-tools: ["Bash", "Edit"]
---

# Remove AI Code Slop

Check the diff against the main branch and remove all AI-generated slop introduced in this branch.

**Usage:** `/deslop`

## What counts as slop (remove these):

- Comments explaining *what* the code does when the code already reads clearly (e.g. `// loop through items`)
- Multi-line docstrings or comment blocks on obvious functions
- Extra defensive `try/catch` or null-guards around trusted internal calls
- Redundant fallback values that can never be reached
- Unused variables, imports, or helper functions the agent added "just in case"
- Overly verbose variable names where concise ones are idiomatic
- StyleSheet entries that duplicate an identical existing entry

## What to keep:

- Comments explaining *why* something non-obvious is done
- Error handling at real boundaries (user input, AsyncStorage, network)
- Existing code style — don't refactor things that weren't changed

## Procedure:

1. Run `git diff claude/food-tracker-app-uMLdp...HEAD` to see everything introduced on this branch
2. For each changed file, identify slop per the criteria above
3. Edit the files to remove it
4. Run `node --check <file>` on every `.js` file you touch
5. Report a 1–3 sentence summary of what was removed
