# Module 4 Exercise 1 — Report: Async Agentic Development

**Exercise:** [Implement a feature or fix via an asynchronous platform](async_feature_or_fix.md)  
**Project:** IntakeTracker — WW-style 23-point iPhone food tracker  
**Dates:** 2026-04-28 (Session 1) → 2026-04-29 (Session 2) → 2026-05-02 (Session 3, overnight)

---

## Exercise Goals

| Goal | Status |
|------|--------|
| Select a concrete feature or fix | ✅ Multiple features across three sessions |
| Kick off from an async surface | ✅ S1: claude.ai/code (cloud). S2+S3: VSCode parallel agents + worktrees |
| Review the agent's work | ✅ `/review` skill + `gh pr comment` to post results to GitHub |
| Drive to completion with iterations | ✅ PRs merged, issues closed, project board updated |

---

## Session 1 — claude.ai/code (2026-04-28)

**Task:** Serving size multiplier label format fix — `2x Eggs` → `Eggs ×2` in `AddFoodModal.js`.

Launched on claude.ai/code (cloud agent). Prompt opened with "Read CLAUDE.md and plan.md first." Agent found the multiplier was already implemented, fixed the label format in `addEntry()`, ran `node --check`, and opened PR #7. Also autonomously: updated `CLAUDE.md` + `plan.md`, ran `/issuemanager`, created Issues #8/#9, closed Issue #1.

**Review miss:** `/review` results stayed local in the Claude Code session. GitHub PR page showed nothing. Fix: always post via `gh pr comment` after running `/review`. GitHub also blocks `gh pr review --approve` on your own PRs — `gh pr comment` is the workaround.

**EAS Build (parallel, same session):**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```
Blocker: git tracked `PLAN.md` (uppercase), filesystem had `plan.md` (lowercase). EAS tarball builder caught the mismatch. Fixed with `git mv PLAN.md plan.md.tmp && git mv plan.md.tmp plan.md`. Build succeeded, app installed on iPhone via TestFlight.

**Overnight loop (same night):**
```bash
tmux new -s overnight
# /loop 60m "Check open GitHub issues, pick highest-priority with no open PR, implement following CLAUDE.md rules, node --check every JS file, commit, push branch, open PR."
```
Implemented Issue #4 (favorites/pinned foods) → PR #10. **Result: hours of manual conflict resolution the next morning.** Cloud agent, overnight loop, and local edits all touched the same files (`AddFoodModal.js`, `plan.md`, `CLAUDE.md`) with no file ownership boundaries in their prompts, and the loop branched from a stale base.

This failure shaped Session 2.

---

## Session 2 — VSCode Parallel Agents + Worktrees (2026-04-29)

**Key changes from Session 1:**

| Problem | Fix |
|---------|-----|
| Agents shared files → conflicts | Strict file ownership in every prompt |
| Loop branched from stale base | `git worktree add` immediately after `git pull` |
| One working directory → checkout collisions | Separate directories per agent via `git worktree` |
| Review stayed local | `/review` + `gh pr comment` to post to GitHub |
| Agents stopped at "open PR" | Full finish sequence in prompt: PR → merge → close issue → board |

**Setup:**
```bash
git pull
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/weekly-summary
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/notifications
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules
```

**VSCode layout:** open terminal → `⌘\` **twice** → 3 panes: Left = Claude Code session, Middle = Agent 1, Right = Agent 2.
> ⚠️ `⌘\` once displaces your Claude Code session. Press twice.

**Move issues to In Progress before launching:**
```bash
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrAL1M --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrAL1o --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
```

**Agent 1 — Issue #2, Weekly Summary (middle pane):**
```bash
cd ~/Desktop/IntakeTracker-agent1
claude "Read CLAUDE.md and plan.md first.
Task: Issue #2 — weekly point summary.
ONLY touch: CREATE src/components/WeeklyScreen.js, MODIFY App.js (Week button + state toggle).
Do NOT touch: storage.js, AddFoodModal.js, FoodLogItem.js, HistoryScreen.js, PointsRing.js, app.json.
Spec: read loadAllLogs() from storage.js, show last 7 days (date + points bar/list), color #2E7D32, no new dependencies.
After every JS edit: node --check <file>.
When done in order: (1) commit + push, (2) gh pr create --repo parksoy/IntakeTracker --base main --title '...' --body '...', (3) gh pr merge --squash --delete-branch --repo parksoy/IntakeTracker, (4) gh issue close 2 --repo parksoy/IntakeTracker --comment 'Implemented in this PR.', (5) gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrAL1M --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 98236657"
```

**Agent 2 — Issue #3, Notifications (right pane):**
```bash
cd ~/Desktop/IntakeTracker-agent2
claude "Read CLAUDE.md and plan.md first.
Task: Issue #3 — push notification / daily reminder.
ONLY touch: CREATE src/utils/notifications.js, MODIFY app.json (expo-notifications plugin entry).
Do NOT touch: App.js, src/components/, storage.js, eas.json.
Spec: npx expo install expo-notifications if needed; export scheduleReminder(hour, minute) and cancelReminder(); add usage comment block at top of notifications.js showing how to call from App.js.
After every JS edit: node --check <file>.
When done in order: (1) commit + push, (2) gh pr create --repo parksoy/IntakeTracker --base main --title '...' --body '...', (3) gh pr merge --squash --delete-branch --repo parksoy/IntakeTracker, (4) gh issue close 3 --repo parksoy/IntakeTracker --comment 'Implemented in this PR.', (5) gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrAL1o --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 98236657"
```

**Results:** Both PRs opened before +60 min with zero conflicts. PR #12 (notifications) and PR #13 (weekly summary) merged cleanly. Issues #2 and #3 closed. Project board updated. Zero manual conflict resolution.

**Remaining gap:** Human still required to (1) watch for permission prompts on `git`/`gh` commands, (2) trigger EAS build for TestFlight. Session 3 closes both gaps.

---

## Session 3 — True Overnight Autonomous Run (2026-05-02)

**Goal:** Laptop stays on, agents run unattended. Next morning: both PRs merged on GitHub, EAS build kicked off, new app on TestFlight within 20 minutes of waking up.

### Two new features — zero file overlap

**Feature A — Saved Custom Foods (Agent 1)**  
Users re-type the same custom entries (`"Oikos 0% 2pt"`) every day. Persist custom foods across sessions.

| | Files |
|--|--|
| CREATE | `src/utils/customFoods.js` — AsyncStorage CRUD, key `intake_custom_foods` |
| MODIFY | `src/components/AddFoodModal.js` — "Saved" section in Has Points tab showing saved custom foods |
| DO NOT TOUCH | `App.js`, `storage.js`, `WeeklyScreen.js`, `notifications.js`, `PointsRing.js`, `FoodLogItem.js`, `app.json`, `eas.json` |

**Feature B — Consecutive Day Streak (Agent 2)**  
Show how many consecutive days the user stayed under 23 points — visible motivation to keep the streak alive.

| | Files |
|--|--|
| CREATE | `src/components/StreakBadge.js` — accepts `streak` prop, renders "X day streak"; renders nothing if 0 |
| MODIFY | `App.js` — import `loadAllLogs()` (already exists, no change to storage.js), compute streak on mount, render StreakBadge in header |
| DO NOT TOUCH | `AddFoodModal.js`, `storage.js`, `WeeklyScreen.js`, `notifications.js`, `PointsRing.js`, `FoodLogItem.js`, `app.json`, `eas.json` |

No file overlap. Agents cannot conflict.

### Pre-launch: permissions allowlist

Session 2 still required human presence because `git commit`, `gh pr create`, and `npx expo install` triggered per-command permission prompts. Expand `.claude/settings.json` before launching:

```json
"permissions": {
  "allow": [
    "Bash(node --check *)",
    "Bash(npm run lint)",
    "Bash(git add *)",
    "Bash(git commit *)",
    "Bash(git push *)",
    "Bash(gh pr create *)",
    "Bash(gh pr merge *)",
    "Bash(gh issue close *)",
    "Bash(gh project item-edit *)",
    "Bash(npx expo install *)",
    "Bash(eas build *)"
  ]
}
```

### Pre-launch: create issues + worktrees

```bash
# Issues already created: #14 (saved custom foods), #15 (streak badge)

# Set up worktrees
git pull
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/saved-custom-foods
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/streak-badge
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules

# Move issues to In Progress
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrp1CA --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
gh project item-edit 1 --owner parksoy --id PVTI_lAHOANERK84BVuVPzgrp1CM --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
```

### Agent 1 — Saved Custom Foods:
```bash
cd ~/Desktop/IntakeTracker-agent1
claude "Read CLAUDE.md and plan.md first.
Task: Saved custom foods — persist user-entered foods across days.
ONLY touch: CREATE src/utils/customFoods.js, MODIFY src/components/AddFoodModal.js.
Do NOT touch: App.js, storage.js, WeeklyScreen.js, notifications.js, PointsRing.js, FoodLogItem.js, app.json, eas.json.
Spec:
- customFoods.js: export loadCustomFoods(), saveCustomFood({name, points}), deleteCustomFood(name). Storage key: intake_custom_foods.
- AddFoodModal.js: in Has Points tab, add 'Saved' section above TRACKED_FOODS. Show saved entries as tappable rows (same style as existing). Add save button next to custom entry submit — tapping it calls saveCustomFood before adding to log.
- Match existing StyleSheet.create() pattern and brand color #2E7D32. No new dependencies.
After every JS edit: node --check <file>.
When done in order:
1. git add src/utils/customFoods.js src/components/AddFoodModal.js && git commit -m 'feat: saved custom foods' && git push origin feature/saved-custom-foods
2. gh pr create --repo parksoy/IntakeTracker --base main --title 'feat: saved custom foods' --body 'Adds customFoods.js (AsyncStorage CRUD) and Saved section in AddFoodModal.'
3. gh pr merge --squash --delete-branch --repo parksoy/IntakeTracker
4. gh issue close 14 --repo parksoy/IntakeTracker --comment 'Implemented in this PR.'
5. gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CA --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 98236657
6. cd ~/Desktop/IntakeTracker && eas build --platform ios --profile production --non-interactive"
```

### Agent 2 — Streak Badge:
```bash
cd ~/Desktop/IntakeTracker-agent2
claude "Read CLAUDE.md and plan.md first.
Task: Consecutive day streak badge.
ONLY touch: CREATE src/components/StreakBadge.js, MODIFY App.js.
Do NOT touch: AddFoodModal.js, storage.js, WeeklyScreen.js, notifications.js, PointsRing.js, FoodLogItem.js, app.json, eas.json.
Spec:
- StreakBadge.js: accepts streak (number) prop. Renders 'X day streak' text inline. Returns null if streak is 0. Match existing text styles and StyleSheet.create() pattern.
- App.js: import loadAllLogs from src/utils/storage.js (do not modify storage.js). On mount, compute streak: walk days backwards from yesterday, count consecutive days where sum of entry points < 23. Store in useState. Render <StreakBadge streak={streak} /> in the header row next to the date text. No new dependencies.
After every JS edit: node --check <file>.
When done in order:
1. git add src/components/StreakBadge.js App.js && git commit -m 'feat: consecutive day streak badge' && git push origin feature/streak-badge
2. gh pr create --repo parksoy/IntakeTracker --base main --title 'feat: consecutive day streak badge' --body 'Adds StreakBadge component. Reads loadAllLogs(), no storage contract changes.'
3. gh pr merge --squash --delete-branch --repo parksoy/IntakeTracker
4. gh issue close 15 --repo parksoy/IntakeTracker --comment 'Implemented in this PR.'
5. gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CM --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 98236657"
```

> `--non-interactive` on `eas build` is critical — without it EAS blocks on confirmation prompts and never finishes overnight. Only Agent 1 triggers the build (after both PRs merge independently on their own timelines).

---

## Coverage of Exercise Options

| Option | Used | Notes |
|--------|------|-------|
| Cloud platform (claude.ai/code) | ✅ Session 1 | Truly async — closed browser tab, agent ran on Anthropic's cloud |
| Parallel agents locally | ✅ Sessions 2+3 | VSCode 3-pane split + git worktrees (not Conductor — equivalent isolation, no setup) |
| GitHub agent review | ✅ Both sessions | `/review` skill + `gh pr comment`; `--approve` blocked on own PRs |
| Communication channel (Slack) | ❌ Skipped | No workspace configured. Key difference from GitHub: trigger lives in the conversation rather than the developer toolchain — enables phone trigger, natural language specs, non-developer participation |

---

## AI Coding Landscape

| Tool | Type | Async | Machine on? | Used |
|------|------|-------|-------------|------|
| Claude Code CLI | Local agent | No | Yes | ✅ Main tool |
| claude.ai/code | Cloud agent | Yes | No | ✅ Session 1 |
| tmux + /loop | DIY orchestrator | Yes (if on) | Yes | ✅ Session 1 overnight |
| Conductor | Agent orchestrator | Yes | No | ❌ Not tried |
| Devin | Autonomous cloud agent | Yes | No | ❌ Unavailable (paid) |
| GitHub Copilot review | PR review agent | Yes | No | ❌ Not set up |

**Key axis: machine-on vs cloud-native.** For truly autonomous work (close the laptop), only cloud-native options work. For local parallel work, VSCode splits + worktrees are sufficient if the machine stays on.

Agent orchestrator frameworks (Conductor, LangGraph, custom harnesses) sit above individual agents — they route tasks, manage state, and handle retries. Our tmux+/loop was a minimal DIY version of this.

---

## Lessons Learned

### What works

| Practice | Why |
|----------|-----|
| File ownership in the prompt | Agents from different surfaces don't share session context — CLAUDE.md alone isn't enough |
| Git worktrees | Each agent gets its own directory on disk; edits invisible to other agents during the run |
| Branch from latest main at worktree creation | Stale base = guaranteed conflicts on merge |
| One issue → one agent → one PR | Two agents touching the same file requires synchronous conflict resolution |
| Full finish sequence in the prompt | Agent should PR → merge → close issue → update board without waiting for you |
| Permissions allowlist pre-configured | Without it, `git commit` and `gh pr create` block on prompts overnight |
| `--non-interactive` on eas build | EAS blocks overnight without it; build never completes |
| Post review via `gh pr comment` | `/review` results stay local unless explicitly posted |

### What doesn't work

| Anti-pattern | What happens |
|-------------|-------------|
| Shared working directory, multiple agents | Checkout conflicts on the git index |
| File ownership only in CLAUDE.md | Cloud, loop, and CLI agents each start fresh — they don't share context |
| Branching from a feature branch | Includes unmerged work; conflicts guaranteed |
| Stopping agent at "open PR" | Leaves merge, issue close, board update for manual cleanup |
| No permissions allowlist | `git`/`gh` commands prompt for approval — blocks overnight run |

---

## Final State

**Sessions 1 + 2 shipped:**
- ✅ Serving size multiplier — `Eggs ×2` (Session 1, cloud agent, PR #7)
- ✅ Favorites/pinned foods — ★ star button, persisted (Session 1, overnight loop, PR #10)
- ✅ Weekly summary — 7-day bar chart (Session 2, Agent 1, PR #13)
- ✅ Push notification utility — `scheduleReminder`/`cancelReminder` (Session 2, Agent 2, PR #12)
- ✅ EAS Build + TestFlight distribution

**Session 3 targets:**
- ⬜ Saved custom foods (Agent 1 → `customFoods.js` + `AddFoodModal.js`)
- ⬜ Consecutive day streak (Agent 2 → `StreakBadge.js` + `App.js`)

**Remaining open issue:** #5 Dark mode — must run solo (touches all StyleSheets in all components).

**Reusable runbook:** [pre-flight-checklist.md](pre-flight-checklist.md)
