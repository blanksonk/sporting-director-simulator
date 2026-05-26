# Sporting Director Simulator

A browser-based football management game where you take the role of a Premier League sporting director for the 2026–27 season. Pick your club, land your transfer targets, set your tactics, and simulate a full 38-game season.

Live: [prem-sports-director-simulator.netlify.app](https://prem-sports-director-simulator.netlify.app)

---

## How to Play

1. **Pick your club** — choose any of the 20 Premier League sides
2. **Choose a sponsor** — unlock extra transfer budget from one of three sponsors
3. **Hit the transfer market** — buy and sell players within your budget
4. **Set your tactics** — pick a formation and assign roles to your starting XI
5. **Simulate the season** — a Monte Carlo simulation runs your 38-game fixture list and produces a final table, player stats, and top scorer

Results are saved to the global leaderboard so you can compare with other managers.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Deployment | Netlify |

---

## Local Development

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/blanksonk/sporting-director-simulator.git
cd sporting-director-simulator
npm install
```

Create `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the Supabase SQL setup (once, in the Supabase SQL editor):

```sql
CREATE TABLE game_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username        text NOT NULL,
  club            text NOT NULL,
  final_position  smallint NOT NULL,
  points          smallint NOT NULL,
  wins            smallint,
  draws           smallint,
  losses          smallint,
  goals_for       smallint,
  goals_against   smallint,
  goal_diff       smallint,
  formation       text,
  starting_budget bigint,
  budget_remaining bigint,
  transfers_in    smallint,
  transfers_out   smallint,
  outcome_zone    text,
  anon_user_id    text,
  played_at       timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON game_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON game_sessions FOR SELECT TO anon USING (true);
GRANT SELECT, INSERT ON public.game_sessions TO anon;
```

Start the dev server:

```bash
npm run dev
```

---

## How the Simulation Works

Each match is simulated using a **Dixon-Coles-inspired Poisson model**:

1. Each team's attack and defence strength is derived from squad ratings (`src/utils/strength.js`)
2. Expected goals for each side are calculated using the strength differential + home advantage
3. Actual goals are sampled from a Poisson distribution (`src/utils/simulation.js`)
4. Goal scorers and assisters are picked using weighted probability (forwards > midfielders, star players weighted by rating^1.5)
5. The full 380-match fixture list is simulated in one pass
6. The process runs **once** (deterministic per session) — results are stored in React state

Player data lives in `public/players.json`, generated from FIFA/FBRef ratings via `convert_to_game_json.py`.

---

## Deployment (Netlify)

1. Connect the repo to Netlify
2. Set environment variables in **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

**Important**: paste the Supabase anon key as a single unbroken line — Netlify's UI can silently insert spaces into long strings.

---

## Project Structure

```
src/
  components/       React screens (LandingPage, TransferRoom, TacticsRoom, etc.)
  data/             Static data (budgets, club logos, sponsors, formations)
  lib/              Supabase client, session save utility, anonymous user ID
  utils/            Simulation engine, transfer logic, squad strength calculator
public/
  players.json      Player database (ratings, positions, clubs, ages)
```
