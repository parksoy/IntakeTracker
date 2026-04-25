# IntakeTracker — CLAUDE.md

## Project Overview

A simple iPhone app to track daily food intake using a Weight Watchers-style 23-point system. No authentication, no backend, no cloud sync. Just a fast, personal daily tracker.

**Core rule:** Zero-point foods are unlimited. Non-zero-point foods count against a 23-point daily budget.

## Tech Stack

- **Framework:** React Native via Expo (SDK ~54)
- **Run method (dev):** Expo Go — `npm start`, scan QR code with iPhone camera
- **Run method (production):** EAS Build (cloud) → TestFlight → standalone iPhone app
- **Storage:** `@react-native-async-storage/async-storage` (local device only)
- **SVG:** `react-native-svg` (used for the circular progress ring)
- **No navigation library** — single-screen app with a modal for adding food

## Apple Developer Account

- **Status:** Active
- **Team ID:** NK2Q5QYAPT
- **Use:** EAS Build signing + TestFlight distribution (no App Store submission needed)
- **Xcode:** NOT used — all builds run on Expo's cloud servers

## Project Structure

```
IntakeTracker/
  App.js                        # Root component — main screen, state, layout
  app.json                      # Expo config
  package.json
  src/
    components/
      PointsRing.js             # Circular SVG ring showing points used vs. 23 limit
      FoodLogItem.js            # Single row in the food log list
      AddFoodModal.js           # Bottom sheet modal: search + tabs + custom entry
    data/
      foods.js                  # ZERO_POINT_FOODS[] and TRACKED_FOODS[] arrays
    utils/
      storage.js                # AsyncStorage helpers: load/save/clear today's log
```

## Key Design Decisions

- **23-point daily limit** (`DAILY_LIMIT = 23`) defined in both `App.js` and `PointsRing.js`
- **Auto day-reset:** `loadTodayLog()` checks stored date vs. today; clears stale data automatically
- **Points ring color:** green (<19 pts), orange (19–22 pts), red (>23 pts)
- **Zero-point tab shows "FREE" badge** (green); tracked-points tab shows "X pts" badge (orange)
- **Custom food entry** lives in the "Has Points" tab footer — name + point value, any number
- **No persistence across days** by design — each day starts fresh

## Running the App

### Development (Expo Go)
```bash
cd ~/Desktop/IntakeTracker && npx expo start --tunnel
```
- `@expo/ngrok` installed globally — already done
- Scan QR with iPhone Camera app → opens in Expo Go
- Requires iMac to stay on

### Production (Standalone — no iMac needed)
```bash
eas build --platform ios --profile production
```
- Builds in Expo's cloud (~15–20 min), no Xcode
- Distribute via TestFlight → installs on iPhone with home screen icon
- Works fully offline, iMac can be off

## What's Built (Complete)

- [x] Main screen with date header
- [x] Circular points ring (SVG, color-coded)
- [x] Food log list (FlatList) with time-stamped entries
- [x] Delete individual entries (tap ✕)
- [x] "Clear day" button
- [x] Add Food modal with search
- [x] Zero-point foods tab (59 items across Protein, Legumes, Fruit, Vegetable, Starchy, Dairy)
- [x] Has-Points foods tab (35 items across Bread, Fats, Dairy, Snacks, Drinks, Meat, Fast Food)
- [x] Custom food entry (name + points)
- [x] AsyncStorage persistence within a day, auto-reset at midnight

## Multi-Agent Plan (Current Session)

Two Claude Code agents run in parallel in iTerm2 (2-pane split). Each owns a separate concern with no file overlap.

| Agent | Pane | Owns | Goal |
|-------|------|------|------|
| **Agent 1** | Left | `app.json`, `eas.json`, build config | EAS Build setup + TestFlight distribution |
| **Agent 2** | Right | `storage.js`, new screen components | History view, serving size multiplier, recently used foods |

**Merge strategy:** Each agent works on a separate git branch; merge sequentially when done.

## What's Not Built (Backlog)

- [x] ~~Fix/verify Expo Go QR scan error~~ — moot once EAS build is live
- [ ] **[Agent 1]** EAS Build configured + first TestFlight build
- [ ] **[Agent 2]** History view — see past days' logs
- [ ] **[Agent 2]** Serving size multiplier (e.g., 2x a food item)
- [ ] **[Agent 2]** Recently used / favorite foods
- [ ] Weekly/monthly point summary
- [ ] Push notifications / reminders
