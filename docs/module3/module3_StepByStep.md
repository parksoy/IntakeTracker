# Module 3 Step by Step — IntakeTracker

**Repo:** https://github.com/parksoy/IntakeTracker
**Branch:** `feature/food-features`

---

## Full Module 3 Checklist

| Item | What was built |
|------|---------------|
| `CLAUDE.md` | Project context + 4 agent rules (syntax check, food data location, storage key contract, no fake UI verification) |
| `AGENTS.md` | Testing protocol after each diff, lint/format rules, agent behavior for code review / PR review / design docs / testing / linting |
| `.claude/settings.json` | PostToolUse syntax-check hook + context7 MCP server |
| `/ship` | Commit → push → open PR, linked to GitHub issue |
| `/deslop` | Remove AI slop vs main branch |
| `/issuemanager` | Sync PLAN.md backlog → GitHub Issues + Project board |
| `/code-review` | Structured review: correctness, storage contract, dead code, slop |
| `/design-doc` | Generate design docs → `docs/design/<feature>.md` |
| `/lint-check` | Full pipeline: node --check → lint:fix → format → final lint pass |
| ESLint | `eslint.config.js` with expo preset, zero errors on codebase |
| Prettier | `.prettierrc`, `npm run format` applied to all JS files |
| `SKILLS.md` | 7 composable agent capabilities with strict file scope — callable by orchestrator agents |

---

## Key Concepts: What Each File Type Does

### CLAUDE.md vs AGENTS.md

| | `CLAUDE.md` | `AGENTS.md` |
|--|-------------|-------------|
| **Who reads it** | Claude Code only | Any AI agent (Claude, Codex, Gemini, etc.) |
| **Purpose** | Project context + Claude-specific rules | Universal agent behavior contract |
| **What goes in it** | Stack, file structure, design decisions, build commands, Claude-specific rules | How to run tests, lint rules, code review protocol, PR behavior — things that apply regardless of which agent is working |
| **Analogy** | Onboarding doc written for Claude | Employee handbook for any contractor |

In a single-Claude-Code project, they overlap. The distinction matters when multiple agent tools (Cursor, Codex, Claude) all work the same repo.

### Built-in Skills vs Custom Commands vs SKILLS.md

| | Built-in Skills | `.claude/commands/*.md` | `SKILLS.md` |
|--|----------------|------------------------|-------------|
| **Who defines them** | Anthropic / Claude Code system | You | You |
| **Who invokes them** | Claude automatically, mid-task | You, explicitly with `/name` | An orchestrator agent dispatching to sub-agents |
| **Examples** | `/review`, `/init`, `simplify` | `/ship`, `/deslop`, `/lint-check` | `add-food-item`, `create-modal-screen` |
| **What they are** | Pre-built capabilities with real code behind them | Markdown prompt templates you trigger manually | Composable capability specs an agent calls programmatically |
| **Analogy** | Built-in iPhone apps | Terminal scripts you run yourself | API endpoints another service can call |

**The key distinction:**
- **Command** = "I want Claude to do X right now" → you type `/ship`
- **Skill (built-in)** = Claude decides mid-task it needs a capability and calls it internally
- **SKILLS.md entry** = an orchestrator agent says "dispatch `add-food-item` to a sub-agent" — composable, callable by other agents, not just humans

**SKILLS.md in this project** (`/SKILLS.md` at repo root) defines 7 callable capabilities:

| Skill | Input | File scope |
|-------|-------|-----------|
| `add-food-item` | name, category, points | `src/data/foods.js` only |
| `add-storage-key` | keyName, description | `src/utils/storage.js` only |
| `create-modal-screen` | name, purpose | creates `src/components/<Name>Screen.js` |
| `wire-screen-into-app` | screenName, buttonLabel, placement | `App.js` only |
| `create-github-issue` | title, body, labels | GitHub only, no local files |
| `run-lint-pipeline` | files[] | listed `.js` files |
| `write-design-doc` | featureName, issueNumber | creates `docs/design/<feature>.md` |

Each skill has strict file scope so parallel sub-agents don't conflict with each other.

When you type `/ship` → Claude reads `.claude/commands/ship.md` and follows those instructions as a prompt. When Claude internally calls a built-in skill like `simplify` → it runs an Anthropic-defined capability. When an orchestrator agent says "use the `add-food-item` skill" → it reads `SKILLS.md` and dispatches a focused sub-agent with that exact scope.

### How to spawn named agents

Three real options, from simplest to most powerful:

**Option 1 — Named roles in the prompt** (what `launch_agents.py` does)
Give each agent a specific identity and scope in its opening prompt:
```
"You are BuildBot. Your only job is EAS Build config. Only touch app.json and eas.json."
"You are FeatureBot. Your only job is the history screen. Only touch src/ and App.js."
```
Launch via iTerm2 split panes using `launch_agents.py`.

**Option 2 — Claude Code subagents via the Agent tool**
Ask Claude Code to spawn named parallel subagents directly in a session:
```
Agent(description="BuildBot", prompt="Configure EAS Build...")
Agent(description="FeatureBot", prompt="Build HistoryScreen...")
```
These run in parallel and report back. Claude Code orchestrates them.

**Option 3 — Claude Code on the web (`code.claude.com`)**
Launch named cloud agents on a GitHub repo — they run asynchronously, have real names, and show up as separate sessions. This is the Module 4 async workflow option.

---

## Exercise: Integrate a configuration file, custom rules, commands, and hooks

### What was done

#### 1. Configuration file — `CLAUDE.md`

A `CLAUDE.md` file was created at the project root. It gives any agent full context about the project without needing to explore the codebase from scratch. Sections include:

- **Project overview** — 23-point WW-style food tracker, no backend, local only
- **Tech stack** — React Native/Expo, AsyncStorage, react-native-svg, EAS Build
- **Project structure** — file tree with one-line descriptions of each component
- **Key design decisions** — daily limit constant, day-reset logic, color thresholds
- **Running the app** — dev (Expo Go tunnel) and production (EAS Build → TestFlight)
- **Build status** — what's complete, what's in progress
- **Agent Rules** — explicit rules the agent must follow (described below)

#### 2. Custom rules added to `CLAUDE.md`

Four concrete rules were added under `## Agent Rules`:

**Rule 1 — Syntax check after every JS edit:**
```
After editing any JS file, run: node --check <file>
If it fails, fix the error before stopping.
```
*Why:* React Native has no fast compiler feedback loop. A broken JS file silently fails to load in Expo Go, which is hard to diagnose on device.

**Rule 2 — Food data lives in one place:**
```
Food data lives in src/data/foods.js only.
Zero-point foods → ZERO_POINT_FOODS[], others → TRACKED_FOODS[] with a points field.
```
*Why:* Agents tend to hardcode values inline when editing modal or log components. This rule keeps the data source of truth in one file.

**Rule 3 — Storage key contract:**
```
Keys: intake_log_YYYY-MM-DD for daily logs, intake_recently_used for the recent list.
Never rename these without also updating loadAllLogs() and loadTodayLog().
```
*Why:* loadAllLogs() filters by the `intake_log_` prefix. A renamed key would silently break history without any error.

**Rule 4 — No UI testing without the device:**
```
React Native UI changes cannot be verified by running Node scripts.
Say so explicitly rather than claiming the UI is correct.
```
*Why:* Agents sometimes claim "verified working" after running a Node import check. For RN components, only device/simulator testing counts.

#### 3. Hook — `.claude/settings.json`

A `PostToolUse` hook was added at `.claude/settings.json`. It fires after every `Edit` or `Write` tool call and runs `node --check` on the modified file if it ends in `.js`.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "file=\"$CLAUDE_TOOL_INPUT_FILE_PATH\"; if [[ \"$file\" == *.js ]]; then node --check \"$file\" && echo \"✓ syntax ok: $file\" || echo \"✗ syntax error in $file — fix before continuing\"; fi"
          }
        ]
      }
    ]
  }
}
```

**Verification:** After adding the hook, three JS files were checked and all passed:
```
✓ syntax ok: src/components/AddFoodModal.js
✓ syntax ok: src/utils/storage.js
✓ syntax ok: App.js
```

#### 4. Custom commands — `.claude/commands/`

Three slash commands were installed in `.claude/commands/`:

**`/ship [github-issue-number]`** — automates the full git workflow:
- Checks syntax on all changed `.js` files before committing
- Generates branch name, commit message, and PR description from the diff
- Opens a PR and optionally links it to a GitHub issue (`Closes #N`)
- Adapted from the course template to use GitHub issues instead of Linear

**`/deslop`** — removes AI-generated code slop:
- Diffs the branch against main
- Removes: unnecessary comments, redundant try/catch, unused imports, duplicate StyleSheet entries
- Keeps: legitimate error boundaries, non-obvious "why" comments
- Reports a 1–3 sentence summary of changes

**`/issuemanager [sync|close|board]`** — manages GitHub Issues and Projects:
- `sync` — reads unchecked backlog items from plan.md, creates missing GitHub issues with labels, adds to project board
- `close <name>` — closes the matching issue and marks plan.md item as done
- `board` — prints open issues grouped by priority label
- Uses `gh` CLI under the hood

#### 5. GitHub Issues and Projects setup

**GitHub Issues:** Used to track every backlog item from plan.md. Labels mirror the priority tiers in the plan (`priority:high`, `priority:medium`, `priority:low`, `feature`, `chore`).

**GitHub Projects:** A kanban board with columns:
- **Backlog** — unchecked items from plan.md
- **In Progress** — items with an open PR
- **Done** — merged features

The `/issuemanager sync` command populates Issues and adds them to the Project board automatically using `gh issue create` and `gh project item-add`.

---

### Workflow scenario exercised

**Scenario: "Adding a new feature"**

1. Agent reads `CLAUDE.md` → understands project structure, storage contract, daily limit constant
2. Agent edits a `.js` file → `PostToolUse` hook fires → `node --check` runs automatically
3. If syntax is clean, agent follows the rule to run the check manually before closing the task
4. Agent runs `/deslop` → removes any verbose comments or redundant guards it introduced
5. Agent runs `/ship 5` → stages files, commits with `feat:` prefix, pushes, opens PR linked to issue #5
6. Maintainer runs `/issue-manager close weekly-summary` → GitHub issue closed, PLAN.md updated

---

### Evidence the rule is being enforced

The hook was verified by editing `AddFoodModal.js` to remove the unused `findFoodByName` function. After the `Edit` tool call completed, the hook output:
```
✓ syntax ok: src/components/AddFoodModal.js
```

The CLAUDE.md food-data rule was enforced during the multi-agent session: Agent 2's prompt explicitly stated "food data lives in src/data/foods.js only" and the agent did not add any inline food names to modal or log components.
