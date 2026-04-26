---
description: "Write a design doc for a new feature and save it to docs/design/"
allowed-tools: ["Bash", "Write"]
---

# Design Doc

Write a structured design doc for a feature and save it to `docs/design/<feature-name>.md`.

**Usage:** `/design-doc <feature-name>`

**Examples:**
- `/design-doc weekly-summary`
- `/design-doc dark-mode`
- `/design-doc push-notifications`

## Template to fill out

```markdown
# Design: <Feature Name>

**Status:** Draft
**Author:** Soyoung Park
**Date:** <today>

## Problem
<One paragraph: what user need is unmet and why it matters for a personal food tracker.>

## Constraints
- Offline-only — no backend, no network calls
- iOS only — no Android or web parity needed
- AsyncStorage is the only persistence layer
- No navigation library — modals only (no React Navigation)
- EAS Build is the only way to ship — no Xcode

## Options considered

### Option A: <name>
<description>
**Pros:** ...
**Cons:** ...

### Option B: <name>
<description>
**Pros:** ...
**Cons:** ...

## Decision
<Which option and why — 1 paragraph.>

## Implementation plan
1. `<file>` — <what changes>
2. `<file>` — <what changes>
...

## Open questions
- <anything that needs a decision before coding starts>
```

## Procedure

1. Research the feature: read PLAN.md for context, check CLAUDE.md for constraints
2. Look at related existing code (e.g., for weekly-summary: read `storage.js` → `loadAllLogs`)
3. Fill out the template above
4. Save to `docs/design/<feature-name>.md`
5. Print the path and a one-line summary of the decision made

Arguments: $ARGUMENTS
