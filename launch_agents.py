#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["iterm2"]
# ///
#
# IntakeTracker — Multi-Agent Launcher
# Opens a 2-pane iTerm2 split and starts both Claude Code agents.
#
# Run with:
#   uv run launch_agents.py
#
# Requires: iTerm2 Python API enabled (Settings → General → Magic → Enable Python API)

import iterm2
import asyncio

WORK_DIR = "~/Desktop/IntakeTracker"

AGENT1_CMD = "\n".join([
    f"cd {WORK_DIR}",
    # Checkout isolated branch so Agent 1 never conflicts with Agent 2
    "git checkout -b feature/eas-build 2>/dev/null || git checkout feature/eas-build",
    (
        'claude "You are Agent 1 (EAS Build). '
        'Read CLAUDE.md and PLAN.md first — they have full context. '
        'Your sole job: configure EAS Build so this Expo app produces a standalone iOS .ipa '
        'distributed via TestFlight, with no Xcode required. '
        'Steps: (1) npm install -g eas-cli, (2) eas login, '
        '(3) eas build:configure — this creates eas.json and updates app.json, '
        '(4) eas build --platform ios --profile production — triggers the cloud build. '
        'Apple Developer Team ID: NK2Q5QYAPT. '
        'Only modify app.json and eas.json. Never touch src/ or App.js. '
        'If eas login requires a browser, pause and tell the user to complete it."'
    ),
])

AGENT2_CMD = "\n".join([
    f"cd {WORK_DIR}",
    # Checkout isolated branch so Agent 2 never conflicts with Agent 1
    "git checkout -b feature/food-features 2>/dev/null || git checkout feature/food-features",
    (
        'claude "You are Agent 2 (Features). '
        'Read CLAUDE.md and PLAN.md first — they have full context. '
        'Add these 3 features to the React Native Expo food tracker app: '
        '(1) History view: update src/utils/storage.js to persist logs across multiple days '
        'keyed by date string, create src/components/HistoryScreen.js to show past days '
        'with total points and entries, wire a History button into App.js. '
        '(2) Serving size multiplier: add a 1x / 2x / 3x stepper in AddFoodModal.js '
        'so the user can log multiple servings at once. '
        '(3) Recently used: track the last 5 logged food names in AsyncStorage '
        'and show them at the top of the food list in AddFoodModal.js. '
        'Only modify files in src/ and App.js. Never touch app.json or eas.json."'
    ),
])


async def main(connection):
    app = await iterm2.async_get_app(connection)
    window = app.current_terminal_window

    if window is None:
        window = await iterm2.Window.async_create(connection)

    tab = window.current_tab
    left = tab.current_session

    # Split into left/right panes
    right = await left.async_split_pane(vertical=True)

    await left.async_set_name("Agent 1 — EAS Build")
    await right.async_set_name("Agent 2 — Features")

    # Start Agent 1 in left pane
    for line in AGENT1_CMD.split("\n"):
        await left.async_send_text(line + "\n")
        await asyncio.sleep(0.3)

    # Start Agent 2 in right pane
    for line in AGENT2_CMD.split("\n"):
        await right.async_send_text(line + "\n")
        await asyncio.sleep(0.3)

    print("Both agents launched. Switch to iTerm2.")


iterm2.run_until_complete(main)
