Update the in-game About page and the README to reflect the current state of the game mechanics.

## What to update

### 1. `src/components/HowToPlay.jsx`

Read the current file, then check the following sources of truth and update any section that is out of date:

- **How to Play tab** — the 5 steps, tips, and leaderboard note
- **Director Score tab** — formula weights and exponents (source: `src/utils/directorScore.js` → `calcDirectorScore`), club tier table (source: `CLUB_TIER` and `EXPECTED_POSITION` constants), example score table
- **Simulation tab** — player attributes used (source: `src/utils/simulation.js` → `pickGoalEvent`, `updateFatigue`), squad strength formula (source: `src/utils/strength.js`), fatigue thresholds, transfer chain description

### 2. `README.md`

Read the current file, then update:

- **How to Play** section — match the 5 steps in HowToPlay.jsx
- **How the Simulation Works** section — match the Simulation tab content
- **Director Score** section (add if missing) — match the Director Score tab content, including formula and club tiers
- **Tech Stack** table — verify it is accurate
- **Project Structure** — verify file list is accurate

## Rules

- Do NOT rewrite sections that are already accurate — only update what has changed
- Do NOT change the README structure or remove existing sections
- After updating both files, summarise what changed in 2–3 bullet points
