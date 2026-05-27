# Sporting Director Simulator

A browser-based football management game where you take the role of a Premier League sporting director for the 2026–27 season. Pick your club, land your sponsor, hit the transfer market, set your tactics, and simulate a full 38-game season.

Live: [prem-sports-director-simulator.netlify.app](https://prem-sports-director-simulator.netlify.app)

---

## How to Play

1. **Pick your club** — choose any of the 20 Premier League sides. Bigger clubs have higher budgets and stronger squads but less room for glory. Your club tier directly affects your Director Score — winning with Hull is legendary, winning with Man City is expected.
2. **Land a sponsor** — pitch one of three sponsor deals. Bigger deals offer more budget but carry a lower acceptance chance. Securing a large sponsor earns bonus Director Score points.
3. **Hit the transfer market** — buy and sell players within your budget. Player attributes (pace, finishing, passing, defending, stamina) feed directly into the simulation. Squad depth beats one superstar over 38 games.
4. **Set your tactics** — pick a formation and assign roles (Attack / Support / Defend) to your starting XI. Roles affect how players contribute to goal-scoring and defensive output.
5. **Simulate the season** — all 380 Premier League fixtures are simulated in one pass. Watch the table update matchweek by matchweek, then review your full stats, top scorers, and final standing.

---

## Director Score

Your result is ranked on a **Director Score (0–1000)** rather than raw points, so a mid-table finish with Hull can rank above a title win with Man City.

### Formula

All components are normalised to 0–1 and combined polynomially. Weights sum to 1.0.

| Weight | Component | Notes |
|--------|-----------|-------|
| 50% | Position | `pos^1.1` — slight upward curve |
| 13% | Underdog bonus | How far above expected finish, scaled by club difficulty. Tier 1 earns 0×, Tier 4 earns 1.0× |
| 9% | Attack flair | Goals scored. `^1.5` curve — hard to max |
| 9% | Defensive solidity | Goals conceded. `^1.5` curve |
| 6% | Win rate | Fraction of games won |
| 5% | Squad balance | GK/DEF/MID/FWD coverage. `^0.8` concave curve |
| 4% | Sponsor tier | Bigger sponsor = more points. `^0.7` concave |
| 4% | Budget efficiency | How much starting budget you didn't spend |

### Club Tiers

| Tier | Clubs | Expected finish | Underdog multiplier |
|------|-------|----------------|---------------------|
| 1 — Elite | Man City, Chelsea, Liverpool, Arsenal, Man Utd | Title / top 2 | 0× |
| 2 — Strong | Tottenham, Newcastle, Aston Villa | Top 6–8 | 0.33× |
| 3 — Mid | Brighton, Fulham, Everton, Crystal Palace, Brentford, Nottm Forest | 10th–14th | 0.67× |
| 4 — Lower | Bournemouth, Leeds, Ipswich, Sunderland, Coventry, Hull | Survival battle | 1.0× |

---

## How the Simulation Works

Each of the 380 Premier League fixtures uses a **Poisson goal model** inspired by the Dixon-Coles method:

1. Each team's attack and defence strength is computed from squad ratings (`src/utils/strength.js`)
2. Expected goals are calculated using the strength differential, a league-average baseline (1.36 goals per team per game), and a home advantage multiplier
3. Actual goals are sampled from a Poisson distribution
4. Goal scorers and assisters are picked by weighted probability from the squad

### Player Attributes

Sourced from FIFA ratings. Each player carries 8 attributes used in the model:

| Attribute | Used for |
|-----------|----------|
| `fin` (Finishing) | FWD scoring weight — primary goal threat |
| `pac` (Pace) | Bonus multiplier on finishing for fast forwards |
| `sho` (Shooting) | MID scoring weight |
| `pas` (Passing) | Assist probability (60% weight) |
| `dri` (Dribbling) | Assist probability (40% weight) |
| `def` (Defending) | DEF strength calculation |
| `phy` (Physic) | DEF strength calculation |
| `sta` (Stamina) | Fatigue rate per match |

### Squad Strength

```
FWD rating = overall×0.40 + fin×0.35 + sho×0.15 + pac×0.10
DEF rating = overall×0.45 + def×0.35 + phy×0.20
```

### Fatigue

Players accumulate fatigue across 38 matchweeks. High-stamina (80+) = 0.75/match, average (60–79) = 1.0/match, low (<60) = 1.25/match. Fatigue reduces effective strength — squad rotation matters.

### Transfer Chain

When you buy a player, their old club signs a replacement. The simulation resolves a cascade: each club that loses a player automatically signs the best available free agent at that position, keeping all 20 squads competitive.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Deployment | Netlify |
| Player data | FIFA ratings via `convert_to_game_json.py` |

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

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the Supabase SQL setup (once, in the SQL editor):

```sql
CREATE TABLE game_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username         text NOT NULL,
  club             text NOT NULL,
  final_position   smallint NOT NULL,
  points           smallint NOT NULL,
  wins             smallint,
  draws            smallint,
  losses           smallint,
  goals_for        smallint,
  goals_against    smallint,
  goal_diff        smallint,
  formation        text,
  starting_budget  bigint,
  budget_remaining bigint,
  transfers_in     smallint,
  transfers_out    smallint,
  outcome_zone     text,
  director_score   integer,
  anon_user_id     text,
  played_at        timestamptz DEFAULT now()
);

CREATE TABLE comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username     text NOT NULL,
  body         text NOT NULL,
  anon_user_id text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON game_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON game_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON comments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON comments FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT ON public.game_sessions TO anon;
GRANT SELECT, INSERT ON public.comments TO anon;
```

Start the dev server:

```bash
npm run dev
```

### Update docs after gameplay changes

Run `/update-docs` in Claude Code to sync `HowToPlay.jsx` and this README with the current simulation mechanics.

---

## Project Structure

```
src/
  components/       React screens (LandingPage, TransferRoom, TacticsRoom, SeasonAnimation, etc.)
  data/             Static data (budgets, club logos, sponsors, formations)
  lib/              Supabase client, session save, anonymous user ID
  utils/            Simulation engine, transfer chain, squad strength, director score
public/
  players.json      Player database (~18k players with FIFA attributes)
.claude/
  commands/         Repo-level Claude Code skills (e.g. /update-docs)
```
