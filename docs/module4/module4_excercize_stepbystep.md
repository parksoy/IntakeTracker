# Module 4 Exercise 1 — Final Report: Async Agentic Development

**Exercise:** [Implement a feature or fix via an asynchronous platform](async_feature_or_fix.md)
**Project:** IntakeTracker — WW-style 23-point iPhone food tracker
**Dates:** 2026-04-28 (Session 1) → 2026-04-29 (Session 2)
**Runbook for future sessions:** [pre-flight-checklist.md](pre-flight-checklist.md)

---

## Exercise Goals (from spec)

| Goal | Status |
|------|--------|
| Select a concrete feature or fix | ✅ Multiple features across two sessions |
| Kick off from an async surface | ✅ Session 1: claude.ai/code (cloud). Session 2: VSCode parallel agents with git worktrees |
| Review the agent's work | ✅ Claude Review + `gh pr comment` to post results to GitHub |
| Drive to completion with iterations | ✅ PRs merged, issues closed, project board updated |

---

## Session 1 — claude.ai/code (2026-04-28)

### Task: Serving size multiplier label format fix

Selected from the backlog: one-line fix in `AddFoodModal.js`, syntax verifiable with `node --check`, no device needed.

**Prompt used:**
```
Read CLAUDE.md and plan.md first — they contain full project context and agent rules.
Task: Add a serving size multiplier to AddFoodModal.js.
[full prompt in pre-flight-checklist.md § Section 6]
```

**What the cloud agent found and did:**
- Multiplier was already implemented — only the label format was wrong (`2x Eggs` → `Eggs ×2`)
- Fixed one line in `addEntry()`, ran `node --check`, opened PR #7
- Autonomously also: updated CLAUDE.md + plan.md, ran `/issuemanager`, created Issues #8/#9, closed Issue #1

**Code review:** Devin unavailable (paid subscription). Used Claude Review — the exercise lists "Codex/Claude-based review" as a valid option. Agent self-reviewed all 4 focus areas, all passed.

**Critical miss discovered:** Review results stayed local in the Claude Code session. GitHub PR page had nothing. Fix: always post review via `gh pr comment` after `/review`. Also: GitHub blocks `gh pr review --approve` on your own PRs.

### EAS Build + TestFlight (parallel, same session)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

**Blocker:** `eas build` failed — git tracked `PLAN.md` (uppercase), filesystem had `plan.md` (lowercase). EAS tarball builder caught the inconsistency. Fixed with `git mv` through a temp name. Build succeeded on second run. App installed on iPhone via TestFlight, iMac no longer required.

### Overnight autonomous loop

```bash
tmux new -s overnight
/loop 60m "Check open GitHub issues, pick highest-priority with no open PR, implement following CLAUDE.md rules, node --check every JS file, commit, push branch, open PR against main."
```

Implemented Issue #4 (favorites/pinned foods) → PR #10.

### Merge session (next morning) — 100% synchronous conflict resolution

Three PRs needed merging: #6 → #7/#11 → #10. Every PR conflicted because:
- Cloud agent, overnight loop, and local edits all touched the same files without file ownership boundaries in their prompts
- Overnight loop branched from a stale base — re-implemented work already in PR #6
- Resulted in hours of manual conflict resolution

**This was the key failure that shaped Session 2.**

---

## Session 2 — VSCode Parallel Agents with Worktrees (2026-04-29)

### What changed from Session 1

| Problem from Session 1 | Solution in Session 2 |
|------------------------|----------------------|
| Agents shared files → merge conflicts | Strict file ownership in every prompt |
| Branched from stale base | `git worktree add` immediately after `git pull` |
| One working directory → checkout collisions | Git worktrees = separate directories on disk |
| Review stayed local | `/review` skill + `gh pr comment` to post to GitHub |
| Agents stopped at "open PR" | Full finish sequence: PR → merge → close issue → project board Done |
| Unclear terminal layout | 3 panes: Claude Code (left) + Agent 1 (middle) + Agent 2 (right) |

### Setup

```bash
# 1. Worktrees — true filesystem isolation
git pull
git worktree add ~/Desktop/IntakeTracker-agent1 -b feature/weekly-summary
git worktree add ~/Desktop/IntakeTracker-agent2 -b feature/notifications
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent1/node_modules
ln -s ~/Desktop/IntakeTracker/node_modules ~/Desktop/IntakeTracker-agent2/node_modules

# 2. Project board — mark In Progress before launching
gh project item-edit --project-id PVT_kwHOANERK84BVuVP \
  --id PVTI_lAHOANERK84BVuVPzgrAL1M \
  --field-id PVTSSF_lAHOANERK84BVuVPzhRIFdE \
  --single-select-option-id 47fc9ee4   # In Progress

# 3. VSCode: ⌘\ twice → 3 panes. Agent prompts go in middle + right.
# ⚠️ Press ⌘\ TWICE — once only gives 2 panes and Agent 1 displaces Claude Code session.
```

### Agent prompts (key additions vs Session 1)

Each prompt now ends with the full autonomous finish sequence:
```
When done, run in order:
1. Commit and push to origin
2. gh pr create --repo parksoy/IntakeTracker --base main --title "..." --body "..."
3. gh pr merge --squash --delete-branch --repo parksoy/IntakeTracker
4. gh issue close <N> --repo parksoy/IntakeTracker --comment "Implemented in this PR."
5. gh project item-edit --project-id PVT_kwHOANERK84BVuVP \
     --id <ITEM_ID> --field-id <FIELD_ID> --single-select-option-id 98236657
```

### Results

Both agents finished and opened PRs before the +60 min checkpoint with zero conflicts:
- **PR #12** — `notifications.js` + `app.json` (Agent 2) ✅
- **PR #13** — `WeeklyScreen.js` + `App.js` (Agent 1) ✅

Review posted to both PRs via `gh pr comment`. Both merged cleanly. Issues #2 and #3 closed. Project board updated to Done. Zero manual conflict resolution.

---

## Coverage of Exercise Options Not Used

The exercise spec lists four async surfaces. We used three. Here's why the fourth was skipped and what each looked like in practice:

| Option | Used? | How / Why not |
|--------|-------|---------------|
| **Cloud platform (claude.ai/code)** | ✅ Session 1 | Kicked off serving size multiplier fix. Truly async — closed browser tab, agent ran on Anthropic's cloud. |
| **Parallel agents locally** | ✅ Session 2 | VSCode 3-pane split + git worktrees. Not Conductor (no setup needed) — equivalent isolation via `git worktree add`. |
| **GitHub agent review** | ✅ Both sessions | Claude Review via `/review` skill + `gh pr comment` to post results. Devin tried but requires paid Cognition subscription. |
| **Communication channel (Slack)** | ❌ Skipped | No Slack workspace configured to trigger agents. GitHub PR comments served as the async communication layer instead — review comments on the PR function the same way: async, threaded, agent-readable. |

### On back-and-forth iterations

The exercise spec says "drive to completion including any follow-up iterations." In both sessions, reviews passed clean on the first pass — no iteration was needed. What iteration would look like if a review found issues:

1. Post a specific PR comment: *"Line 45: multiplier not applied to custom food entry"*
2. Agent picks up the comment (in claude.ai/code sessions, it subscribes to PR activity)
3. Agent pushes a fix commit to the same branch
4. Re-request review
5. Merge when clean

The pre-flight checklist now includes the full finish sequence in agent prompts — a future agent that hits a review comment would need the same loop: fix → push → re-review → merge.

---

## AI Coding Landscape: Tools Compared

The README lesson plan includes "Evaluating the AI Coding Landscape / Taxonomy for Understanding Coding Agent Capabilities." Based on what we encountered:

| Tool | Type | Async? | Needs machine on? | Cost | Used |
|------|------|--------|-------------------|------|------|
| **Claude Code CLI** | Local agent | No (interactive) | Yes | Pro subscription | ✅ Main tool |
| **claude.ai/code** | Cloud agent | ✅ Yes | No | Pro subscription | ✅ Session 1 |
| **tmux + /loop** | DIY orchestrator | ✅ Yes (if machine stays on) | Yes | Free | ✅ Overnight loop |
| **Conductor** | Agent orchestrator | ✅ Yes | No | Paid | ❌ Not tried |
| **Devin** | Autonomous cloud agent | ✅ Yes | No | Paid subscription | ❌ Unavailable |
| **GitHub Copilot review** | PR review agent | ✅ Yes | No | GitHub subscription | ❌ Not set up |

**Key axis: machine-on vs cloud-native.** For truly autonomous async work (close the laptop), only cloud-native options work — claude.ai/code or Devin. For local parallel work, tmux or VSCode splits with worktrees are sufficient if the machine stays on.

**Agent orchestrator frameworks** (Conductor, LangGraph, custom harnesses) sit above individual agents — they route tasks, manage state across agent runs, and handle retries. Our tmux+/loop was a minimal DIY version of this. Production orchestrators add: task queuing, dependency graphs between agents, shared memory, and observability.

---

## Lessons Learned: True Async Agentic Development

### What works

| Practice | Why it matters |
|----------|---------------|
| **File ownership in the prompt** | Agents from different surfaces don't share session context. CLAUDE.md alone isn't enough. |
| **Git worktrees** | Each agent gets its own directory — edits are invisible to other agents during the run. |
| **Branch from latest main at worktree creation** | Stale base = guaranteed conflicts on merge. |
| **One issue → one agent → one PR** | The moment two agents touch the same file, conflicts require synchronous resolution. |
| **Full finish sequence in the prompt** | Agent should PR → merge → close issue → update board without waiting for you. |
| **Post review via `gh pr comment`** | `/review` results stay local unless explicitly posted. GitHub blocks `--approve` on own PRs. |
| **GitHub Projects as coordination layer** | Issue = unit of work, PR = proof of completion, board column = live status — no need to read session logs. |
| **3-pane VSCode layout** | Left = Claude Code session, Middle = Agent 1, Right = Agent 2. Press ⌘\ twice. |

### What doesn't work

| Anti-pattern | What happens |
|-------------|-------------|
| Shared working directory, multiple agents | Checkout conflicts on the git index |
| File ownership only in CLAUDE.md | Cloud agents, loop agents, and CLI agents each start fresh — they don't share context |
| Branching from a feature branch instead of main | Includes unmerged work; conflicts guaranteed |
| Stopping agent at "open PR" | Leaves merge, issue close, and board update for you to do manually |
| Reviewing in Claude Code without posting | PR page stays blank; looks like nothing was reviewed |
| `⌘\` once instead of twice | Agent 1 prompt goes into Claude Code pane, disrupting the session |

### The GitHub Project board as async truth

```
Issue → Todo          (backlog)
Issue → In Progress   (agent launched, worktree exists)
Issue → Done          (PR merged, branch deleted, issue closed)
```

You can check board status from your phone. No terminal needed to know where things stand.

---

## Final State (end of both sessions)

**Branch:** only `main` remains locally and on remote.

**App on iPhone:** standalone TestFlight build, works with iMac off.

**Features shipped:**
- ✅ Serving size multiplier — `Eggs ×2` label format (Session 1, cloud agent)
- ✅ History screen — `HistoryScreen.js`, multi-day AsyncStorage (Session 1, local)
- ✅ Recently used foods — top 5 at top of modal (Session 1, local)
- ✅ Favorites/pinned foods — ★ star button, persisted (Session 1, overnight loop)
- ✅ EAS Build + TestFlight distribution (Session 1)
- ✅ Weekly summary — `WeeklyScreen.js`, 7-day bar chart (Session 2, Agent 1)
- ✅ Push notification utility — `notifications.js`, `scheduleReminder`/`cancelReminder` (Session 2, Agent 2)

**Remaining open issue:** #5 Dark mode — must run solo (touches all StyleSheets in all components).

**Reusable runbook:** [pre-flight-checklist.md](pre-flight-checklist.md) — covers system setup, issue selection, worktree creation, board moves, VSCode layout, agent prompts with full finish sequence, review posting, post-merge cleanup, and project board IDs.
