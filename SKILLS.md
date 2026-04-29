# IntakeTracker — Agent Skills

Reusable, composable capabilities available to orchestrator agents working on this repo.
Each skill has a defined input, output, and strict file scope so sub-agents don't step on each other.

Read alongside CLAUDE.md (project context) and AGENTS.md (behavior rules).

---

## skill: add-food-item

**Purpose:** Add a new food entry to the data file
**Input:** `{ name: string, category: string, points: number | 0 }`
**File scope:** `src/data/foods.js` only
**Output:** Confirms item added and which array it went into

Steps:
1. Read `src/data/foods.js`
2. Generate a unique `id` using the pattern already in the file (e.g. `"z60"` for zero-point, `"t36"` for tracked)
3. If `points === 0` → append `{ id, name, category }` to `ZERO_POINT_FOODS[]` under the correct category group
4. If `points > 0` → append `{ id, name, category, points }` to `TRACKED_FOODS[]`
5. Run `node --check src/data/foods.js`
6. Report: `"Added [name] to [ZERO_POINT_FOODS|TRACKED_FOODS] under [category]"`

---

## skill: add-storage-key

**Purpose:** Add a new AsyncStorage key with typed load/save helper functions
**Input:** `{ keyName: string, description: string, valueType: string }`
**File scope:** `src/utils/storage.js` only
**Output:** Two new exported async functions: `load<KeyName>()` and `save<KeyName>(value)`

Steps:
1. Add `const <KEY_NAME>_KEY = 'intake_<keyName>';` near the other key constants at the top
2. Add `load<KeyName>()` following the pattern of `loadRecentlyUsed()` — try/catch, return `[]` or `null` on failure
3. Add `save<KeyName>(value)` following the pattern of `saveRecentlyUsed()` — silently fail on error
4. Export both functions
5. Run `node --check src/utils/storage.js`
6. Report the two exported function names and the storage key string

---

## skill: create-modal-screen

**Purpose:** Scaffold a new full-screen modal component
**Input:** `{ name: string, purpose: string }`
**File scope:** Creates `src/components/<Name>Screen.js` only
**Output:** New component file; prints wire-up instructions for App.js

Steps:
1. Read `src/components/HistoryScreen.js` as the structural template
2. Create `src/components/<Name>Screen.js` with:
   - `Modal` + `SafeAreaView` wrapper (`visible`, `onClose` props)
   - Header row: title left, green "Done" button right (`color: '#2E7D32'`)
   - `FlatList` or `ScrollView` body appropriate to the purpose
   - `ListEmptyComponent` with centered emoji + title + subtitle
   - `StyleSheet.create()` at the bottom, no inline styles
3. Run `node --check src/components/<Name>Screen.js`
4. Print exact lines to add to `App.js`:
   - import statement
   - state variable (`const [<name>Visible, set<Name>Visible] = useState(false)`)
   - JSX component placement below `<AddFoodModal />`

---

## skill: wire-screen-into-app

**Purpose:** Add an existing screen component to App.js with a trigger button
**Input:** `{ screenName: string, buttonLabel: string, buttonPlacement: 'header' | 'fab' }`
**File scope:** `App.js` only
**Output:** Screen imported, state wired, button added, component rendered

Steps:
1. Read `App.js`
2. Add import at top: `import <ScreenName> from './src/components/<ScreenName>';`
3. Add state: `const [<screen>Visible, set<Screen>Visible] = useState(false);`
4. If `buttonPlacement === 'header'`: add `TouchableOpacity` to the header View (see History button as model)
5. If `buttonPlacement === 'fab'`: add a second FAB or add to existing FAB menu
6. Add `<<ScreenName> visible={<screen>Visible} onClose={() => set<Screen>Visible(false)} />` below `<AddFoodModal />`
7. Run `node --check App.js`
8. Report what was added

---

## skill: create-github-issue

**Purpose:** Create a single GitHub issue for a backlog item
**Input:** `{ title: string, body: string, labels: string[] }`
**File scope:** GitHub only — no local files changed
**Output:** Issue URL

Steps:
1. Check `gh auth status` — if not authenticated, stop and print `"Run: gh auth login"`
2. Run: `gh issue create --repo parksoy/IntakeTracker --title "<title>" --body "<body>" --label "<labels joined by comma>"`
3. Add the new issue to the project board: `gh project item-add 1 --owner parksoy --url <issue-url>`
4. Report the issue URL and number

---

## skill: run-lint-pipeline

**Purpose:** Run the full lint and format pipeline on a set of changed files
**Input:** `{ files: string[] }` — list of `.js` file paths
**File scope:** reads/writes the listed files only
**Output:** Pass/fail report

Steps:
1. For each file: `node --check <file>` — stop on first failure and report it
2. `npm run lint:fix` — auto-fix safe ESLint issues
3. `npm run format` — apply Prettier to all files
4. `npm run lint` — final clean check, must exit 0
5. Report:
   ```
   Syntax:  N files checked, all passed   (or: FAILED on <file>)
   ESLint:  N errors fixed, N warnings remaining
   Prettier: N files reformatted
   Status:  CLEAN / NEEDS ATTENTION
   ```

---

## skill: write-design-doc

**Purpose:** Write a structured design doc for a planned feature
**Input:** `{ featureName: string, githubIssueNumber: number }`
**File scope:** Creates `docs/design/<feature-name>.md`
**Output:** Saved design doc path

Template to fill:
```markdown
# Design: <Feature Name>

**Status:** Draft  
**Issue:** #<N>  
**Date:** <today YYYY-MM-DD>

## Problem
<One paragraph: what user need is unmet.>

## Constraints
- Offline-only — no backend, no network calls
- iOS only
- AsyncStorage only persistence
- No navigation library — modals only

## Options considered
### Option A: <name>
**Pros:** ...  **Cons:** ...

### Option B: <name>
**Pros:** ...  **Cons:** ...

## Decision
<Which option and why.>

## Implementation plan
1. `<file>` — <what changes>
2. `<file>` — <what changes>

## Open questions
- <anything unresolved>
```

Steps:
1. Read `PLAN.md` and the referenced GitHub issue for context
2. Look at any related existing code (storage, components) before writing
3. Fill the template
4. Save to `docs/design/<feature-name>.md`
5. Report the file path and the one-line decision summary
