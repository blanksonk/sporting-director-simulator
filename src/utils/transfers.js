import { MOCK_PLAYERS, FREEAGENT_POOL } from '../data/mockPlayers.js';

const PL_CLUBS = new Set([
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
  'Chelsea', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham',
  'Hull City', 'Ipswich Town', 'Leeds United', 'Liverpool',
  'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
]);

// Build initial squad map — uses isPL flag if present (real data), else falls back to PL_CLUBS set
export function buildInitialSquads(allPlayers) {
  const squads = new Map();
  PL_CLUBS.forEach(club => squads.set(club, []));
  allPlayers.forEach(p => {
    const inPL = p.isPL !== undefined ? p.isPL : PL_CLUBS.has(p.club);
    if (inPL && squads.has(p.club)) squads.get(p.club).push({ ...p });
  });
  return squads;
}

const MAX_CHAIN_DEPTH = 5;

export function resolveTransferChain(allPlayers, userSquad, userClub, boughtPlayers, soldPlayers) {
  const squads = buildInitialSquads(allPlayers);
  squads.set(userClub, [...userSquad]);

  const incomings = new Map();
  const outgoings = new Map();
  PL_CLUBS.forEach(c => { incomings.set(c, []); outgoings.set(c, []); });

  // Apply user transfers
  boughtPlayers.forEach(p => {
    incomings.get(userClub).push(p);
    if (PL_CLUBS.has(p.club) && p.club !== userClub) {
      squads.set(p.club, (squads.get(p.club) || []).filter(x => x.id !== p.id));
      outgoings.get(p.club).push(p);
    }
  });
  soldPlayers.forEach(p => outgoings.get(userClub).push(p));

  // IDs unavailable to rival clubs (user's current squad)
  const takenIds = new Set(userSquad.map(p => p.id));

  // Full non-PL pool (everyone not currently assigned to a PL squad)
  // PL players can also be targeted — their club then triggers a chain reaction
  const nonPLPool = [
    ...FREEAGENT_POOL,
    ...allPlayers.filter(p => {
      const inPL = p.isPL !== undefined ? p.isPL : PL_CLUBS.has(p.club);
      return !inPL;
    }),
  ];

  // transferLog: one entry per chain move (NOT including user's own transfers)
  // { club, playerIn, fromClub, depth }
  const transferLog = [];

  // Queue: { club, position, depth }
  const queue = boughtPlayers
    .filter(p => PL_CLUBS.has(p.club) && p.club !== userClub)
    .map(p => ({ club: p.club, position: p.position, depth: 1 }));

  const processed = new Set();

  while (queue.length > 0) {
    const { club, position, depth } = queue.shift();
    if (depth > MAX_CHAIN_DEPTH) continue;

    const key = `${club}|${position}|${depth}`;
    if (processed.has(key)) continue;
    processed.add(key);

    const currentSquad = squads.get(club) || [];
    const avgRating = currentSquad.length > 0
      ? currentSquad.reduce((s, p) => s + p.overall, 0) / currentSquad.length
      : 75;

    // 1. Look for best non-PL player within ±10 OVR (no chain triggered)
    const nonPLCandidates = nonPLPool
      .filter(p => p.position === position && !takenIds.has(p.id))
      .sort((a, b) => Math.abs(a.overall - avgRating) - Math.abs(b.overall - avgRating));

    const bestNonPL = nonPLCandidates[0];

    // 2. Also look at PL clubs (can trigger a chain)
    const plCandidates = allPlayers
      .filter(p => {
        const inPL = p.isPL !== undefined ? p.isPL : PL_CLUBS.has(p.club);
        return inPL &&
          p.position === position &&
          p.club !== club &&
          p.club !== userClub &&
          !takenIds.has(p.id) &&
          !currentSquad.some(cp => cp.id === p.id);
      })
      .sort((a, b) => Math.abs(a.overall - avgRating) - Math.abs(b.overall - avgRating));

    const bestPL = plCandidates[0];

    let replacement = null;
    let fromPLClub = false;

    if (!bestNonPL && !bestPL) continue;

    if (!bestNonPL) {
      replacement = bestPL;
      fromPLClub = true;
    } else if (!bestPL) {
      replacement = bestNonPL;
    } else {
      // Prefer PL player if they're meaningfully closer in rating (within 3 OVR better match)
      const nonPLDiff = Math.abs(bestNonPL.overall - avgRating);
      const plDiff = Math.abs(bestPL.overall - avgRating);
      if (plDiff < nonPLDiff - 3) {
        replacement = bestPL;
        fromPLClub = true;
      } else {
        replacement = bestNonPL;
      }
    }

    // Mark taken and update squad
    takenIds.add(replacement.id);
    if (!fromPLClub) {
      // Remove from nonPL pool so it can't be double-signed
      const idx = nonPLPool.findIndex(p => p.id === replacement.id);
      if (idx !== -1) nonPLPool.splice(idx, 1);
    }

    squads.set(club, [...currentSquad, replacement]);
    incomings.get(club).push(replacement);
    transferLog.push({ club, playerIn: replacement, fromClub: replacement.club, depth });

    // If from a PL club, that club now needs a replacement
    if (fromPLClub && PL_CLUBS.has(replacement.club) && replacement.club !== userClub) {
      const fromSquad = squads.get(replacement.club) || [];
      squads.set(replacement.club, fromSquad.filter(p => p.id !== replacement.id));
      outgoings.get(replacement.club).push(replacement);

      if (depth < MAX_CHAIN_DEPTH) {
        queue.push({ club: replacement.club, position, depth: depth + 1 });
      }
    }
  }

  return { updatedSquads: squads, incomings, outgoings, transferLog };
}
