# Pre-Flight Checklist — True Async Multi-Agent Dev (VSCode, Local Laptop)

**Context:** IntakeTracker repo. Laptop stays open + plugged in. Two agents run in parallel VSCode terminal splits, each owning non-overlapping files.

---

## 0 — System Setup (do once, before any session)

- [ ] **Disable sleep:** System Settings → Battery → Options → "Prevent automatic sleeping when plugged in" → ON
- [ ] **Disable screen saver:** System Settings → Lock Screen → "Start screen saver after" → Never
- [ ] **Keep VSCode open** as the host — do not quit it mid-run
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
  This prevents agents from pausing on routine read-only commands.

---

## 1 — Issue Selection (before each session)

- [ ] Open GitHub Project board: `github.com/users/parksoy/projects/1`
- [ ] Pick **2 issues** with zero file overlap (see ownership map below)
- [ ] Confirm neither issue touches `App.js` at the same time — it's the most dangerous shared file
- [ ] **Dark mode (#5) must always run solo** — it touches every StyleSheet in every component

### File ownership map for remaining issues

| Issue | Safe to parallel? | Owns | Must NOT touch |
|-------|------------------|------|----------------|
| **#2** Weekly summary | ✅ Yes | `src/components/WeeklyScreen.js` (new), `App.js` | storage.js, other components |
| **#3** Notifications | ✅ Yes (with #2) | `src/utils/notifications.js` (new), `app.json` | `App.js`, src/components/ |
| **#5** Dark mode | ❌ Solo only | All component StyleSheets | — |

**Safe pair for this session: #2 + #3** (no overlap at all if Agent 2 skips App.js wiring)

---

## 2 — Git State (immediately before launching agents)

- [ ] `git status` → must be **clean** (no uncommitted changes)
- [ ] `git pull` → must be on **latest main**
- [ ] Confirm: `git branch` shows `* main`
- [ ] Do NOT pre-create branches — let each agent branch from main at launch time

---

## 3 — VSCode Terminal Splits

1. Open terminal: `` ⌘` `` or View → Terminal
2. Split into two panes: click the **⊞ split icon** in the terminal toolbar, or right-click → Split Terminal
3. Optional third pane for passive monitoring (see below)

```
┌─────────────────────┬─────────────────────┐
│  Terminal 1         │  Terminal 2         │
│  Agent 1 — #2       │  Agent 2 — #3       │
│  WeeklyScreen.js    │  notifications.js   │
└─────────────────────┴─────────────────────┘
```

**Optional passive monitor (third split):**
```bash
watch -n 15 "gh pr list --repo parksoy/IntakeTracker"
```
Shows new PRs appearing without touching the agent terminals.

---

## 4 — Agent Prompts (copy verbatim, one per terminal)

### Agent 1 — Terminal 1 (Issue #2: Weekly Summary)

```
claude "Read CLAUDE.md and plan.md first.

Task: Implement Issue #2 — weekly/monthly point summary.

File ownership — you may ONLY modify:
- CREATE src/components/WeeklyScreen.js (new file)
- MODIFY App.js — add a 'Week' button to the header and a state toggle to show WeeklyScreen

Do NOT touch: storage.js, AddFoodModal.js, FoodLogItem.js, HistoryScreen.js, PointsRing.js, app.json, eas.json.

Spec:
- WeeklyScreen reads loadAllLogs() from src/utils/storage.js (already exists — do not change it)
- Show last 7 days: date, total points used, simple bar or list
- Match existing brand color #2E7D32 and StyleSheet.create() pattern
- No new dependencies

Rules:
- After every JS file edit: node --check <file>
- Do not hardcode food data — it lives in src/data/foods.js only

When done: commit, push to a new branch, open a PR against main."
```

### Agent 2 — Terminal 2 (Issue #3: Notifications)

```
claude "Read CLAUDE.md and plan.md first.

Task: Implement Issue #3 — push notification / daily reminder.

File ownership — you may ONLY modify:
- CREATE src/utils/notifications.js (new file)
- MODIFY app.json — add expo-notifications plugin entry

Do NOT touch: App.js, any file in src/components/, storage.js, eas.json.

Spec:
- Install expo-notifications if not present: npx expo install expo-notifications
- notifications.js exports: scheduleReminder(hour, minute) and cancelReminder()
- Add a comment block at the top of notifications.js showing how to call it from App.js (do not modify App.js itself — UI wiring is a separate task)
- Use expo-notifications scheduling API

Rules:
- After every JS file edit: node --check <file>

When done: commit, push to a new branch, open a PR against main."
```

---

## 5 — Checkpoints During the Run

| Time | Action |
|------|--------|
| **+0 min** | Both agents launched. Note start time. |
| **+15 min** | Quick visual check — are both terminals still running? Any permission prompt waiting for input? Accept if it's `npx expo install expo-notifications`. |
| **+45 min** | Look for "PR opened" output in either terminal. |
| **+60 min** | Review both PRs on GitHub. Read the full diff. |
| **+75 min** | Merge whichever PR finished first. Run `git pull` on main. |
| **+80 min** | Check second PR still merges cleanly. Merge it. |
| **+85 min** | Close Issues #2 and #3 on GitHub Project board. |
| **+90 min** | Optional: launch solo Agent 3 for dark mode (#5). |

---

## 6 — PR Review Checklist (per PR, before merging)

- [ ] `node --check` passed on every edited JS file (agent should confirm in its output)
- [ ] No files touched outside the agent's ownership list
- [ ] No hardcoded food names or point values
- [ ] No changes to `storage.js` key names (`intake_log_`, `intake_recently_used`, `intake_favorites`)
- [ ] Diff is scoped — no unrelated reformatting or import cleanup

---

## 7 — Post-Merge Cleanup

- [ ] `git pull` on main to get latest
- [ ] Delete merged branches locally: `git branch -d <branch-name>`
- [ ] Confirm remote branches auto-deleted (gh pr merge --delete-branch)
- [ ] Move closed issues to "Done" column on GitHub Project board
- [ ] Update `plan.md` — mark completed items `[x]`
- [ ] Run `git branch -a` — should only show `* main` + remotes/origin/main

---

## 8 — What We Learned (from the April 2026 session)

### What caused conflicts last time
Multiple agents (cloud session + overnight loop + local edits) all touched the same files (`AddFoodModal.js`, `plan.md`, `CLAUDE.md`) without strict ownership. Every conflict required manual, synchronous resolution — defeating the async goal entirely.

### Rules that prevent it
1. **File ownership goes in the prompt** — CLAUDE.md rules alone are not enough. Agents from different surfaces (web, loop, CLI) don't share context between sessions.
2. **Each agent branches from the latest merged main** — never from another agent's feature branch. Branching from a stale base guarantees conflicts.
3. **One issue → one agent → one branch → one PR** — the moment two agents touch the same file, you need a synchronous merge session.
4. **App.js is the highest-conflict file** — it's the root component that everyone wants to wire into. Assign it to exactly one agent per session, or wire it manually yourself after both agents finish.
5. **Dark mode is always solo** — it modifies StyleSheet in every component file.

### GitHub Projects as the coordination layer
- **Issue** = unit of work (one per agent)
- **PR** = proof of completion
- **Project column** = status visible to all agents and humans without reading session logs

Board: `github.com/users/parksoy/projects/1`

---

## Quick Reference — VSCode Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open terminal | `` ⌘` `` |
| Split terminal | `⌘\` or click ⊞ icon |
| Switch between terminal splits | `⌘Option←/→` |
| Focus terminal / editor | `⌘J` (toggle) |
| Kill current terminal process | `Ctrl+C` |
