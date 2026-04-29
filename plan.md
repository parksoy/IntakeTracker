# IntakeTracker — Project Plan

## Goal

Build a minimal iPhone app to track daily food intake using a Weight Watchers-inspired 23-point system. No accounts, no server, no complexity. Personal use only.

## Point System Rules

- **Zero-point foods:** unlimited, never count against budget
- **All other foods:** count toward a 23-point daily maximum
- Day resets automatically at midnight
- Going over 23 points shows a warning (red ring + "over budget!" label)

---

## Changelog

| Date | Milestone |
|------|-----------|
| 2026-04 (Session 1, iPhone Claude Code) | Initial idea: WW-style 23-point food tracker for iPhone |
| 2026-04 (Session 2, iMac Claude Code standalone) | Full app built: all components, food data, AsyncStorage, UI |
| 2026-04-12 (Session 3, iMac Claude Code CLI) | Context lost between sessions — reconstructed CLAUDE.md + PLAN.md from code |
| 2026-04-13 (Session 3, continued) | Resolved Expo Go tunnel issue: installed @expo/ngrok, got app running on iPhone |
| 2026-04-13 (Session 3, continued) | Decided to pursue standalone build (Phase 3) so app runs without iMac server |
| 2026-04-12 (Session 4) | Apple Developer account purchased. Multi-agent plan set: 2 agents (EAS Build + Features) in iTerm2 2-pane split |
| 2026-04-28 (Session 5) | Serving size multiplier label fixed (Eggs ×2). Phase 3 complete — first TestFlight build installed. Issue board synced (#8, #9 created). Overnight async loop started via tmux + /loop 60m. See docs/session-2026-04-28.md. |

---

## Phase 1: Core App — COMPLETE (2026-04)

### 1.1 Project Setup
- [x] Init Expo project (`expo init IntakeTracker`)
- [x] Install dependencies: `@react-native-async-storage/async-storage`, `react-native-svg`
- [x] Choose Expo Go as run method (no native build required)

### 1.2 Data Layer
- [x] Define `ZERO_POINT_FOODS[]` — 59 items (Protein, Legumes, Fruit, Vegetable, Starchy, Dairy)
- [x] Define `TRACKED_FOODS[]` — 35 items with point values (Bread, Fats, Dairy, Snacks, Drinks, Meat, Fast Food)
- [x] Research and apply WW 2024/2025 point values

### 1.3 Storage
- [x] `loadTodayLog()` — loads entries from AsyncStorage, auto-clears on new day
- [x] `saveTodayLog(entries)` — persists current day's log
- [x] `clearTodayLog()` — wipes today's entries

### 1.4 Components
- [x] `PointsRing` — SVG circular ring, color-coded: green / orange / red
- [x] `FoodLogItem` — single log row with name, time, badge, delete button
- [x] `AddFoodModal` — slide-up modal with:
  - Search bar filtering both lists
  - "Zero Points" tab → FREE badge items
  - "Has Points" tab → point-valued items
  - Custom food entry (name + manual point value) at bottom of Has Points tab

### 1.5 Main Screen (`App.js`)
- [x] Date header ("Monday, Apr 12")
- [x] Points ring showing used / 23
- [x] "Today's Log" section with FlatList
- [x] "Clear day" button
- [x] Floating "+" FAB to open AddFoodModal
- [x] Empty state ("Nothing logged yet")
- [x] Loading state

---

## Phase 2: First Run on iPhone — COMPLETE (2026-04-13)

### 2.1 Run on iPhone via Expo Go
- [x] Installed Expo Go on iPhone
- [x] Installed `@expo/ngrok` globally (`npm install -g @expo/ngrok@^4.1.0`) — required for tunnel mode
- [x] `npx expo start --tunnel` — tunnel connects and app loads on iPhone
- [x] App confirmed working on iPhone

**Limitation identified:** App requires iMac tunnel server to be running. iMac cannot be turned off while using the app. → Resolved in Phase 3.

**How to run dev builds (for development only):**
```bash
# Open macOS Terminal (Cmd+Space → Terminal), then:
cd ~/Desktop/IntakeTracker && npx expo start --tunnel
```
Scan the QR code with iPhone Camera app → opens in Expo Go.

---

## Phase 3: Standalone iPhone App — NEXT

**Goal:** Build a real standalone `.ipa` so the app has its own home screen icon, works offline, and never needs the iMac server running.

**Prerequisites:**
- [x] Apple Developer account — active
- [x] Install EAS CLI: `npm install -g eas-cli`
- [x] Log in: `eas login`

**Agent 1 Steps (Left pane):**
- [x] Install EAS CLI + login
- [x] `eas build:configure` — creates `eas.json`, updates `app.json` with bundle ID + Apple Team
- [x] `eas build --platform ios --profile production` — triggers cloud build (~15–20 min)
- [x] Submit to TestFlight: `eas submit --platform ios`
- [x] Install on iPhone via TestFlight → verify home screen icon + works with iMac off

**Agent 2 Steps (Right pane):**
- [x] Update `storage.js` to persist logs across multiple days (keyed by date)
- [x] Build `HistoryScreen.js` — list of past days with total points + entries
- [x] Add serving size multiplier to `AddFoodModal.js` (stepper: 1× / 2× / 3×) — logs "Eggs ×2", integer points
- [x] Add "Recently Used" section at top of food list (last 5 logged items)

**Notes:**
- **Xcode is NOT required** — EAS Build compiles entirely in Expo's cloud servers, nothing runs locally
- First build takes ~15–20 minutes (done in Expo's cloud, not on your iMac)
- No App Store submission needed — EAS can install directly on your device
- Free tier of EAS Build allows a limited number of builds per month (enough for personal use)
- iMac only needs internet connection and the `eas` CLI tool

---

## Phase 4: Feature Enhancements (Backlog)

These are ideas for future sessions — none are committed to. Prioritize after Phase 3 is done.

| Priority | Feature | Status |
|----------|---------|--------|
| ~~High~~ | ~~History screen~~ | ✅ Done (PR #6) |
| ~~High~~ | ~~Serving size multiplier~~ | ✅ Done (PR #11) |
| ~~Medium~~ | ~~Recently used foods~~ | ✅ Done (PR #6) |
| ~~Medium~~ | ~~Favorites / pinned foods~~ | ✅ Done (PR #10) |
| Medium | Weekly summary | ⬜ Issue #2 — next up |
| Low | Daily reminder notification | ⬜ Issue #3 — next up |
| Low | Dark mode | ⬜ Issue #5 — solo only (touches all StyleSheets) |

---

## Architecture Notes

- Single screen app — no React Navigation needed
- State lives entirely in `App.js` (no Redux/Zustand)
- `FlatList` with `ListHeaderComponent` for ring + log header
- Modal uses `presentationStyle="pageSheet"` for iOS native bottom-sheet look
- `KeyboardAvoidingView` wraps modal content for custom food input
- All styling via `StyleSheet.create()` — no CSS-in-JS library
- Brand color: `#2E7D32` (dark green)
