---
description: "Review a PR or local diff for correctness, storage contract, dead code, and slop"
allowed-tools: ["Bash"]
---

# Code Review

Review a pull request or the current branch diff against the base branch.

**Usage:**
- `/code-review` — review current branch diff vs base
- `/code-review <pr-number>` — review a specific GitHub PR

## Review checklist

Work through these in order. Label each finding `[MUST FIX]`, `[SUGGESTION]`, or `[NITPICK]`.

### 1. Get the diff
- For a PR: `gh pr diff $ARGUMENTS --repo parksoy/IntakeTracker`
- For local: `git diff claude/food-tracker-app-uMLdp...HEAD`

### 2. Correctness
- Does the logic match what the PR description says it does?
- Are point values calculated correctly? (daily limit = 23, servings multiply the base value)
- Does any new AsyncStorage read/write follow the key contract?
  - Daily logs: `intake_log_YYYY-MM-DD`
  - Recently used: `intake_recently_used`

### 3. Dead code
- Unused imports
- Unused variables or helper functions
- StyleSheet entries that are defined but never referenced

### 4. Slop
- Comments that describe *what* the code does (remove them — the code speaks)
- Redundant try/catch around internal calls that can't throw
- Defensive null-checks on values that are always defined

### 5. Lint and syntax
- Run `npm run lint` on any changed files
- Run `node --check <file>` on each changed `.js` file

## Output format

```
## Summary
<1–2 sentences on what the change does>

## Findings
[MUST FIX] <description>
[SUGGESTION] <description>
[NITPICK] <description>

## Verdict
Approve / Request Changes / Comment only
```

If reviewing a PR, post the review:
```bash
gh pr review <number> --body "<review text>" --approve
# or
gh pr review <number> --body "<review text>" --request-changes
```

Arguments: $ARGUMENTS
