import { squadStrength } from './strength.js';
import { HOME_ADVANTAGE, LEAGUE_AVG_GOALS } from '../data/budgets.js';

// ── Poisson sample via inverse transform ──────────────────────────────────────
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function weightedPick(items) {
  // items: [{ ...data, w: number }]
  const total = items.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.w;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ── Pick scorer + assister for one goal ──────────────────────────────────────
// Scorer weight: overall^2.5 so star FWDs dominate (Haaland 92 vs avg 79 = 46% more likely)
// Assister: creative MIDs/FWDs, never the scorer, 78% of goals have an assist
function pickGoalEvent(squad, roles) {
  const scorerPool = [
    ...squad.filter(p => p.position === 'FWD').map(p => ({ ...p, w: (p.overall / 75) ** 1.5 })),
    ...squad.filter(p => p.position === 'MID').map(p => ({ ...p, w: (p.overall / 75) ** 1.2 * 0.28 })),
    ...squad.filter(p => p.position === 'DEF').map(p => ({ ...p, w: (p.overall / 75) * 0.05 })),
  ];
  if (!scorerPool.length) return { scorer: null, assister: null, minute: 1 };

  // Role overrides: 10% chance penalty taker scores (for each goal), 5% FK direct
  let scorer = weightedPick(scorerPool);
  if (roles?.penaltyTaker && Math.random() < 0.10) {
    const pt = squad.find(p => p.id === roles.penaltyTaker);
    if (pt) scorer = pt;
  } else if (roles?.fkTaker && Math.random() < 0.05) {
    const fk = squad.find(p => p.id === roles.fkTaker);
    if (fk) scorer = fk;
  }

  // Assister (78% of goals)
  let assister = null;
  if (Math.random() < 0.78) {
    const assisterPool = squad
      .filter(p => p.id !== scorer.id)
      .map(p => ({
        ...p,
        w: p.position === 'MID' ? p.overall ** 2 * 0.55 :
           p.position === 'FWD' ? p.overall ** 2 * 0.40 :
           p.position === 'DEF' ? p.overall * 0.08 :
           p.overall * 0.02,
      }));
    // Corner assist bonus
    if (roles?.cornerTaker && Math.random() < 0.12) {
      const ck = squad.find(p => p.id === roles.cornerTaker && p.id !== scorer.id);
      if (ck) assister = ck;
    }
    if (!assister && assisterPool.length) assister = weightedPick(assisterPool);
  }

  const minute = Math.floor(Math.random() * 90) + 1;
  return { scorer, assister, minute };
}

// ── Yellow cards: ~1.5 per team per game, DEF/MID biased ─────────────────────
function pickYellowCards(squad) {
  const n = poisson(1.4); // avg yellows this team gets per game
  const pool = [
    ...squad.filter(p => p.position === 'DEF').map(p => ({ ...p, w: 3 })),
    ...squad.filter(p => p.position === 'MID').map(p => ({ ...p, w: 2 })),
    ...squad.filter(p => p.position === 'FWD').map(p => ({ ...p, w: 1 })),
  ];
  const cards = [];
  const booked = new Set();
  for (let i = 0; i < n; i++) {
    if (!pool.length) break;
    const filtered = pool.filter(p => !booked.has(p.id));
    if (!filtered.length) break;
    const p = weightedPick(filtered);
    booked.add(p.id);
    cards.push(p);
  }
  return cards;
}

// ── Simulate a single match ───────────────────────────────────────────────────
function simulateMatch(homeSquad, awaySquad, homeRoles, awayRoles) {
  const hs = squadStrength(homeSquad);
  const as_ = squadStrength(awaySquad);

  const homeMorale = homeRoles?.captain ? 1.02 : 1;

  const expHome = Math.max(0.05, LEAGUE_AVG_GOALS * hs.attack * (1 / as_.defense) * HOME_ADVANTAGE * homeMorale);
  const expAway = Math.max(0.05, LEAGUE_AVG_GOALS * as_.attack * (1 / hs.defense));

  const homeGoals = poisson(expHome);
  const awayGoals = poisson(expAway);

  const homeEvents = Array.from({ length: homeGoals }, () => pickGoalEvent(homeSquad, homeRoles));
  const awayEvents = Array.from({ length: awayGoals }, () => pickGoalEvent(awaySquad, awayRoles));

  // Sort by minute
  homeEvents.sort((a, b) => a.minute - b.minute);
  awayEvents.sort((a, b) => a.minute - b.minute);

  const homeYellows = pickYellowCards(homeSquad);
  const awayYellows = pickYellowCards(awaySquad);

  // GK saves: shots on target not resulting in goals (avg ~3.5 extra saves per GK per game)
  const homeGkSaves = homeGoals + poisson(3.5); // shots the home GK faced
  const awayGkSaves = awayGoals + poisson(3.5);

  return { homeGoals, awayGoals, homeEvents, awayEvents, homeYellows, awayYellows, homeGkSaves, awayGkSaves };
}

// ── Build round-robin schedule (circle method) — each club plays once per MW ──
function buildFixtures(clubs) {
  const n = clubs.length; // 20
  const fixed = clubs[0];
  const rot = clubs.slice(1); // 19 rotating slots
  const halfFixtures = [];

  for (let round = 0; round < n - 1; round++) {
    const games = [];
    games.push([fixed, rot[round % (n - 1)]]);
    for (let i = 1; i < n / 2; i++) {
      const h = rot[(round + i) % (n - 1)];
      const a = rot[(round - i + n - 1) % (n - 1)];
      games.push([h, a]);
    }
    halfFixtures.push({ matchweek: round + 1, games });
  }

  // Second half: swap home/away
  const fullFixtures = [...halfFixtures];
  halfFixtures.forEach(({ matchweek, games }) => {
    fullFixtures.push({ matchweek: matchweek + n - 1, games: games.map(([h, a]) => [a, h]) });
  });

  return fullFixtures;
}

// ── Main season simulation ────────────────────────────────────────────────────
export function simulateSeason(squads, userClub, roles) {
  const clubs = [...squads.keys()];

  // League table
  const table = {};
  clubs.forEach(c => table[c] = { club: c, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });

  // Per-player stats across ALL clubs (for league top scorers/assisters)
  const leaguePlayerStats = new Map(); // playerId → { player, club, goals, assists, yellowCards, saves }
  clubs.forEach(club => {
    (squads.get(club) || []).forEach(p => {
      leaguePlayerStats.set(p.id, { player: p, club, goals: 0, assists: 0, yellowCards: 0, saves: 0 });
    });
  });

  const userFixtures = [];
  const fixtures = buildFixtures(clubs);

  fixtures.forEach(({ matchweek, games }) => {
    games.forEach(([home, away]) => {
      const homeSquad = squads.get(home) || [];
      const awaySquad = squads.get(away) || [];
      const homeRoles = home === userClub ? roles : null;
      const awayRoles = away === userClub ? roles : null;

      const { homeGoals, awayGoals, homeEvents, awayEvents, homeYellows, awayYellows, homeGkSaves, awayGkSaves } = simulateMatch(
        homeSquad, awaySquad, homeRoles, awayRoles
      );

      // Update table
      table[home].p++; table[away].p++;
      table[home].gf += homeGoals; table[home].ga += awayGoals;
      table[away].gf += awayGoals; table[away].ga += homeGoals;
      if (homeGoals > awayGoals)      { table[home].w++; table[home].pts += 3; table[away].l++; }
      else if (awayGoals > homeGoals) { table[away].w++; table[away].pts += 3; table[home].l++; }
      else                            { table[home].d++; table[home].pts++; table[away].d++; table[away].pts++; }

      // Update league-wide player stats
      const updateStats = (events, yellows, squad, club, gkSaves) => {
        events.forEach(({ scorer, assister }) => {
          if (scorer) {
            const s = leaguePlayerStats.get(scorer.id);
            if (s) s.goals++;
          }
          if (assister) {
            const a = leaguePlayerStats.get(assister.id);
            if (a) a.assists++;
          }
        });
        yellows.forEach(p => {
          const s = leaguePlayerStats.get(p.id);
          if (s) s.yellowCards++;
        });
        // GK saves
        const gk = squad.find(p => p.position === 'GK');
        if (gk) {
          const s = leaguePlayerStats.get(gk.id);
          if (s) s.saves += gkSaves;
        }
      };

      updateStats(homeEvents, homeYellows, homeSquad, home, homeGkSaves);
      updateStats(awayEvents, awayYellows, awaySquad, away, awayGkSaves);

      // Capture user's games
      if (home === userClub || away === userClub) {
        const isHome = home === userClub;
        userFixtures.push({
          matchweek,
          home, away,
          homeGoals, awayGoals,
          userGoals:   isHome ? homeGoals : awayGoals,
          oppGoals:    isHome ? awayGoals : homeGoals,
          events:      isHome ? homeEvents : awayEvents,
          oppEvents:   isHome ? awayEvents : homeEvents,
          opponent:    isHome ? away : home,
          isHome,
        });
      }
    });
  });

  // Finalise table
  Object.values(table).forEach(t => { t.gd = t.gf - t.ga; });
  const sortedTable = Object.values(table).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  sortedTable.forEach((t, i) => { t.position = i + 1; });

  // Sort league stats
  const allStats = [...leaguePlayerStats.values()];
  const leagueTopScorers   = [...allStats].sort((a, b) => b.goals   - a.goals   || b.assists - a.assists).slice(0, 30);
  const leagueTopAssisters = [...allStats].sort((a, b) => b.assists - a.assists || b.goals   - a.goals  ).slice(0, 30);

  // User's own squad stats (subset of leaguePlayerStats)
  const userSquad = squads.get(userClub) || [];
  const userStats = {};
  userSquad.forEach(p => {
    const s = leaguePlayerStats.get(p.id);
    if (s) userStats[p.id] = s;
  });

  return { table: sortedTable, userFixtures, leagueTopScorers, leagueTopAssisters, userStats };
}

// ── Monte Carlo projected outlook (1,000 runs, no stat tracking for speed) ───
export function runProjectedOutlook(squads, userClub, roles, runs = 1000) {
  const clubs = [...squads.keys()];
  const strengths = new Map();
  clubs.forEach(c => strengths.set(c, squadStrength(squads.get(c) || [])));

  const homeMorale = roles?.captain ? 1.02 : 1;

  let totalFinish = 0, totalPoints = 0;
  let top4 = 0, title = 0, relegation = 0;

  for (let run = 0; run < runs; run++) {
    const pts = {};
    clubs.forEach(c => { pts[c] = 0; });

    for (let i = 0; i < clubs.length; i++) {
      for (let j = 0; j < clubs.length; j++) {
        if (i === j) continue;
        const home = clubs[i], away = clubs[j];
        const hs = strengths.get(home), as_ = strengths.get(away);
        const morale = home === userClub ? homeMorale : 1;
        const expH = Math.max(0.05, LEAGUE_AVG_GOALS * hs.attack * (1 / as_.defense) * HOME_ADVANTAGE * morale);
        const expA = Math.max(0.05, LEAGUE_AVG_GOALS * as_.attack * (1 / hs.defense));
        const hg = poisson(expH), ag = poisson(expA);
        if (hg > ag) pts[home] += 3;
        else if (ag > hg) pts[away] += 3;
        else { pts[home]++; pts[away]++; }
      }
    }

    const sorted = Object.entries(pts).sort(([, a], [, b]) => b - a);
    const pos = sorted.findIndex(([c]) => c === userClub) + 1;

    totalFinish += pos;
    totalPoints += pts[userClub];
    if (pos === 1) title++;
    if (pos <= 4) top4++;
    if (pos >= 18) relegation++;
  }

  return {
    avgFinish:     Math.round(totalFinish / runs),
    avgPoints:     Math.round(totalPoints / runs),
    pctTop4:       Math.round((top4       / runs) * 100),
    pctTitle:      Math.round((title      / runs) * 100),
    pctRelegation: Math.round((relegation / runs) * 100),
  };
}
