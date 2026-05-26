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

export function resolveTransferChain(allPlayers, userSquad, userClub, boughtPlayers, soldPlayers) {
  // Start with a fresh squad map from all players
  const squads = buildInitialSquads(allPlayers);

  // Apply user's transfers to squad map
  squads.set(userClub, [...userSquad]);

  // Remove bought players from their old clubs
  boughtPlayers.forEach(player => {
    if (PL_CLUBS.has(player.club) && player.club !== userClub) {
      const old = squads.get(player.club) || [];
      squads.set(player.club, old.filter(p => p.id !== player.id));
    }
  });

  // Track incomings and outgoings per club
  const incomings = new Map();
  const outgoings = new Map();
  PL_CLUBS.forEach(c => { incomings.set(c, []); outgoings.set(c, []); });

  // Add user's bought players to user's incomings; sold players to user's outgoings
  boughtPlayers.forEach(p => incomings.get(userClub).push(p));
  soldPlayers.forEach(p => outgoings.get(userClub).push(p));

  // Players the user bought leave their old clubs — those are outgoings for those clubs
  boughtPlayers.forEach(player => {
    if (PL_CLUBS.has(player.club) && player.club !== userClub) {
      outgoings.get(player.club).push(player);
    }
  });

  // Pool of available replacement players — non-PL players from the full dataset
  const replacementPool = [
    ...FREEAGENT_POOL,
    ...allPlayers.filter(p => {
      const inPL = p.isPL !== undefined ? p.isPL : PL_CLUBS.has(p.club);
      return !inPL;
    }),
  ];

  // For each PL club that lost a player, find a replacement
  // Chain: if replacement is from a PL club, that club also needs a replacement
  const clubsNeedingReplacement = new Map(); // club → position needed

  boughtPlayers.forEach(player => {
    if (PL_CLUBS.has(player.club) && player.club !== userClub) {
      const prev = clubsNeedingReplacement.get(player.club) || [];
      prev.push(player.position);
      clubsNeedingReplacement.set(player.club, prev);
    }
  });

  const visited = new Set();
  const queue = [...clubsNeedingReplacement.entries()].flatMap(([club, positions]) =>
    positions.map(pos => ({ club, position: pos }))
  );

  while (queue.length > 0) {
    const { club, position } = queue.shift();
    const key = `${club}-${position}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const currentSquad = squads.get(club) || [];
    const avgRating = currentSquad.length
      ? currentSquad.reduce((s, p) => s + p.overall, 0) / currentSquad.length
      : 75;

    // Find best replacement from pool (closest rating, same position)
    const candidates = replacementPool.filter(p => p.position === position);
    if (candidates.length === 0) continue;

    candidates.sort((a, b) =>
      Math.abs(a.overall - avgRating) - Math.abs(b.overall - avgRating)
    );

    const replacement = candidates[0];
    replacementPool.splice(replacementPool.indexOf(replacement), 1);

    squads.set(club, [...currentSquad, replacement]);
    incomings.get(club).push(replacement);

    // If replacement came from a PL club, that club now needs a replacement too
    if (PL_CLUBS.has(replacement.club) && replacement.club !== club) {
      outgoings.get(replacement.club).push(replacement);
      queue.push({ club: replacement.club, position });
    }
  }

  return { updatedSquads: squads, incomings, outgoings };
}
