import { MOCK_PLAYERS, FREEAGENT_POOL } from '../data/mockPlayers.js';

const PL_CLUBS = new Set([
  'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United',
  'Tottenham Hotspur', 'Newcastle United', 'Aston Villa', 'West Ham United',
  'Brighton', 'Fulham', 'Wolves', 'Everton', 'Crystal Palace', 'Brentford',
  'Nottingham Forest', 'Bournemouth', 'Leicester City', 'Ipswich Town', 'Southampton',
]);

// Build initial squad map from all mock players
export function buildInitialSquads(allPlayers) {
  const squads = new Map();
  PL_CLUBS.forEach(club => squads.set(club, []));
  allPlayers.forEach(p => {
    if (squads.has(p.club)) squads.get(p.club).push({ ...p });
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

  // Track incomings per club
  const incomings = new Map();
  PL_CLUBS.forEach(c => incomings.set(c, []));

  // Add user's bought players to user's incomings
  boughtPlayers.forEach(p => incomings.get(userClub).push(p));

  // Pool of available replacement players (non-PL + free agents)
  const usedIds = new Set(allPlayers.map(p => p.id));
  const replacementPool = [
    ...FREEAGENT_POOL,
    ...allPlayers.filter(p => !PL_CLUBS.has(p.club)),
  ].filter(p => !usedIds.has(p.id) || !PL_CLUBS.has(p.club));

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
      queue.push({ club: replacement.club, position });
    }
  }

  return { updatedSquads: squads, incomings };
}
