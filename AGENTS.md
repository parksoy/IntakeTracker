# IntakeTracker — AGENTS.md

Agent-specific behavior guidelines. Read this alongside CLAUDE.md (which has project context, structure, and design decisions).

---

## Running tests after each diff

This project has no automated test suite — it is a personal mobile app verified on device. However, after every code change, run these checks in order before marking the task done:

### 1. Syntax check (required for every .js file touched)
```bash
node --check <file>
```
If it fails, fix the syntax error immediately. Do not move on.

### 2. Import check (catch missing or broken imports)
```bash
node -e "require('./<file>')" 2>&1 | head -5
```
If you see `Cannot find module`, the import path is wrong — fix it before stopping.

### 3. Lint (run after any diff that touches more than one file)
```bash
npm run lint
```
Fix all errors. Warnings are acceptable but should be noted.

### 4. Format check (run before opening a PR)
```bash
npm run format:check
```
If it reports changes needed, run `npm run format` to apply them and stage the result.

---

## Lint and format rules

### ESLint
- Config: `.eslintrc.js` — extends `expo` preset
- Run: `npm run lint`
- Auto-fix safe issues: `npm run lint:fix`
- **Never suppress a lint error with `// eslint-disable`** unless you explain why in a comment above it
- Key rules enforced:
  - No unused variables or imports
  - No `console.log` left in committed code (use `console.warn` for intentional dev output)
  - React hooks rules (exhaustive-deps)

### Prettier
- Config: `.prettierrc` — single quotes, 2-space indent, trailing commas
- Run: `npm run format` to write, `npm run format:check` to verify
- Prettier wins over manual style preference — do not argue with its output

### StyleSheet
- React Native StyleSheet entries must be sorted alphabetically within each object
- No duplicate keys in a StyleSheet (ESLint catches this via `react-native/no-unused-styles` if enabled)

---

## Code review behavior

When asked to review a PR or diff:

1. **Read the diff first** — `git diff <base>...<head>` — before looking at any individual file
2. Check for the following in order:
   - **Correctness** — does the logic do what the description says?
   - **Storage contract** — are AsyncStorage keys following the `intake_log_YYYY-MM-DD` / `intake_recently_used` convention?
   - **Point arithmetic** — if any food points are changed or calculated, verify against the 23-point daily limit logic
   - **Dead code** — unused imports, variables, or helper functions introduced by the agent
   - **Slop** — comments that explain *what* obvious code does instead of *why* non-obvious code does it
3. Report findings as: `[MUST FIX]`, `[SUGGESTION]`, or `[NITPICK]`
4. Do not approve a PR with any `[MUST FIX]` items unresolved

---

## PR review behavior

When asked to review a pull request:

```bash
gh pr view <number> --repo parksoy/IntakeTracker
gh pr diff <number> --repo parksoy/IntakeTracker
```

Structure your review:
- **Summary** (1–2 sentences on what the PR does)
- **Issues found** — grouped by severity: MUST FIX / SUGGESTION / NITPICK
- **Test plan gaps** — anything in the PR checklist that wasn't verifiable without a device
- **Verdict** — Approve / Request Changes / Comment only

Post the review with:
```bash
gh pr review <number> --body "<your review>" --approve   # or --request-changes
```

---

## Design doc behavior

When asked to write a design doc for a new feature:

Structure every design doc as:

```
## Problem
One paragraph: what user need is unmet and why it matters.

## Constraints
Bullet list: platform limits, storage limits, offline-only requirement, no backend.

## Options considered
2–3 approaches, each with: description, pros, cons.

## Decision
Which option and why (1 paragraph).

## Implementation plan
Numbered steps. Each step names the file to change and what specifically changes.

## Open questions
Anything that needs a decision before coding starts.
```

Save design docs to `docs/design/<feature-name>.md`. Do not put design docs in PLAN.md.

---

## Testing behavior

Since there is no test runner, verify correctness as follows:

| Change type | Verification method |
|-------------|---------------------|
| `storage.js` function | Write a small inline Node script, run it, delete the script |
| UI component | Cannot verify without device — say so explicitly |
| Point arithmetic | Trace the calculation by hand and state the expected result |
| Food data | Count items in ZERO_POINT_FOODS and TRACKED_FOODS arrays, confirm totals match CLAUDE.md |

When you cannot test something, say: **"UI verification required on device — not testable via Node."**

---

## Linting behavior

When asked to lint the codebase:

1. `npm run lint` — fix all errors, list all warnings
2. `npm run format:check` — if it reports changes, run `npm run format` and stage the result
3. Run `node --check` on every `.js` file that was touched
4. Report: N errors fixed, N warnings remaining, N files reformatted
