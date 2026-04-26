---
description: "Sync GitHub Issues and Project board from PLAN.md backlog — create, label, and organize"
allowed-tools: ["Bash"]
---

# Issue Manager

Read the backlog in PLAN.md, sync it with GitHub Issues, and keep the GitHub Project board up to date.

**Usage:**
- `/issue-manager sync` — create missing issues for all unchecked backlog items
- `/issue-manager close <feature-name>` — close the issue matching a completed feature
- `/issue-manager board` — print a summary of current open issues and their Project column

## Labels used

| Label | Color | Meaning |
|-------|-------|---------|
| `feature` | `#0075ca` | New capability |
| `chore` | `#e4e669` | Build / config / infra |
| `bug` | `#d73a4a` | Something broken |
| `priority:high` | `#b60205` | Do next |
| `priority:medium` | `#fbca04` | Do soon |
| `priority:low` | `#0e8a16` | Backlog |

## Implementation for `sync`

1. Read `PLAN.md` — extract every unchecked `- [ ]` item from the backlog table (Phase 3 and Phase 4)
2. Run `gh issue list --repo parksoy/IntakeTracker --state open --json number,title` to get existing issues
3. For each backlog item not already in GitHub:
   - `gh issue create --repo parksoy/IntakeTracker --title "<item>" --body "<context from PLAN.md>" --label "<label>"`
   - Assign priority label based on the Priority column in PLAN.md
4. Add each newly created issue to the GitHub Project:
   - `gh project item-add <project-number> --owner parksoy --url <issue-url>`
5. Print a table: issue number, title, label, created/already-existed

## Implementation for `close <feature-name>`

1. Search open issues: `gh issue list --search "<feature-name>" --repo parksoy/IntakeTracker`
2. Close the best match: `gh issue close <number> --comment "Completed in PR #<pr-number>"`
3. Mark the corresponding `PLAN.md` item as `[x]`

## Implementation for `board`

1. `gh issue list --repo parksoy/IntakeTracker --state open --json number,title,labels`
2. Print a grouped summary by priority label

## Prerequisites

- `gh` CLI must be installed and authenticated (`gh auth status`)
- GitHub Project must exist at `https://github.com/users/parksoy/projects/<N>`
- If not authenticated, print: "Run: gh auth login"

Arguments: $ARGUMENTS
