# Module 4 Exercise 1 — Report: Async Agentic Development

**Exercise:** [Implement a feature or fix via an asynchronous platform](async_feature_or_fix.md)
**Project:** IntakeTracker — WW-style 23-point iPhone food tracker
**Date:** 2026-04-28 / 2026-04-29

---

## Exercise Goals (from spec)

| Goal | Status |
|------|--------|
| Select a concrete feature or fix | ✅ Serving size multiplier label format fix |
| Kick off from an async surface | ✅ claude.ai/code (cloud, no terminal needed) |
| Review the agent's work | ✅ Claude Review on PR #7 (Devin not available — paid subscription required) |
| Drive to completion with iterations | ✅ Agent self-reviewed all 4 focus areas; conflicts resolved in follow-up session |

---

## What We Did — Full Timeline

### 1. Chose the task

From the project backlog (`plan.md`), selected the **serving size multiplier** in `AddFoodModal.js`:
- Single well-scoped file change
- Clear spec already written in `CLAUDE.md` and `plan.md`
- Syntax verifiable with `node --check` — no device needed
- Low conflict risk: one file, one feature

### 2. Kicked off on claude.ai/code (async cloud agent)

- Go to `claude.ai/code` → New Session
- Connect repo: `parksoy/IntakeTracker` (GitHub OAuth)
- Pasted this prompt:

```
Read CLAUDE.md and plan.md first — they contain full project context and agent rules.

Task: Add a serving size multiplier to AddFoodModal.js.

Spec:
- Add a 1× / 2× / 3× stepper in the "Has Points" tab, visible above or near the Add button.
- When the user adds a food item, multiply its point value by the selected multiplier before logging it.
- The logged food name should reflect the multiplier, e.g. "Eggs ×2".
- Zero-point foods do not need the multiplier (always free), but adding it for UX consistency is fine — just ensure points remain 0.
- Only modify src/components/AddFoodModal.js and App.js if needed. Do not touch storage.js, foods.js, or eas.json.

Rules (from CLAUDE.md):
- After editing any JS file, run: node --check <edited-file-path>
- If the check fails, fix the syntax error before finishing.
- Do not hardcode food names or point values — all food data lives in src/data/foods.js only.

When done, open a pull request against the claude/food-tracker-app-uMLdp branch.
```

- Closed the browser tab. Agent ran async on Anthropic's cloud servers.

### 3. What the cloud agent found and did

**Key finding:** The serving size multiplier was already fully implemented (stepper UI, `servings` state, point multiplication). Only the logged food name format was wrong.

**Fix (one line in `addEntry()`):**
```js
// Before
const name = servings > 1 ? `${servings}x ${baseName}` : baseName;

// After
const name = servings > 1 ? `${baseName} ×${servings}` : baseName;
```

**Syntax check:** `node --check src/components/AddFoodModal.js` → ✓ syntax ok

**PR opened:** PR #7 (`claude/async-features-intaketracker-UxuYQ` → `claude/food-tracker-app-uMLdp`)

**The agent also did (autonomously, beyond the task):**
- Updated `CLAUDE.md` and `PLAN.md` marking multiplier complete
- Ran `/issuemanager` — created Issues #8 (history screen) and #9 (recently used foods) from unchecked `plan.md` items
- Closed Issue #1 (EAS Build — confirmed complete after TestFlight install)
- Discussed and set up an overnight `/loop` in tmux for autonomous issue work

### 4. Code review (in place of Devin)

Devin requires a paid Cognition account + GitHub App — not available. Used **Claude Review** instead, which the exercise explicitly lists as a valid option ("Codex/Claude-based review or auto-fix workflow").

Agent self-reviewed PR #7 covering all 4 focus areas:

| Review question | Result | Evidence |
|---|---|---|
| Multiplier resets when different food selected? | ✓ Pass | `setServings(1)` in `useEffect` on modal open; modal closes after each add |
| Applies to custom food entries? | ✓ Pass | `handleAddCustom()` calls `addEntry()` which reads `servings` |
| Integer points, not floats (e.g. "4.0")? | ✓ Pass | Preset points are integer literals; custom uses `parseInt()`; stepper values are 1/2/3 |
| `node --check` passes? | ✓ Pass | Confirmed in agent session |

### 5. EAS Build + TestFlight (parallel work, same session)

While the cloud agent handled the feature, the highest-priority backlog item (EAS Build) was handled locally — the one step that cannot be automated since it requires interactive credential setup.

```bash
eas build --platform ios --profile production   # triggered cloud build
eas submit --platform ios                        # pushed to TestFlight
```

**Blocker hit:** `eas build` failed on first attempt with `PLAN.md` filename casing error — git tracked it as `PLAN.md` (uppercase), filesystem had `plan.md` (lowercase). EAS's tarball builder detected the inconsistency. Fixed with:

```bash
git mv PLAN.md PLAN_TEMP.md
git mv PLAN_TEMP.md plan.md
```

Build succeeded on second run. App installed on iPhone via TestFlight with home screen icon. iMac no longer required to run the app.

### 6. Overnight autonomous loop

The cloud session set up a tmux-based `/loop` to autonomously implement backlog issues overnight:

```
tmux new -s overnight
/loop 60m "Check open GitHub issues on parksoy/IntakeTracker that have no open PR
covering them. Pick the highest-priority one, implement it following all rules in
CLAUDE.md, run node --check on every edited JS file, commit, push to a new branch,
and open a PR against claude/food-tracker-app-uMLdp."
```

The loop implemented one issue overnight: **#4 — Favorites/pinned foods** → PR #10 (`feature/favorites-pinned-foods`).

### 7. Merge session (next day)

Three PRs needed merging in dependency order: #6 → PR #7/11 → #10.

**PR #6** (`feature/food-features`) — merged cleanly via `gh pr merge --squash`.

**PR #7** (`claude/async-features-intaketracker-UxuYQ`) — conflicted after #6 merged. Root cause: the cloud agent's branch contained a full re-implementation of features already in #6. Resolved by creating a clean branch (`fix/pr7-cherry-pick`), cherry-picking only the 4 unique commits (label fix + doc updates), and opening PR #11 as a replacement. PR #7 closed.

**PR #10** (`feature/favorites-pinned-foods`) — conflicted for the same reason (overnight loop branched from an old base). Resolved by rebasing onto the updated base, manually resolving conflicts in `AddFoodModal.js` (merging favorites state + toggleFavorite with existing servings + recentlyUsed state). Final merged `AddFoodModal.js` contains all three features working together: servings multiplier + recently used + favorites.

---

## Lessons Learned: True Async Agentic Development

### What worked well

- **claude.ai/code is genuinely async** — the agent ran, opened a PR, reviewed its own work, synced issues, and closed completed ones, all without the terminal open. The CLAUDE.md context file did its job.
- **CLAUDE.md as agent onboarding** — every agent (local, cloud, overnight loop) read it first. Consistent rules and file ownership declarations reduced drift.
- **GitHub Issues + PRs as async coordination** — each issue was a unit of work; each PR was proof of completion. This is the right model for multi-agent work.

### What didn't work: merge conflicts required 100% synchronous resolution

Every conflict came from the same root cause: **multiple agents touched the same files** (`AddFoodModal.js`, `plan.md`, `CLAUDE.md`) without strict ownership boundaries. The async framing broke down the moment merging started — each conflict required reading both versions, understanding intent, and manually resolving in real time.

**Why it happened:**
- File ownership rules in CLAUDE.md said "Agent 1 owns app.json/eas.json, Agent 2 owns src/" — but the cloud agent and overnight loop weren't given those constraints in their prompts
- The overnight loop branched from a stale base (before PR #6 merged), so its additions collided with everything in #6
- The cloud agent re-implemented features that were already in PR #6, creating large overlapping diffs

### Rules for true async multi-agent work

| Rule | Why |
|------|-----|
| **Assign non-overlapping files per agent in the prompt** — not just in CLAUDE.md | Agents from different surfaces (web, loop, local) don't share context; the prompt is the only guarantee |
| **Each agent branches from the latest merged base** — never from a feature branch | Branching from a stale base guarantees conflicts on merge |
| **Use git worktrees for truly isolated parallel work** | Worktrees give each agent a separate working directory on the same repo — no checkout conflicts |
| **One issue → one agent → one branch → one PR** | The moment two agents touch the same file, you need a synchronous merge session |
| **GitHub Projects board is the coordination layer** | Issue = unit of work, PR = proof of completion, project column = status. Avoids reading session logs to understand state |

### GitHub Projects setup (done)

- **Project:** "IntakeTracker Roadmap" at `github.com/users/parksoy/projects/1`
- **Remaining open issues on the board:**
  - #2 — Weekly/monthly point summary (`priority:medium`)
  - #3 — Push notification / daily reminder (`priority:low`)
  - #5 — Dark mode (`priority:low`)
- **Closed in this session:** #1 (EAS Build), #4 (favorites), #8 (history screen), #9 (recently used)

---

## Final State

**Branch:** only `claude/food-tracker-app-uMLdp` remains (local + remote). All feature branches deleted.

**App on iPhone:** standalone TestFlight build, no iMac required.

**Features shipped in this session:**
- ✅ Serving size multiplier — `Eggs ×2` label format, integer points
- ✅ History screen — `HistoryScreen.js`, multi-day AsyncStorage keyed by date
- ✅ Recently used foods — top 5 logged foods surfaced in modal
- ✅ Favorites/pinned foods — ★ star button on every food row, persisted in AsyncStorage
- ✅ EAS Build + TestFlight distribution
