const LEAGUE_AVG_RATING = 75;
// Exponent amplifies rating differences so elite clubs dominate properly.
// At 2.5: Man City (avg ~86) → 1.40×, Ipswich (avg ~71) → 0.87× — a 61% gap vs 20% without it.
const STRENGTH_EXP = 2.5;

// Blend overall (fatigue-adjusted) with position-specific attributes.
// Falls back to overall when attributes are absent (mock data / legacy).
function fwdRating(p) {
  if (p.fin == null) return p.overall;
  return p.overall * 0.40 + p.fin * 0.35 + (p.sho ?? p.overall) * 0.15 + (p.pac ?? p.overall) * 0.10;
}

function defRating(p) {
  if (p.def == null) return p.overall;
  return p.overall * 0.45 + p.def * 0.35 + (p.phy ?? p.overall) * 0.20;
}

export function squadStrength(players) {
  const byPos = { GK: [], DEF: [], MID: [], FWD: [] };
  players.forEach(p => { if (byPos[p.position]) byPos[p.position].push(p); });

  const avg = (arr, fn) =>
    arr.length ? arr.reduce((s, p) => s + fn(p), 0) / arr.length : LEAGUE_AVG_RATING;

  const gkAvg  = avg(byPos.GK,  p => p.overall);
  const defAvg = avg(byPos.DEF, defRating);
  const midAvg = avg(byPos.MID, p => p.overall);
  const fwdAvg = avg(byPos.FWD, fwdRating);

  const rawAttack  = fwdAvg * 0.65 + midAvg * 0.35;
  const rawDefense = defAvg * 0.70 + gkAvg  * 0.30;

  return {
    attack:  (rawAttack  / LEAGUE_AVG_RATING) ** STRENGTH_EXP,
    defense: (rawDefense / LEAGUE_AVG_RATING) ** STRENGTH_EXP,
  };
}
