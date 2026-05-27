// Club tiers: 1=elite, 2=strong, 3=mid, 4=lower
export const CLUB_TIER = {
  'Manchester City':   1,
  'Chelsea':           1,
  'Liverpool':         1,
  'Arsenal':           1,
  'Manchester United': 1,
  'Tottenham Hotspur': 2,
  'Newcastle United':  2,
  'Aston Villa':       2,
  'Brighton':          3,
  'Fulham':            3,
  'Everton':           3,
  'Crystal Palace':    3,
  'Brentford':         3,
  'Nottingham Forest': 3,
  'Bournemouth':       4,
  'Leeds United':      4,
  'Ipswich Town':      4,
  'Sunderland':        4,
  'Coventry City':     4,
  'Hull City':         4,
};

const EXPECTED_POSITION = {
  'Manchester City':   1,
  'Chelsea':           2,
  'Liverpool':         3,
  'Arsenal':           4,
  'Manchester United': 5,
  'Tottenham Hotspur': 6,
  'Newcastle United':  7,
  'Aston Villa':       8,
  'Brighton':          10,
  'Fulham':            12,
  'Everton':           13,
  'Crystal Palace':    14,
  'Brentford':         14,
  'Nottingham Forest': 14,
  'Bournemouth':       15,
  'Ipswich Town':      16,
  'Leeds United':      16,
  'Sunderland':        18,
  'Coventry City':     18,
  'Hull City':         19,
};

export function getClubTier(club) {
  return CLUB_TIER[club] ?? 3;
}

export function getExpectedPosition(club) {
  return EXPECTED_POSITION[club] ?? 15;
}

// Score: 0–1000. Polynomial combination of 8 normalized components (weights sum to 1.0).
// Tier 1 club winning with strong stats ≈ 750–800. Only tier 4 winning all-out can approach 1000.
export function calcDirectorScore({
  club, finalPosition, startingBudget, budgetRemaining,
  wins = 0, goalsFor = 0, goalsAgainst = 0,
  squadBalance = 0,  // 0–1: how well all position lines are covered
  sponsorBonus = 0,  // raw bonus £ from sponsor (0, 5M, 15M, or 30M)
}) {
  const expected = getExpectedPosition(club);
  const tier = getClubTier(club);

  // ── Normalize each input to 0–1 ──────────────────────────────────────────

  const p = (21 - finalPosition) / 20;

  const overperfFrac = Math.min(Math.max(0, expected - finalPosition) / Math.max(expected - 1, 1), 1);
  const tierBonus = (tier - 1) / 3; // tier1=0  tier2=0.33  tier3=0.67  tier4=1.0
  const u = overperfFrac * tierBonus;

  const a  = Math.min(Math.max(0, (goalsFor - 30)    / 60), 1); // 30 gf=0, 90 gf=1
  const d  = Math.min(Math.max(0, (80 - goalsAgainst) / 60), 1); // 80 ga=0, 20 ga=1
  const w  = Math.min(wins / 38, 1);
  const b  = startingBudget > 0 ? Math.max(0, Math.min(budgetRemaining / startingBudget, 1)) : 0;
  const sq = Math.min(Math.max(0, squadBalance), 1);
  const sp = Math.min(sponsorBonus / 30_000_000, 1); // max sponsor bonus is 30M

  // ── Polynomial combination ────────────────────────────────────────────────
  // Exponents create curves so every decimal difference in inputs shifts the score.
  const score = 1000 * (
    0.50 * Math.pow(p,  1.10)  // position — dominates, slight upward curve
    + 0.13 * u                  // underdog/difficulty — linear (already compound)
    + 0.09 * Math.pow(a,  1.50) // attack flair — convex, hard to max
    + 0.09 * Math.pow(d,  1.50) // defensive solidity — convex, hard to max
    + 0.06 * Math.pow(w,  1.20) // win rate
    + 0.05 * Math.pow(sq, 0.80) // squad balance — concave, rewards even a decent setup
    + 0.04 * Math.pow(sp, 0.70) // sponsor tier — concave, any sponsor beats none
    + 0.04 * b                   // budget efficiency — linear
  );

  return Math.round(score);
}

// Returns 0–1 based on how well all 4 position lines are covered in the squad
export function calcSquadBalance(squad) {
  if (!squad || squad.length === 0) return 0;
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  squad.forEach(p => { if (counts[p.position] != null) counts[p.position]++; });
  const gkFrac  = Math.min(counts.GK  / 2, 1); // target: 2 GKs
  const defFrac = Math.min(counts.DEF / 6, 1); // target: 6 DEFs
  const midFrac = Math.min(counts.MID / 6, 1); // target: 6 MIDs
  const fwdFrac = Math.min(counts.FWD / 4, 1); // target: 4 FWDs
  return (gkFrac + defFrac + midFrac + fwdFrac) / 4;
}

// ─── Comment bank ────────────────────────────────────────────────────────────
// Keyed by [tier][zone]: tier 1-4, zone: champion/ucl/uel/mid/relegated

const COMMENTS = {
  1: {
    champion: [
      "Oh wow, you took the most expensive squad in the country and they won things. Groundbreaking stuff.",
      "Revolutionary. Absolutely revolutionary. Put world-class players on a pitch and they performed well. No one saw that coming.",
      "Crack the champagne. You had a billion-pound squad and somehow didn't bottle it. Fair enough.",
      "Tactics king right here. Gave the most expensive players in the league the ball and let them get on with it. Inspired.",
      "Champions. With THAT squad. I'd say you earned it but let's be honest with ourselves.",
      "Oh, the league title, is it? With that wage bill? Couldn't have done it without you, chief.",
      "Won the league with the biggest budget in the game. Peak sporting director behaviour right there.",
      "Title secured. You absolute fraud. Still, well played I suppose. Just.",
      "Oh, champions again. How terribly unexpected. Please, tell us your secrets.",
      "The title! With a squad that costs more than most national GDPs! Whoever could've predicted it.",
    ],
    ucl: [
      "Top four with that squad. Could've been worse. Could've been much better, to be fair.",
      "Champions League football secured. The board expected first. You gave them fourth. Sleep with one eye open.",
      "Technically a success. Morally? We both know what this is.",
      "You had the budget of a small nation and managed top four. The chairman is fuming.",
      "Champions League with that wage bill. I'd say congrats but this was the bare minimum, mate.",
      "Top four. With those players. Honestly a bit embarrassing but the UEFA cheque helps.",
      "Champions League football. Your board is quietly devastated but smiling for the cameras.",
      "Second? Third? Still top four though. Didn't fall flat on your face entirely.",
      "The transfer committee spent a quarter billion and you've scraped into the Champions League. Bravo.",
      "Not the title, but Champions League. The fans expected more. The press will be unkind.",
    ],
    uel: [
      "Europa League. With that squad. Mate, that's impressive in the worst possible way.",
      "Congratulations, you've qualified for Thursday night football in Andorra. Really well done.",
      "The squad cost more than most countries' GDP and you've got Europa League. Inspired.",
      "Europa League nights await. The away trips to Villarreal will be lovely this time of year.",
      "Sixth place. The board is doing the 'we back the manager' press conference as we speak. Ominous.",
      "Spent half a billion and got Europa League. I won't say it's a disaster. But it is a disaster.",
      "Europa League football. Your replacement has already been lined up, hasn't he.",
      "With Chelsea's budget and Europa League football, you've somehow made everyone angry at once.",
      "The squad that was built to dominate, doing Thursday nights in Portugal. Beautiful.",
      "Europa League. Sixth. With that lot. I genuinely don't know whether to laugh or call someone.",
    ],
    mid: [
      "Mid-table with that squad. That's not management, that's performance art.",
      "You had the whole garden and chose to sit in the worst corner of it.",
      "Absolutely staggering. You've somehow made a world-class squad look very, very ordinary.",
      "Mid-table finish. Safe to say your contract won't be renewed. Or your reputation.",
      "You had the keys to the Ferrari and managed a comfortable mid-table plod. Bravo.",
      "The chairman has gone very quiet. That's never good.",
      "You spent more on one player than most clubs spend in a decade and finished mid-table. Outstanding.",
      "Mid-table. With that squad. You absolute fraud.",
      "Somewhere in the table where no one is happy and no one is sacked. Yet.",
      "The fans are doing 'he had to go' chants in the car park. With that squad. Remarkable.",
    ],
    relegated: [
      "You've relegated Manchester City. I genuinely think you've broken football.",
      "What. Have. You. Done.",
      "I don't know what happened here and frankly I'm not sure I want to.",
      "That squad. Relegated. In a simulation. Please stay away from real football clubs forever.",
      "The board, the fans, the players — everyone in England is staring at you right now.",
      "You had the league's best players and sent them to the Championship. Unbelievable scenes.",
      "History books will record this as one of sport's great disasters. Congratulations.",
      "Relegated with that budget. I'm actually impressed. Not in a good way.",
      "The press conference will be something to behold. What do you even say?",
      "Championship football awaits. With a squad built to win Europe. Stunning.",
    ],
  },

  2: {
    champion: [
      "Newcastle United, champions of England. Genuinely thought I'd never see the day.",
      "Tottenham winning the title? I need a sit-down.",
      "Villa are champions! Mate, that's actually brilliant. Well in.",
      "You took a top-half club and dragged it to the summit. Serious football mind at work here.",
      "The Premier League title. With THAT lot. Incredible.",
      "Champions. With a mid-tier squad. Legitimately impressive and I don't say that often.",
      "Absolute class. Took a squad that had no business winning the league and made it happen.",
      "Champions of England. The whole country is baffled. In a good way.",
      "Right, fair enough, that is genuinely impressive. Don't let it go to your head.",
      "League title secured. You've done something special here. Now don't ruin it.",
    ],
    ucl: [
      "Champions League football secured. That's a proper result for a club this size.",
      "Top four with that squad is no small feat. Credit where it's due.",
      "Champions League nights! The fans are buzzing. Well deserved.",
      "That's a Champions League finish with far less resources than the big boys. Impressive stuff.",
      "Top four with Newcastle. That's the kind of result that keeps you in a job for decades.",
      "Right, that's genuinely good management. Top four was not guaranteed with that squad.",
      "Champions League! The board is absolutely delighted. You've overdelivered.",
      "Top four from a squad that cost a fraction of the top clubs. Solid work.",
      "That's a Champions League finish and you should be proud. Legitimately.",
      "Top four. Not flashy, not lucky. Just good management. Well done.",
    ],
    uel: [
      "Europa League! Could've been worse, could've been better.",
      "Sixth place, Europa League football. The board expected top four but you'll do for now.",
      "Europa League secured. Thursday nights beckon. The fans are alright with it.",
      "Top six with that squad is actually a decent return. Don't undersell it.",
      "Not bad. Not brilliant. Europa League is the definition of 'fine, I suppose'.",
      "Sixth place. The fans wanted more but they'll take European football.",
      "Europa League certified. It's not glory but it's not embarrassing either.",
      "Qualified for Europe with a mid-table budget. That's a decent season's work.",
      "Top six, European football. Given what you had to work with, fair play.",
      "Europa League. The chairman wanted top four but he's shaking your hand anyway.",
    ],
    mid: [
      "Mid-table. With Tottenham. This is basically tradition at this point.",
      "Somewhere in the middle where nobody is happy and nobody is sacked. Proper football management.",
      "Ten wins, some draws, some losses. Deeply unremarkable. Well done.",
      "The board expected better. The fans expected better. But here we are.",
      "Not relegated, not European, just floating in the middle. Like always. Like forever.",
      "Mid-table with a squad that should've done more. The chairman wants a word.",
      "You've managed average with an above-average club. Impressive in its own quiet way.",
      "The fans are not furious. They're just... disappointed. Which is worse, honestly.",
      "Mid-table football. Safe. Unremarkable. The story of the season.",
      "A comfortable mid-table finish. The chairman will be renewing your contract. Probably.",
    ],
    relegated: [
      "You've relegated Newcastle. The Toon Army wants a very serious word with you.",
      "Tottenham relegated? That's new even for Tottenham.",
      "Aston Villa going down. The board hasn't left the building. Bad sign.",
      "With that squad you've managed relegation. Genuinely one for the history books.",
      "Championship football awaits. It'll be a learning experience. A painful one.",
      "Down with a squad that should've comfortably stayed up. Rough.",
      "The press are calling it the great collapse. They're not wrong.",
      "Relegated with a strong squad. That takes real effort. Not the good kind.",
      "The chairman's statement will be out by Monday. It won't be kind.",
      "Championship football. With a Premier League squad. Absolutely baffling.",
    ],
  },

  3: {
    champion: [
      "You took Brighton to the title and I will never doubt you again.",
      "CHAMPIONS. With Everton. I've seen everything now.",
      "That's a genuine tactical masterclass. That squad had no right winning this league.",
      "Mate. MATE. That is absolutely extraordinary. Put the phone down, Guardiola's calling.",
      "I'm going to need a moment. That was proper football management.",
      "The whole country is baffled. Brighton, champions. Incredible.",
      "Crystal Palace, champions. Words fail me. Truly.",
      "You've done what Premier League managers spend careers failing to do with far bigger clubs.",
      "That's one of the greatest achievements in the history of this simulation. Possibly any simulation.",
      "Forest winning the league again. It's been a while. Fifty-odd years, give or take.",
    ],
    ucl: [
      "Top four with Brighton! Absolutely phenomenal. That's proper overachievement.",
      "Champions League football for Everton! Unbelievable scenes at Goodison.",
      "That is some serious overachievement. Top four with a mid-table squad. Immense.",
      "The Champions League! With THAT budget! Remarkable.",
      "Top four with Crystal Palace is the kind of thing that gets statues built. Seriously.",
      "Champions League for Brentford! The football gods are having a day.",
      "That's legitimately impressive. Top four with a squad that had no business being there.",
      "You've punched so far above your weight you've broken the scales.",
      "Honestly mate, that deserves proper recognition. Top four with that lot is no fluke.",
      "Right, I take back everything I've ever thought. That is brilliant management.",
    ],
    uel: [
      "Europa League football! Well above what was expected. Solid work.",
      "Top six! That's a brilliant season for a club this size.",
      "Europa League secured. The board are absolutely delighted. You've exceeded expectations.",
      "Sixth place. For a club like this, that's an achievement worth celebrating.",
      "Europa nights await. That's genuinely impressive management with limited resources.",
      "Top six with a mid-table squad. The fans are buzzing. The board is buzzing.",
      "You've punched above your weight and got into Europe. That's a proper season.",
      "Europa League football. With that squad. Legitimately impressive.",
      "Sixth place finish. The chairman is very happy. Contract extension incoming.",
      "Top six! Well above what was expected. Take a bow.",
    ],
    mid: [
      "Mid-table. About what was expected. Safe, unremarkable, fine.",
      "Nothing to write home about but nothing to be ashamed of either.",
      "Job done. The club is exactly where most people thought it would be.",
      "Secured your status, nothing more. The chairman is mildly satisfied. High praise.",
      "You've managed a mid-table finish with a mid-table club. The circle of life.",
      "Tenth place. The fans are neither excited nor angry. A profound achievement in itself.",
      "Mid-table security. The board wanted survival and they got survival and a bit more.",
      "A quiet, unremarkable, perfectly adequate season. The definition of fine.",
      "Safe. Stable. Unspectacular. Exactly what was needed.",
      "Mid-table. The fans would like more next season. Won't they always.",
    ],
    relegated: [
      "Relegated with a squad that should've stayed up comfortably. The board is not pleased.",
      "Championship football awaits. The chairman has some questions for you.",
      "Went down with a squad that should've been comfortable in this league. Rough season.",
      "Relegated. The statement from the chairman is incoming and it won't be warm.",
      "Down to the Championship. You'll bounce back. Probably. Maybe.",
      "That was a tough watch. The relegation scraps are never pretty.",
      "Down. The squad wasn't elite but it was good enough to stay up. In theory.",
      "Relegated with what you had. The fans are gutted. So is everyone, really.",
      "Championship football. Not what anyone wanted but here we are.",
      "Down. Sometimes the season just gets away from you. This was one of those times.",
    ],
  },

  4: {
    champion: [
      "Hull City, CHAMPIONS OF ENGLAND. I'm not crying, you're crying.",
      "Sunderland won the league. I need to sit down. I need a drink. I need both.",
      "That is the single greatest sporting achievement I've witnessed in this or any simulation.",
      "You took a relegation-threatened club and won the Premier League. Please manage a real team. Immediately.",
      "Coventry City, champions. I genuinely cannot process this information.",
      "Mate, that's not football management, that's sorcery. Mourinho is taking notes.",
      "LEAGUE CHAMPIONS. With that squad. That budget. Those expectations. Extraordinary.",
      "The title! From Hull! This will be talked about for years in this household.",
      "I'm going to frame this result and hang it on my wall. Absolutely unbelievable.",
      "That is generational talent on the touchline. You've done something truly historic here.",
    ],
    ucl: [
      "Top four with a newly promoted club? That's the stuff of football fairy tales.",
      "Champions League football for Sunderland. The whole city is in tears. Good tears.",
      "That is genuinely one of the great overachievements in football management, real or simulated.",
      "Top four. With THAT squad. With THAT budget. I'm in absolute shock.",
      "You've punched up three weight classes and won. Incredible.",
      "Champions League from the bottom of the food chain. Absolutely historic.",
      "Hull City going to the Champions League. The universe is done.",
      "Top four with Coventry is more impressive than winning it with Man City. Full stop.",
      "Legitimately gobsmacked. Champions League football. From THERE. Brilliant.",
      "That's the kind of result that gets books written about it. Possibly films.",
    ],
    uel: [
      "Europa League for a club tipped for relegation! That's an absolute triumph.",
      "Sixth place from a relegation-battling squad. That's remarkable management.",
      "Europa League football, and this club should've been fighting to stay up. Stunning.",
      "Top six from nothing. Take a bow. You've genuinely earned every bit of this.",
      "The gaffer delivers Europe! With a squad that cost less than one Man City player!",
      "Europa League! From Hull! Scenes. Absolute scenes.",
      "A top-six finish with that squad. Not being sarcastic for once. That's elite-level work.",
      "You've turned relegation fodder into a European side. Genuinely brilliant.",
      "Europa League certified underdog story. Fairytale stuff.",
      "Sixth place from a squad that had no right being in this league. Outstanding.",
    ],
    mid: [
      "Mid-table finish. For a club like this, that's perfectly respectable.",
      "Survived comfortably in mid-table. Exactly what the board was hoping for.",
      "Nothing to shout about but everything to be satisfied with. Job done.",
      "The fans wanted survival. You gave them survival and a bit more. Champions in their hearts.",
      "Mid-table security. That's a win for a newly promoted side.",
      "Comfortable mid-table. For this club, that's a genuinely solid season's work.",
      "You've stabilised a club that was expected to fall apart. Quietly impressive.",
      "Kept your head above water nicely. Textbook lower-club management.",
      "Safe and secure in mid-table. The fans are relieved. The board is relieved. Everyone's relieved.",
      "Mid-table from a squad most people thought would be relegated. That's a result.",
    ],
    relegated: [
      "Relegated. Was always going to be tough with that squad.",
      "Down you go. The Championship awaits. Don't panic. Regroup.",
      "Relegated. Absolutely gutting but the odds were stacked against you from the off.",
      "Back to the Championship. The board is disappointed but they probably saw this coming.",
      "Down. The squad was always up against it. Take a breath and try again.",
      "Championship bound. You gave it a go with what you had. Fair enough.",
      "Relegated after a tough season. Could've gone either way right up until the end.",
      "Down. The squad was never built for Premier League survival. These things happen.",
      "Relegated. Listen, you took a massive punt and it didn't pay off. That's football.",
      "Down to the Championship. The finances will hurt but the fans still love you.",
    ],
  },
};

function positionToZone(pos) {
  if (pos === 1)  return 'champion';
  if (pos <= 4)   return 'ucl';
  if (pos <= 6)   return 'uel';
  if (pos >= 18)  return 'relegated';
  return 'mid';
}

// Deterministic pick so the same result always gets the same comment
function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

export function getDirectorComment({ club, finalPosition, startingBudget, budgetRemaining }) {
  const tier = getClubTier(club);
  const zone = positionToZone(finalPosition);
  const pool = COMMENTS[tier]?.[zone] ?? COMMENTS[3].mid;
  const seed = finalPosition * 13 + tier * 7 + Math.floor((budgetRemaining ?? 0) / 1_000_000);
  return pick(pool, seed);
}
