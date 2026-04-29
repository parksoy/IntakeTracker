---
description: "Run ESLint + Prettier + node --check on changed files and fix all errors"
allowed-tools: ["Bash", "Edit"]
---

# Lint Check

Run the full lint and format pipeline on changed files. Fix all errors automatically where safe; report what was changed.

**Usage:** `/lint-check`

## Pipeline (run in order)

### 1. Find changed files
```bash
git diff --name-only claude/food-tracker-app-uMLdp...HEAD | grep '\.js$'
```

### 2. Syntax check each file
```bash
node --check <file>
```
If any file fails, stop and fix the syntax error before continuing.

### 3. ESLint
```bash
npm run lint:fix
```
- Auto-fix safe issues (import order, unused vars that can be removed, etc.)
- For errors that can't be auto-fixed, edit the file manually and explain the change

### 4. Prettier format
```bash
npm run format
```
Applies formatting to all JS files. Stage the result.

### 5. Final lint pass (confirm clean)
```bash
npm run lint
```
Must exit with 0 errors before the task is done. Warnings are acceptable.

## Report format

```
Syntax: N files checked, N passed, N failed (list failures)
ESLint: N errors fixed, N warnings remaining
Prettier: N files reformatted
Status: CLEAN / NEEDS ATTENTION
```
