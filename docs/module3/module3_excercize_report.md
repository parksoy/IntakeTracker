# Module 3 Exercise Report — IntakeTracker

**Repo:** https://github.com/parksoy/IntakeTracker
**Branch:** `feature/food-features`
**Agent:** Claude Code (claude-sonnet-4-6)

---

## What is IntakeTracker?

A personal iPhone app that tracks daily food intake using a Weight Watchers-style 23-point system. No backend, no accounts, no cloud sync — just a fast offline tracker built with React Native/Expo. Foods are either zero-point (unlimited) or counted against a 23-point daily budget that resets at midnight.

---

## What Was Built (Module 3)

| Item | File(s) | What it does |
|------|---------|--------------|
| **Config file** | `CLAUDE.md` | Project context, tech stack, file map, 4 agent rules |
| **Universal agent rules** | `AGENTS.md` | Testing protocol, lint rules, code review / PR / design doc behavior for any agent |
| **Composable skills** | `SKILLS.md` | 7 callable capabilities with strict file scope for orchestrator agents |
| **Hook** | `.claude/settings.json` | PostToolUse: auto-runs `node --check` on every edited `.js` file |
| **MCP server** | `.claude/settings.json` | context7 — fetches live Expo/RN docs mid-session |
| **`/ship`** | `.claude/commands/ship.md` | Syntax check → commit → push → open PR linked to GitHub issue |
| **`/deslop`** | `.claude/commands/deslop.md` | Diff vs main, remove AI slop, report 1–3 sentence summary |
| **`/issuemanager`** | `.claude/commands/issuemanager.md` | Sync PLAN.md backlog → GitHub Issues + Project board |
| **`/code-review`** | `.claude/commands/code-review.md` | Structured review: correctness, storage contract, dead code, slop |
| **`/design-doc`** | `.claude/commands/design-doc.md` | Write design doc → `docs/design/<feature>.md` |
| **`/lint-check`** | `.claude/commands/lint-check.md` | node --check → lint:fix → format → final lint pass |
| **ESLint** | `eslint.config.js` | Expo preset, zero errors on full codebase |
| **Prettier** | `.prettierrc` | Single quotes, 100-char width, applied to all JS files |
| **GitHub Issues** | 5 issues created | Backlog items labeled by priority (`priority:high/medium/low`, `feature`, `chore`) |
| **GitHub Projects** | Board #1 | Kanban: Backlog / In Progress / Done — all 5 issues added |

### The 4 agent rules in CLAUDE.md

| Rule | Why it matters |
|------|---------------|
| Run `node --check <file>` after every JS edit | RN has no fast compiler — a broken file silently fails to load on device |
| Food data lives in `src/data/foods.js` only | Prevents agents from hardcoding values inline in components |
| Storage keys: `intake_log_YYYY-MM-DD`, `intake_recently_used` | `loadAllLogs()` filters by prefix — a renamed key silently breaks history |
| No claiming UI works without device test | Agents sometimes pass a Node import check and call it "verified" |

### Hook verification

After adding the PostToolUse hook, every Edit/Write tool call on a `.js` file automatically printed:
```
✓ syntax ok: src/components/AddFoodModal.js
✓ syntax ok: src/utils/storage.js
✓ syntax ok: App.js
```

---

## Key Concepts

### CLAUDE.md vs AGENTS.md

| | `CLAUDE.md` | `AGENTS.md` |
|--|-------------|-------------|
| **Who reads it** | Claude Code only | Any AI agent (Claude, Codex, Gemini, etc.) |
| **Purpose** | Project context + Claude-specific rules | Universal agent behavior contract |
| **What goes in it** | Stack, structure, design decisions, Claude rules | Test protocol, lint rules, review/PR/design doc behavior |
| **Analogy** | Onboarding doc written for Claude | Employee handbook for any contractor |

### Built-in Skills vs Custom Commands vs SKILLS.md

| | Built-in Skills | `.claude/commands/*.md` | `SKILLS.md` |
|--|----------------|------------------------|-------------|
| **Who defines them** | Anthropic | You | You |
| **Who invokes them** | Claude automatically mid-task | You, typing `/name` | An orchestrator agent dispatching to sub-agents |
| **Examples** | `/review`, `simplify`, `init` | `/ship`, `/deslop`, `/lint-check` | `add-food-item`, `create-modal-screen` |
| **Analogy** | Built-in iPhone apps | Terminal scripts you run | API endpoints another service can call |

### preferences.md and .prompt.md (not native to Claude Code)

| File | What it would do | Claude Code equivalent |
|------|-----------------|----------------------|
| `preferences.md` | User style/communication preferences across all projects | `~/.claude/projects/.../memory/` auto-memory |
| `.prompt.md` | Directory-scoped base prompt, loaded when agent enters that folder | Subdirectory `CLAUDE.md` files |

### How to spawn named agents

| Option | How | Example |
|--------|-----|---------|
| Named role in prompt | Give each agent a name + scope in its opening prompt | `"You are BuildBot. Only touch app.json and eas.json."` |
| Claude Code Agent tool | Ask Claude to spawn parallel subagents in a session | `Agent(description="BuildBot", prompt="...")` |
| Claude Code on the web | `code.claude.com` — async cloud agents on a GitHub repo | Module 4 async workflow |

---

## Workflow: How It All Fits Together

```
New feature request
       │
       ▼
Agent reads CLAUDE.md + AGENTS.md → knows project rules, file map, storage contract
       │
       ▼
Agent edits .js file → PostToolUse hook fires → node --check runs automatically
       │
       ▼
/deslop → remove AI slop vs main branch
       │
       ▼
/ship 3 → syntax check → commit → push → PR opened, closes issue #3
       │
       ▼
/code-review → correctness, storage contract, dead code, verdict
       │
       ▼
/issuemanager close <feature> → GitHub issue closed, PLAN.md updated
```
