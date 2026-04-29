# Pre-Flight Checklist — True Async Multi-Agent Dev (VSCode, Local Laptop)

**Context:** IntakeTracker repo. Laptop stays open + plugged in. Two agents run in parallel VSCode terminal splits, each in its own **git worktree** for true filesystem isolation.

---

## 0 — System Setup (do once, before any session)

- [ ] **Disable sleep:** System Settings → Battery → Options → "Prevent automatic sleeping when plugged in" → ON
- [ ] **Disable screen saver:** System Settings → Lock Screen → "Start screen saver after" → Never
- [ ] **Confirm permissions allowlist** is in `.claude/settings.json`:
  ```json
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run format:check)",
      "Bash(node --check *)",
      "Bash(ps aux *)"
    ]
  }
  ```

---

## 1 — Issue Selection

Open the GitHub Project board: `github.com/users/parksoy/projects/1`

Pick 2 issues with zero file overlap:

| Issue | Safe to parallel? | Owns exclusively | Must NOT touch |
|-------|-----------------|------------------|----------------|
| **#2** Weekly summary | ✅ Yes | `src/components/WeeklyScreen.js` (new), `App.js` | storage.js, other components |
| **#3** Notifications | ✅ Yes (with #2) | `src/utils/notifications.js` (new), `app.json` | `App.js`, src/components/ |
| **#5** Dark mode | ❌ Solo only | All component StyleSheets | — run alone after #2 + #3 merge |

**Safe pair for this session: #2 + #3**

---

## 2 — Git State + Pre-launch File Checks

### 2a — plan.md must not be stale

Agents read `plan.md` first. If it still lists completed features as pending, agents will re-implement them.

```bash
# Check Phase 4 table — all shipped features must show ✅ Done
grep -A 20 "Phase 4" plan.md
```

- [ ] History screen → ✅ Done
- [ ] Serving size multiplier → ✅ Done
- [ ] Recently used foods → ✅ Done
- [ ] Favorites / pinned foods → ✅ Done
- [ ] Weekly summary → ⬜ Issue #2 (next up)
- [ ] Notifications → ⬜ Issue #3 (next up)
- [ ] Dark mode → ⬜ Issue #5 (solo only)

If anything is wrong: edit `plan.md`, `git add plan.md && git commit -m "Fix stale plan.md" && git push` before continuing.

### 2b — Remove stale lock file

The `.claude/scheduled_tasks.lock` file is written by `/loop` and `/schedule` sessions. If a previous session crashed or was killed, the lock stays on disk and can confuse new agents into thinking a task is already running.

```bash
# Check if lock exists and what session it points to
cat .claude/scheduled_tasks.lock 2>/dev/null || echo "No lock — good"

# Always remove before launching agents
rm -f .claude/scheduled_tasks.lock && echo "Lock cleared"
```

- [ ] Lock file removed (or confirmed absent)

### 2c — Git state + worktrees

Why worktrees? Each agent gets its **own directory on disk**. Agent 1's file edits are invisible to Agent 2's directory. No checkout conflicts, no shared index — true filesystem isolation without a second repo clone.

```bash
# 1. Confirm clean main
git status          # must be clean
git pull            # must be on latest main

# 2. Symlink node_modules into each worktree so npm run lint works
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/weekly-summary
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/notifications
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules

# Resulting layout:
# ~/Desktop/IntakeTracker/          ← your main workspace (stays on main)
# ~/Desktop/IntakeTracker-agent1/   ← Agent 1's isolated copy, node_modules symlinked
# ~/Desktop/IntakeTracker-agent2/   ← Agent 2's isolated copy, node_modules symlinked
```

- [ ] `git worktree list` — confirm 3 entries (main + 2 agents)
- [ ] `ls ~/Desktop/IntakeTracker-agent1/node_modules | head -3` — symlink works

---

## 3 — VSCode Terminal Splits

1. Open terminal: `` ⌘` ``
2. Split into two: click **⊞ split icon** in terminal toolbar, or `⌘\`
3. Optional third pane: passive PR monitor

```
┌───────────────────────┬───────────────────────┐
│  Terminal 1           │  Terminal 2           │
│  ~/IntakeTracker-     │  ~/IntakeTracker-     │
│  agent1/              │  agent2/              │
│  Issue #2             │  Issue #3             │
│  WeeklyScreen.js      │  notifications.js     │
└───────────────────────┴───────────────────────┘
```

**Optional passive monitor (third split):**
```bash
watch -n 15 "gh pr list --repo parksoy/IntakeTracker"
```

---

## 4 — Move Issues to "In Progress" on Project Board

Run these **before launching agents** so the board reflects live state:

```bash
# Move Issue #2 (weekly summary) → In Progress
gh project item-edit 1 --owner parksoy \
  --id PVTI_lAHOANERK84BVuVPzgrAL1M \
  --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE \
  --single-select-option-id 47fc9ee4

# Move Issue #3 (notifications) → In Progress
gh project item-edit 1 --owner parksoy \
  --id PVTI_lAHOANERK84BVuVPzgrAL1o \
  --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE \
  --single-select-option-id 47fc9ee4
```

---

## 5 — Launch Sequence (run in order when ready)

All pre-flight checks done? Run these commands in sequence.

> **Where to type each step:**
> ```
> [Current terminal pane]  →  Steps 1 & 2  (setup, runs once before splitting)
>          ↓  ⌘\ to split
> [LEFT pane]              →  Step 4  (Agent 1 prompt)
> [RIGHT pane]             →  Step 5  (Agent 2 prompt)
> ```
> Steps 1 & 2 run in **this current pane** — wherever you are right now, before any split.
> After Step 3 (split), this pane becomes the LEFT agent pane.

**Step 1 — In the main terminal, create worktrees:**
```bash
git pull
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/weekly-summary
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/notifications
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules
git worktree list
```

**Step 2 — Move issues to In Progress on the board:**
```bash
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrAL1M --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrAL1o --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
```

**Step 3 — Create two additional terminal panes:** press `` ⌘\ `` **twice** (not once — you need 2 NEW panes on top of the current one). You now have 3 panes total:
- **Pane 1 (left)** — this current Claude Code session — keep it here
- **Pane 2 (middle)** — Agent 1 goes here
- **Pane 3 (right)** — Agent 2 goes here

> ⚠️ Critical: if you only press ⌘\ once, you get 2 panes and Agent 1 displaces your Claude Code session.

**Step 4 — MIDDLE pane (Agent 1):** switch with `⌘Option→`
```bash
cd ~/Desktop/IntakeTracker-agent1
claude "Read CLAUDE.md and plan.md first — they have full project context.

Task: Implement Issue #2 — weekly/monthly point summary.

File ownership — you may ONLY modify:
- CREATE src/components/WeeklyScreen.js (new file)
- MODIFY App.js — add a 'Week' button to the header, state toggle to show WeeklyScreen

Do NOT touch: storage.js, AddFoodModal.js, FoodLogItem.js, HistoryScreen.js, PointsRing.js, app.json, eas.json.

Spec:
- WeeklyScreen reads loadAllLogs() from src/utils/storage.js (already exists — do not change it)
- Show last 7 days: date, total points used, bar or list
- Match existing brand color #2E7D32 and StyleSheet.create() pattern
- No new dependencies

Rules:
- After every JS file edit: node --check <file>
- Do not hardcode food data — it lives in src/data/foods.js only

When done: commit, push branch to origin, open a PR against main."
```

**Step 5 — RIGHT pane (Agent 2):** switch with `⌘Option→`
```bash
cd ~/Desktop/IntakeTracker-agent2
claude "Read CLAUDE.md and plan.md first — they have full project context.

Task: Implement Issue #3 — push notification / daily reminder.

File ownership — you may ONLY modify:
- CREATE src/utils/notifications.js (new file)
- MODIFY app.json — add expo-notifications plugin entry

Do NOT touch: App.js, any file in src/components/, storage.js, eas.json.

Spec:
- If expo-notifications not installed: npx expo install expo-notifications
- notifications.js exports: scheduleReminder(hour, minute) and cancelReminder()
- Add a comment block at the top of notifications.js showing exactly how to call it from App.js (do not modify App.js itself — UI wiring is a separate task)
- Use expo-notifications scheduling API

Rules:
- After every JS file edit: node --check <file>

When done: commit, push branch to origin, open a PR against main."
```

**Then step away.** Check back at **+15 min** for permission prompts, **+60 min** to review PRs.

---

## 6 — Agent Prompts (reference copy)

### Terminal 1 — Agent 1 (Issue #2: Weekly Summary)

```bash
cd ~/Desktop/IntakeTracker-agent1
claude "Read CLAUDE.md and plan.md first — they have full project context.

Task: Implement Issue #2 — weekly/monthly point summary.

File ownership — you may ONLY modify:
- CREATE src/components/WeeklyScreen.js (new file)
- MODIFY App.js — add a 'Week' button to the header, state toggle to show WeeklyScreen

Do NOT touch: storage.js, AddFoodModal.js, FoodLogItem.js, HistoryScreen.js, PointsRing.js, app.json, eas.json.

Spec:
- WeeklyScreen reads loadAllLogs() from src/utils/storage.js (already exists — do not change it)
- Show last 7 days: date, total points used, bar or list
- Match existing brand color #2E7D32 and StyleSheet.create() pattern
- No new dependencies

Rules:
- After every JS file edit: node --check <file>
- Do not hardcode food data — it lives in src/data/foods.js only

When done: commit, push branch to origin, open a PR against main."
```

### Terminal 2 — Agent 2 (Issue #3: Notifications)

```bash
cd ~/Desktop/IntakeTracker-agent2
claude "Read CLAUDE.md and plan.md first — they have full project context.

Task: Implement Issue #3 — push notification / daily reminder.

File ownership — you may ONLY modify:
- CREATE src/utils/notifications.js (new file)
- MODIFY app.json — add expo-notifications plugin entry

Do NOT touch: App.js, any file in src/components/, storage.js, eas.json.

Spec:
- If expo-notifications not installed: npx expo install expo-notifications
- notifications.js exports: scheduleReminder(hour, minute) and cancelReminder()
- Add a comment block at the top of notifications.js showing exactly how to call it from App.js (do not modify App.js itself — UI wiring is a separate task)
- Use expo-notifications scheduling API

Rules:
- After every JS file edit: node --check <file>

When done: commit, push branch to origin, open a PR against main."
```

---

## 6 — Checkpoints During the Run

| Time | Action |
|------|--------|
| **+0 min** | Both agents launched. Note start time. |
| **+15 min** | Check both terminals — any permission prompt waiting? Accept `npx expo install expo-notifications` if it appears in Terminal 2. |
| **+45 min** | Look for "PR opened" output in either terminal. |
| **+60 min** | Review both PRs on GitHub — read the full diff. Check file ownership was respected. |
| **+75 min** | Merge whichever PR finished first → `git pull` on main. |
| **+80 min** | Merge second PR (no conflicts expected — different files). |

---

## 7 — PR Review + Posting Results to GitHub

Review using the `/review` skill in Claude Code, then **manually post the result as a PR comment** — it does not post automatically.

```bash
# After running /review in Claude Code, post the result yourself:
gh pr comment <number> --repo parksoy/IntakeTracker --body "## Code Review
<paste review output here>"
```

> ⚠️ Critical miss: review results shown in Claude Code stay local. GitHub PR page will not reflect them unless you explicitly post via `gh pr comment`. GitHub also blocks `gh pr review --approve` on your own PRs — use `gh pr comment` instead.

### Review checklist (per PR)

- [ ] `node --check` passed on every edited JS file
- [ ] No files touched outside the agent's ownership list
- [ ] No hardcoded food names or point values
- [ ] No changes to storage key names (`intake_log_`, `intake_recently_used`, `intake_favorites`)
- [ ] Diff is scoped — no unrelated reformatting
- [ ] Review comment posted to GitHub PR page via `gh pr comment`

---

## 8 — Post-Merge: Project Board + Cleanup

### Move closed issues to Done on Project board

```bash
# Issue #2 → Done
gh project item-edit 1 --owner parksoy \
  --id PVTI_lAHOANERK84BVuVPzgrAL1M \
  --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE \
  --single-select-option-id 98236657

# Issue #3 → Done
gh project item-edit 1 --owner parksoy \
  --id PVTI_lAHOANERK84BVuVPzgrAL1o \
  --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE \
  --single-select-option-id 98236657

# Close the issues on GitHub
gh issue close 2 --repo parksoy/IntakeTracker --comment "Implemented in PR — WeeklyScreen.js added."
gh issue close 3 --repo parksoy/IntakeTracker --comment "Implemented in PR — notifications.js added."
```

### Remove worktrees

```bash
# Remove agent worktrees (safe — branches already pushed and merged)
git worktree remove ~/Desktop/IntakeTracker-agent1
git worktree remove ~/Desktop/IntakeTracker-agent2

# Delete local feature branches
git branch -d feature/weekly-summary feature/notifications

# Confirm only main remains
git worktree list     # should show only ~/Desktop/IntakeTracker
git branch -a         # should show only * main + remotes/origin/main
```

### Update plan.md

```bash
# Mark completed items [x] in plan.md, commit, push
git add plan.md && git commit -m "Mark weekly summary and notifications complete"
git push
```

---

## 9 — Lessons Learned (why worktrees, why the board)

### Why worktrees instead of just branching

Without worktrees, two agents share the same working directory. If Agent 1 checks out its branch and Agent 2 tries to do anything, they collide on the git index. Worktrees give each agent a **separate directory on disk** — Agent 1 edits files in `~/Desktop/IntakeTracker-agent1/`, Agent 2 edits files in `~/Desktop/IntakeTracker-agent2/`. They never see each other's in-progress changes.

### Why the April 2026 session still had conflicts

Even with separate branches, conflicts happened because:
- The cloud agent, overnight loop, and local edits **all touched the same files** (`AddFoodModal.js`, `plan.md`, `CLAUDE.md`) without file ownership boundaries in their prompts
- The overnight loop branched from a **stale base** (before PR #6 merged), so it re-implemented work that was already done
- CLAUDE.md rules weren't enough — agents from different surfaces don't share session context

### The three rules that prevent synchronous merge work

1. **File ownership goes in the prompt** — not just CLAUDE.md. Each agent prompt above lists exactly which files it may touch.
2. **Branch from latest main at launch time** — worktrees created immediately after `git pull`.
3. **One issue → one agent → one PR** — if two agents touch the same file, conflicts are guaranteed.

### GitHub Project board as async coordination

| Signal | Meaning |
|--------|---------|
| Issue in **Todo** | Not started |
| Issue in **In Progress** | Agent launched, branch exists |
| Issue in **Done** | PR merged, branch deleted, issue closed |

This lets you check project status without opening terminals, reading session logs, or asking an agent what it did.

---

## GitHub Project Board IDs (for reference)

| Field | ID |
|-------|----|
| Status field | `PVTSSF_lAHOANERK84BVuVPzhRIFdE` |
| Todo option | `f75ad846` |
| In Progress option | `47fc9ee4` |
| Done option | `98236657` |

| Issue | Project Item ID |
|-------|----------------|
| #2 Weekly summary | `PVTI_lAHOANERK84BVuVPzgrAL1M` |
| #3 Notifications | `PVTI_lAHOANERK84BVuVPzgrAL1o` |
| #5 Dark mode | `PVTI_lAHOANERK84BVuVPzgrAL3M` |

---

## Quick Reference — VSCode Shortcuts

| Action | Shortcut |
|--------|----------|
| Open terminal | `` ⌘` `` |
| Split terminal | `⌘\` or click ⊞ icon |
| Switch between splits | `⌘Option←/→` |
| Toggle terminal panel | `⌘J` |
| Kill current process | `Ctrl+C` |
