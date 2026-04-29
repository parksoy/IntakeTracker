---
description: "Ship changes: commit, push, and open a PR with optional GitHub issue number"
allowed-tools: ["Bash"]
---

# Ship Command

Commit, push, and open a pull request for the current changes. Claude analyzes the diff and generates branch name, commit message, and PR description automatically.

**Usage:** `/ship [github-issue-number]`

**Examples:**
- `/ship` — analyzes changes and ships them
- `/ship 3` — links PR to GitHub issue #3

## Implementation

1. **Analyze current changes:**
   - Run `git status` and `git diff` to see what changed
   - Understand what feature or fix is being implemented
   - Group related changes into logical commits if needed

2. **Run the syntax hook first:**
   - For every changed `.js` file, run `node --check <file>`
   - If any check fails, stop and tell the user which file has a syntax error

3. **Build branch name:**
   - Format: `soyoungpark/<description>` (e.g. `soyoungpark/weekly-summary`)
   - With issue: `soyoungpark/issue-$NUMBER/<description>`
   - Use lowercase, hyphens only, keep it under 50 chars

4. **Commit:**
   - Stage relevant files (never `git add -A` blindly — exclude .env, secrets)
   - Write a commit message: one imperative subject line + blank line + bullet details if needed
   - Prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

5. **Push and open PR:**
   - `git push -u origin <branch>`
   - `gh pr create` with a structured body (Summary bullets + Test plan checklist)
   - If issue number provided, add `Closes #$NUMBER` to the PR body

6. **Output:** Print the PR URL so the user can review it.

Arguments: $ARGUMENTS
