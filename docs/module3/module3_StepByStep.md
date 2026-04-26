# Module 3 Step by Step — IntakeTracker

**Repo:** https://github.com/parksoy/IntakeTracker
**Branch:** `feature/food-features`

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
