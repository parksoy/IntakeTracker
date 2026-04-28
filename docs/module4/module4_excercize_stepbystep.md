## Exercise 1 — Step-by-Step: Async Feature via Cloud Agent + Devin Review

Reference: [async_feature_or_fix.md](async_feature_or_fix.md)

---

### Task chosen: Serving size multiplier in `AddFoodModal.js`

**Why this task:**
- Single-file change (`src/components/AddFoodModal.js`), no storage or food data changes needed
- Clear spec already in `plan.md` and `CLAUDE.md`
- Syntax verifiable via `node --check` — no device required to validate
- Well-scoped: add multiplier state + stepper UI + multiply points on submit

**Exercise goals covered:**
| Goal | How |
|------|-----|
| Select a concrete feature | Serving size multiplier (1×/2×/3×) |
| Kick off from async surface | claude.ai/code connected to GitHub repo |
| Review the agent's work | Devin reviews the resulting PR |
| Drive to completion with iterations | Respond to Devin's review comments, agent re-pushes |

---

### Step 1 — Kick off on claude.ai/code

1. Go to `claude.ai/code`
2. Connect repo: `parksoy/IntakeTracker`
3. Paste the following prompt:

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

4. Start the task and close the tab — the agent runs async on Anthropic's cloud servers.

---

### Step 2 — Devin reviews the PR

Once claude.ai/code opens a PR on `parksoy/IntakeTracker`:

1. Invite Devin to the GitHub repo (or use `@devin-ai-integration` in a PR comment)
2. Ask Devin to review the PR:
   ```
   @devin-ai-integration please review this PR. Focus on:
   - Does the multiplier reset correctly when a different food is selected?
   - Does it apply to custom food entries (manual name + points input)?
   - Are point values multiplied correctly (integer, not float like "4.0")?
   - Does node --check pass on the edited files?
   ```
3. Devin runs async and posts review comments.

---

### Step 3 — Iterate to completion

- Review Devin's comments and any comments you have on the diff.
- Leave specific PR comments pointing to lines that need changes.
- The claude.ai/code agent (or you locally) pushes fixes.
- Re-request Devin review if needed.
- Merge when the diff looks correct.

---

### What to verify before merging (no device needed)

- [ ] `node --check src/components/AddFoodModal.js` passes
- [ ] `node --check App.js` passes (if modified)
- [ ] Multiplier label format is `×2` not `x2` or `x 2.0`
- [ ] Custom food entry respects the multiplier
- [ ] Zero-point foods remain at 0 points regardless of multiplier
