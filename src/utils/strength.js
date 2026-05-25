const LEAGUE_AVG_RATING = 75;
// Exponent amplifies rating differences so elite clubs dominate properly.
// At 2.5: Man City (avg ~86) → 1.40×, Ipswich (avg ~71) → 0.87× — a 61% gap vs 20% without it.
const STRENGTH_EXP = 2.5;

export function squadStrength(players) {
  const byPos = { GK: [], DEF: [], MID: [], FWD: [] };
  players.forEach(p => { if (byPos[p.position]) byPos[p.position].push(p.overall); });

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : LEAGUE_AVG_RATING;

  const gkAvg  = avg(byPos.GK);
  const defAvg = avg(byPos.DEF);
  const midAvg = avg(byPos.MID);
  const fwdAvg = avg(byPos.FWD);

  const rawAttack  = fwdAvg * 0.65 + midAvg * 0.35;
  const rawDefense = defAvg * 0.70 + gkAvg  * 0.30;

  return {
    attack:  (rawAttack  / LEAGUE_AVG_RATING) ** STRENGTH_EXP,
    defense: (rawDefense / LEAGUE_AVG_RATING) ** STRENGTH_EXP,
  };
}
