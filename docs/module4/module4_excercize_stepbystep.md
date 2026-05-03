# Module 4 Exercise 1 — Report: Async Agentic Development

**Exercise:** [Implement a feature or fix via an asynchronous platform](async_feature_or_fix.md)  
**Project:** IntakeTracker — WW-style 23-point iPhone food tracker  
**Dates:** 2026-04-28 (Session 1) → 2026-04-29 (Session 2) → 2026-05-02 (Session 3, overnight)

---

## What the Exercise Actually Asked For

The spec's three verbs are: **Select** a feature, **Kick off** from an async surface, **Review** and **drive to completion**. The human is the orchestrator throughout — selecting work, triggering the agent, reviewing output. The exercise title says "How to Become a Multi-Agent Manager": the *human* is the manager.

All four options in the spec describe one agent handling one task. The "parallel agents via Conductor" option introduces multiple agents, but Conductor is an orchestrator framework — the software coordinates, not the agents themselves.

The exercise never asks for agents to assign tasks to each other, message each other mid-run, or for a lead agent to coordinate teammates. That is Agent Teams territory and is not in scope.

| Session | Scope vs. exercise |
|---------|-------------------|
| Session 1 — one cloud agent, human reviews PR | ✅ Exactly what was asked |
| Session 2 — parallel agents, human sets up worktrees + reviews PRs | ✅ Exceeds spec; demonstrates the Conductor-style parallel option |
| Session 3 — overnight autonomous run, permissions allowlist, human removed | ➕ Beyond scope; explores what breaks when you eliminate the human orchestrator — surfaced the EAS credentials hard limit |

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

### Pre-launch log (2026-05-02)

```bash
# 1. Commit settings + report so worktrees start from latest main
git add .claude/settings.json docs/module4/module4_excercize_stepbystep.md
git commit -m "Session 3 prep: expand permissions allowlist and update exercise report"
git push
# → f0a5138 pushed to origin/main

# 2. Clean up stale Session 2 worktrees (were still registered from 2026-04-29)
git worktree remove ~/Desktop/IntakeTracker-agent1 --force
git worktree remove ~/Desktop/IntakeTracker-agent2 --force
git branch -d feature/weekly-summary feature/notifications
# → Deleted both stale branches (already merged to origin)

# 3. Create Session 3 worktrees from f0a5138 (latest main)
git worktree prune
git branch -d feature/saved-custom-foods   # orphan branch from earlier attempt
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/saved-custom-foods
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/streak-badge
# → Both worktrees on f0a5138

# 4. Symlink node_modules (avoids re-install in each worktree)
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules

# 5. Confirm layout
git worktree list
# /Users/soyoungpark/Desktop/IntakeTracker         f0a5138 [main]
# /Users/soyoungpark/Desktop/IntakeTracker-agent1  f0a5138 [feature/saved-custom-foods]
# /Users/soyoungpark/Desktop/IntakeTracker-agent2  f0a5138 [feature/streak-badge]

# 6. Move issues to In Progress on project board
gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CA --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CM --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
# → Issue #14 → In Progress
# → Issue #15 → In Progress
```

**Blocker encountered during pre-launch:** `gh project item-edit 1 --owner parksoy` (Session 2 syntax) no longer works — the subcommand now requires `--project-id` instead of a positional arg + `--owner`. Updated all board commands to use `--project-id PVT_kwHOANERK84BVuVP` form.

**Permission gaps discovered during Session 3 run — still required human intervention:**

| Prompt triggered | Root cause | Fix added to settings.json |
|-----------------|------------|---------------------------|
| `npm install *` | Agents ran bare `npm install` (not `npx expo install`) when resolving missing deps | Added `Bash(npm install *)` |
| `gh project *` | Agents used `gh project list`, `gh project item-list` to look up IDs — only `item-edit` was allowed | Replaced `Bash(gh project item-edit *)` with `Bash(gh project *)` |
| Read from `~/Desktop/IntakeTracker/` | Agents tried to read `CLAUDE.md` and `plan.md` using the absolute main-workspace path, not the worktree-relative path | Added `Read(~/Desktop/IntakeTracker/**)` |
| Edit/Write `.js` files in worktree | File edits in `IntakeTracker-agent1/` and `agent2/` required approval — only Bash operations were pre-allowed | Added `Edit` and `Write` for both worktree paths |
| `eas build *` | The exact-string allowlist entry `eas build --platform ios --profile production --non-interactive` didn't match when EAS prepended env vars or slightly varied the invocation | Replaced with `Bash(eas build *)` |
| `eas credentials *` | EAS invokes credential management as a subprocess during build — separate command, separate permission prompt | Added `Bash(eas credentials *)` |

**Updated `.claude/settings.json` allowlist (post-Session 3 fix):**
```json
"permissions": {
  "allow": [
    "Bash(npm run lint)",
    "Bash(npm run format:check)",
    "Bash(npm install *)",
    "Bash(node --check *)",
    "Bash(ps aux *)",
    "Bash(git add *)",
    "Bash(git commit *)",
    "Bash(git push *)",
    "Bash(gh pr create *)",
    "Bash(gh pr merge *)",
    "Bash(gh issue close *)",
    "Bash(gh project *)",
    "Bash(npx expo install *)",
    "Bash(eas build *)",
    "Bash(eas credentials *)",
    "Read(~/Desktop/IntakeTracker/**)",
    "Edit(~/Desktop/IntakeTracker-agent1/**)",
    "Edit(~/Desktop/IntakeTracker-agent2/**)",
    "Write(~/Desktop/IntakeTracker-agent1/**)",
    "Write(~/Desktop/IntakeTracker-agent2/**)"
  ]
}
```

**EAS build blocker — manual intervention required (not automatable):**

Root cause: the provisioning profile was created before `expo-notifications` was added to `app.json` plugins. The existing profile lacks the `aps-environment` (Push Notifications) entitlement, so the Xcode build rejects it. There is no non-interactive flag to force credential regeneration — the `eas credentials` interactive menu is the only way to delete the stale profile.

Fix (one-time, must be run manually):
```bash
cd ~/Desktop/IntakeTracker
eas credentials --platform ios
# Navigate to: Provisioning Profile → Remove (delete the existing one)
# Then exit and rebuild:
eas build --platform ios --profile production --non-interactive
# EAS auto-generates a new profile that includes the Push Notifications entitlement
```

This is not a one-time edge case — it is a structural limitation. `eas credentials` is intentionally interactive because it is mutating Apple's signing infrastructure. There is no `--non-interactive` flag for credential deletion. **The EAS build step cannot be included in a fully unattended overnight agent run whenever any agent has added or changed a native entitlement.**

**Revised conclusion for Session 3:** true overnight autonomy applies to code changes only — feature implementation, PR, merge, issue close, and board update all run without intervention. The EAS build must be triggered manually the next morning. The "new app ready on TestFlight" goal shifts from "wake up and it's already there" to "wake up, run one command, wait 15 minutes."

Revised finish sequence for overnight agents — drop the EAS step entirely:
```bash
# Agents handle: commit → push → pr create → pr merge → issue close → board update
# Human handles next morning:
cd ~/Desktop/IntakeTracker && git pull
eas credentials --platform ios   # only needed when native entitlements changed
eas build --platform ios --profile production --non-interactive
```

**Session 3 conclusion:**

The revised overnight model:
- **Agents own:** code → commit → PR → merge → close issue → update board (fully unattended)
- **You own next morning:** `git pull` + `eas credentials` (if needed) + `eas build`

That's still a significant win — all the code work and GitHub housekeeping happens while you sleep, and the 15-minute build runs while you have coffee.

**Lesson:** the original allowlist only covered Bash commands. File-level `Edit` and `Write` tool calls are separate permission categories in Claude Code — they must be explicitly allowed for each worktree path, or agents prompt for approval on every file change. Similarly, `gh project *` must be broad enough to cover read subcommands (`list`, `item-list`), not just `item-edit`.

**Ready to launch.** Open terminal → `⌘\` twice → 3 panes. Paste Agent 1 prompt in middle, Agent 2 prompt in right. Step away.

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
gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CA --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
gh project item-edit --project-id PVT_kwHOANERK84BVuVP --id PVTI_lAHOANERK84BVuVPzgrp1CM --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE --single-select-option-id 47fc9ee4
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
| `Edit`/`Write` paths in allowlist | Bash permissions alone aren't enough — file tool calls need explicit `Edit(path/**)` + `Write(path/**)` entries per worktree |
| `gh project *` not just `gh project item-edit *` | Agents use `gh project list` and `item-list` to look up IDs; narrow allowlist blocks these reads |
| `npm install *` alongside `npx expo install *` | Agents sometimes resolve deps with bare `npm install`, not the Expo wrapper |
| `Bash(eas build *)` not the exact flag string | The full `--platform ios --profile production --non-interactive` exact-match entry fails if EAS varies the invocation; use wildcard |
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
| Including `eas build` in overnight agent prompts | `eas credentials` is always interactive when native entitlements change — no flag bypasses it. EAS build cannot be part of an unattended run; trigger it manually next morning |

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

---

## Final Note: What the Official Agent Teams Feature Offers That We Didn't Use

We built a working multi-agent workflow manually — worktrees for isolation, VSCode panes for parallel execution, file ownership in prompts for coordination, and the GitHub project board as a shared status layer. The [Claude Code Agent Teams documentation](https://code.claude.com/docs/en/agent-teams) describes a native feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`) that handles most of this automatically. Here's what we hand-rolled that the official feature provides out of the box:

| What we built manually | What Agent Teams provides natively |
|------------------------|-----------------------------------|
| File ownership rules in every prompt to prevent conflicts | Shared task list with file-locking — teammates self-claim tasks and the system prevents race conditions |
| GitHub project board as coordination layer | Built-in task list (`~/.claude/tasks/`) with pending / in-progress / done states and automatic dependency unblocking |
| No communication between agents — each prompt was self-contained | Mailbox system: teammates message each other directly by name without going through you |
| VSCode pane splits set up manually with `⌘\` twice | `teammateMode: "tmux"` in settings.json auto-spawns split panes; or in-process mode with `Shift+Down` to cycle teammates |
| One fixed task per agent, written into the launch prompt | Self-claiming: after finishing, a teammate picks up the next unassigned task automatically |
| No plan review — agent went straight to implementation | Plan approval gate: teammate works read-only until lead approves the plan; lead can reject with feedback |
| `PostToolUse` hook only for syntax checking | `TeammateIdle`, `TaskCreated`, `TaskCompleted` hooks — enforce quality gates (e.g. block task completion if tests fail) |
| Inline prompts rewritten each session | Subagent definitions — define a role once (e.g. `security-reviewer`) and reuse it as a teammate by name |
| Human monitored for errors and redirected manually | Lead manages the team: re-assigns stuck tasks, shuts down teammates, synthesizes findings |

### How to enable it

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Then instead of writing two separate launch prompts and pasting them into VSCode panes:

```text
Create an agent team to implement two features in parallel.
Teammate 1: saved custom foods — CREATE src/utils/customFoods.js, MODIFY AddFoodModal.js only.
Teammate 2: streak badge — CREATE src/components/StreakBadge.js, MODIFY App.js only.
Each teammate: node --check after every JS edit, then commit → PR → merge → close issue → update board.
Require plan approval before either teammate writes any code.
```

Claude spawns the teammates, assigns tasks, enforces file ownership through the task list, and lets teammates notify each other when done.

### Did Session 3 count as "orchestration"?

No. Session 3 was **parallel independent execution**, not orchestration.

Orchestration means a coordinating layer dynamically assigns tasks, monitors agent progress, routes results between agents, and makes decisions based on what other agents produced. The output of one agent feeds into another.

What Session 3 actually was: two agents, each given a fully self-contained prompt that told it exactly what to do from start to finish. Agent 1 had no idea Agent 2 existed. Neither agent could reassign work, react to the other's output, or retry a failed step. **We** were the only coordinator — we wrote the prompts, set up the worktrees, and monitored.

| Pattern | Coordination |
|---------|-------------|
| Session 1 overnight `/loop` | Self-directed — one agent picks its own next task from GitHub issues |
| Sessions 2 + 3 worktrees | **None** — two isolated workers with human-authored, fully pre-specified prompts |
| Agent Teams (official feature) | True orchestration — lead assigns tasks dynamically, teammates message each other, shared task list with dependency resolution |

The reason Session 3 worked without orchestration is that the two features had zero file overlap and zero dependency on each other's output. Orchestration becomes necessary when: tasks have dependencies (Agent 2 needs Agent 1's output before it can start), work needs to be reassigned (Agent 1 gets stuck, lead gives the task to Agent 2), or agents need to share findings mid-run (one agent discovers something the other needs to know).

### Why we didn't use it

Agent Teams is marked **experimental** in the docs, with known limitations: no session resumption for in-process teammates, task status can lag. The docs say the native `teammateMode: "tmux"` split-pane mode requires tmux or iTerm2 and isn't supported in VS Code's integrated terminal — but VS Code's own `⌘\` pane splitting worked fine for our manual approach (2 panes, one agent each). The main reason we didn't use Agent Teams was that the experimental flag and known coordination bugs made the manual worktree approach more predictable for a first overnight run.

### What to explore next

- Switch to iTerm2 + `teammateMode: "tmux"` and let Agent Teams manage pane creation
- Use the plan approval gate (`Require plan approval before making changes`) to review agent designs before they write code
- Add `TaskCompleted` hooks that run `node --check` on every JS file the teammate touched before it can mark a task done — replacing the current per-file `PostToolUse` hook
- Try the competing-hypotheses pattern for debugging: spawn 3 teammates with different theories, have them message each other to challenge findings, converge on root cause
