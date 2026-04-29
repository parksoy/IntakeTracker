# Async Agent Experiment — Session Retrospective

**Date:** 2026-04-28  
**Branch created:** `feature/favorites-pinned-foods`  
**PR opened:** parksoy/IntakeTracker #10

---

## What We Attempted

Set up a recurring loop to autonomously find and implement uncovered GitHub issues:

```
/loop 45m Check open GitHub issues on parksoy/IntakeTracker that have no open PR
covering them. Pick the highest-priority one, implement it following all rules in
CLAUDE.md, run node --check on every edited JS file, commit, push to a new branch,
and open a PR against claude/food-tracker-app-uMLdp. Then wait for the next loop
iteration.
```

---

## What Actually Happened — Step by Step

### Setup
1. `/loop 45m <prompt>` was parsed: interval = 45m, prompt = the task.
2. **45m was rounded to 60m** because 45 doesn't evenly divide 60 (cron fires at :00 and :45, giving uneven 45m/15m gaps). Cron job `5b65ba84` created: `7 * * * *` (hourly at :07).

### First Iteration
3. Fetched open issues from `parksoy/IntakeTracker` — found 6 open issues.
4. Fetched open PRs — found PR #6 (`feature/food-features`) and PR #7 (label fix).
5. Cross-referenced: issues #8 (history screen) and #9 (recently used) marked "In progress: PR #6" → treated as covered.
6. Uncovered issues, by priority:
   - **#4** — favorites/pinned foods (medium)
   - **#2** — weekly/monthly summary (medium)
   - **#5** — dark mode (low)
   - **#3** — push notifications (low)
7. Picked **#4 (favorites/pinned foods)** as highest-priority uncovered.
8. Checked base branch (`claude/food-tracker-app-uMLdp`) — no recently-used feature yet, favorites would work standalone.
9. Created branch `feature/favorites-pinned-foods` from `claude/food-tracker-app-uMLdp` (had to stash dirty `app.json` first).
10. Implemented: `loadFavorites`/`saveFavorites` in `storage.js`, star buttons + Favorites section in `AddFoodModal.js`.
11. `node --check` passed on both files.
12. Committed, pushed, opened PR #10 against `claude/food-tracker-app-uMLdp`.

### Loop Cancelled
13. User stopped the loop after the first iteration — three problems surfaced.

---

## Problem 1: Sequential, not parallel

Each loop iteration picks **one** issue, implements it, then waits for the next clock tick. With 4 uncovered issues at 60m cadence, full backlog = 4+ hours of clock time with the agent idle most of that time. Parallel work on multiple issues simultaneously would be far more efficient.

---

## Problem 2: Interval too long, cron rounding made it worse

45m was requested. Cron requires intervals that evenly divide 60, so it rounded to **60m**. Even 45m is slow — code tasks complete in 5–15 minutes, not 45. The agent sat idle for ~45 minutes after finishing a 10-minute task.

A self-paced dynamic loop (no interval) would chain tasks immediately: finish one → start the next, no waiting.

---

## Problem 3: Permission prompts blocked hand-off

Every `gh`, `git`, and `node --check` call prompted for user approval. The user had to stay present and click through the entire session. It felt synchronous, not async.

**Root cause:** The permission allowlist was not configured before starting. Fix: run `/fewer-permission-prompts` or `update-config` to pre-approve common commands in `.claude/settings.json`.

---

## Problem 4: Parallel sessions — scattered context and memory

This session ran alongside two other independent Claude Code sessions:

| Session | Surface | Scope |
|---------|---------|-------|
| (1) | VSCode Claude Code extension | In-editor coding |
| (2) | claude.ai/code (cloud) | Async PR/branch work |
| (3) | tmux + Claude Code CLI | This session (loop experiment) |

Each session starts with no knowledge of what the others have done or are doing. The result:

- **No shared working memory.** Conversation context is siloed per session. Session 3 doesn't know Session 1 just edited `App.js`.
- **Duplicate or conflicting work.** Two sessions could independently pick the same issue, open duplicate PRs, or edit the same file simultaneously — last writer wins, earlier work is silently overwritten.
- **Memory files are local-only.** The `~/.claude/projects/.../memory/` directory is shared between local sessions (VSCode + tmux both read the same filesystem), but **cloud sessions (claude.ai/code) cannot access it**. Cloud sessions only see what's in the git repo.
- **Branch/worktree confusion.** If two local sessions are in the same working directory, a `git checkout` in one immediately affects the other's file view.

### Why this happens

Claude Code has no built-in agent coordination protocol. Each session is an independent process. The memory system helps within one machine but breaks as soon as a cloud session is involved. GitHub is the only state that all three sessions share.

### Solutions

**GitHub as the coordination layer** (works for all three session types):
- Assign a GitHub issue to yourself before starting work on it — other sessions skip assigned issues.
- Add a custom label (`in-progress`) to claim an issue; remove it when you open the PR.
- Use draft PRs to signal "claimed" even before work is complete.
- This is the only coordination mechanism that cloud sessions can observe.

**CLAUDE.md as live project state** (works for all local + cloud sessions that read the repo):
- Maintain a "Currently Being Worked On" section in CLAUDE.md listing which issues/features are in flight.
- Update it before starting work; remove the entry when the PR is merged.
- Since CLAUDE.md is the first file any Claude Code session reads, this acts as a shared bulletin board.

**Session handoff notes in `.claude/`** (local sessions only):
- Before closing a session, write a brief state file: what was done, what branch, what's next.
- Next session reads it on startup to orient itself.
- Not helpful for cloud sessions.

**One orchestrator, isolated workers** (most reliable pattern):
- One session (the "main" tmux session) acts as coordinator: picks issues, spins up workers, reviews PRs.
- Workers are given narrow, isolated tasks with no file overlap.
- Workers never make architectural decisions — they execute a spec.

---

## iTerm2 vs tmux for parallel sessions

Both work. The practical tradeoffs:

| | iTerm2 native splits | tmux |
|--|---------------------|------|
| Setup | Zero — built into macOS terminal | Requires install + config |
| Persistence | Panes die if the app quits | Sessions survive terminal close, reconnect with `tmux attach` |
| Best for | Local parallel work, visual monitoring | Remote/SSH, sessions you want to leave running overnight |
| Keyboard | `Cmd+D` (vertical), `Cmd+Shift+D` (horizontal) | `Ctrl+b %` (vertical), `Ctrl+b "` (horizontal) |

**For this project:** iTerm2 is the right default. The CLAUDE.md already specifies it ("2-pane split in iTerm2"). Use tmux only if you need sessions to survive a laptop sleep/restart.

**Either way, the same file-conflict problem applies.** Two panes in the same working directory will conflict if both agents touch the same files. See the git worktree section below.

---

## Git worktrees for parallel local sessions

Naive parallel setup — **broken**:

```bash
# Pane 1
cd ~/Desktop/IntakeTracker && claude   # on branch feature/favorites

# Pane 2
cd ~/Desktop/IntakeTracker && claude   # on branch feature/weekly-summary
```

Both agents share one working directory. Agent 2 running `git checkout feature/weekly-summary` immediately changes what Agent 1 sees on disk. If both edit `AddFoodModal.js`, last write wins.

**Git worktrees fix this.** Each agent gets its own filesystem path with its own branch checked out simultaneously:

```bash
# one-time setup before starting parallel work
git worktree add ../IntakeTracker-agent2 -b feature/weekly-summary claude/food-tracker-app-uMLdp
git worktree add ../IntakeTracker-agent3 -b feature/dark-mode claude/food-tracker-app-uMLdp

# Pane 1 — original directory, existing branch
cd ~/Desktop/IntakeTracker          # branch: feature/favorites-pinned-foods

# Pane 2 — isolated copy
cd ~/Desktop/IntakeTracker-agent2   # branch: feature/weekly-summary

# Pane 3 — another isolated copy
cd ~/Desktop/IntakeTracker-agent3   # branch: feature/dark-mode
```

Each pane has its own `node --check`, its own git state, and writes to its own branch. No cross-contamination. Cleanup when done:

```bash
git worktree remove ../IntakeTracker-agent2
git worktree remove ../IntakeTracker-agent3
```

**The `isolation: "worktree"` flag on the Claude Code `Agent` tool does this automatically** when spawning sub-agents programmatically. For manual iTerm2 sessions you set it up yourself.

---

## What Did Work

- **Issue selection logic** — correctly identified uncovered issues, ranked by label, skipped those with open PRs.
- **Implementation quality** — correct storage key (`intake_favorites`), syntax verified, no hardcoded food data.
- **PR hygiene** — branched off the right base, full test plan, `Closes #4` link.

---

## How to Do This Right Next Time

| Problem | Fix |
|---------|-----|
| Sequential, one issue at a time | Use iTerm2 + git worktrees to run one `claude` per pane per issue in parallel |
| 60m interval / cron rounding | Use `/loop <prompt>` (no interval) for immediate self-pacing, or `/schedule` for cloud-based runs |
| Permission prompts block hand-off | Run `/fewer-permission-prompts` first; pre-approve `gh`, `git`, `node --check` in `.claude/settings.json` |
| True background async | Use `/schedule` — runs on Anthropic's cloud even after closing the session |
| Scattered context across sessions | Use GitHub issues as coordination (assign before starting); keep CLAUDE.md "in-flight" section updated |
| Conflicting file edits across sessions | Git worktree per agent — never two agents in the same working directory |
| Cloud session can't read local memory | Put coordination state in the repo (CLAUDE.md or a `.claude/status.md`), not just local memory files |

---

## Files Changed This Session

| File | Change |
|------|--------|
| `src/utils/storage.js` | Added `loadFavorites()` and `saveFavorites()` |
| `src/components/AddFoodModal.js` | Favorites state, star buttons (☆/★), Favorites section header in both tabs |

Branch `feature/favorites-pinned-foods` → PR #10.
