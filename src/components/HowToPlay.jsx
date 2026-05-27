import { useState } from 'react';

const TABS = ['How to Play', 'Director Score', 'Simulation'];

const CLUB_TIERS = [
  { tier: 1, label: 'Elite', clubs: 'Man City, Chelsea, Liverpool, Arsenal, Man Utd', expected: 'Title / top 2', multiplier: '0×' },
  { tier: 2, label: 'Strong', clubs: 'Tottenham, Newcastle, Aston Villa', expected: 'Top 6–8', multiplier: '0.33×' },
  { tier: 3, label: 'Mid', clubs: 'Brighton, Fulham, Everton, Crystal Palace, Brentford, Nottm Forest', expected: 'Top 10–14', multiplier: '0.67×' },
  { tier: 4, label: 'Lower', clubs: 'Bournemouth, Leeds, Ipswich, Sunderland, Coventry, Hull', expected: 'Survival / relegation battle', multiplier: '1.0×' },
];

export default function HowToPlay({ onClose }) {
  const [tab, setTab] = useState('How to Play');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-2xl bg-[#141720] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <div className="text-xs text-gray-500 tracking-widest uppercase">Guide</div>
            <div className="font-black text-lg text-emerald-400">About the Game</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-gray-800 pb-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2"
              style={tab === t
                ? { color: '#10b981', borderColor: '#10b981', backgroundColor: '#10b98110' }
                : { color: '#6b7280', borderColor: 'transparent' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[65vh] px-6 py-5 space-y-6 text-sm text-gray-300 leading-relaxed">

          {/* ── HOW TO PLAY ─────────────────────────────────────────────── */}
          {tab === 'How to Play' && (
            <>
              <section>
                <h3 className="font-black text-white mb-2">What is a Sporting Director?</h3>
                <p>
                  You're not the manager — you're the person above them. Your job is to build the squad: identify targets, negotiate deals, set the budget, and choose the tactical framework. Then you hand it over and watch the season unfold.
                </p>
              </section>

              <section>
                <h3 className="font-black text-white mb-3">The 5 Steps</h3>
                <ol className="space-y-3">
                  {[
                    { n: '1', label: 'Pick your club', desc: 'Choose one of the 20 Premier League clubs. Bigger clubs have higher budgets and stronger squads but less room for glory — winning the title as Man City is expected; doing it with Ipswich is legendary. Your club tier directly affects your Director Score.' },
                    { n: '2', label: 'Land a sponsor', desc: 'Pitch one of three sponsor deals. Bigger deals offer more budget but carry a lower acceptance chance. If they decline, you go into the window with your base budget only. Securing a large sponsor earns bonus Director Score points.' },
                    { n: '3', label: 'Hit the transfer market', desc: 'Buy and sell within your budget. Player attributes (pace, finishing, passing, defending, stamina) all feed into the simulation. Balance is key — a deep squad of 22–25 outperforms a tight XI of superstars over 38 games.' },
                    { n: '4', label: 'Set your tactics', desc: 'Pick a formation and assign roles (Attack / Support / Defend) to your starting XI. Roles affect how players contribute to goal-scoring and defensive output in each simulated match.' },
                    { n: '5', label: 'Simulate the season', desc: 'All 380 Premier League fixtures are simulated in one pass. Watch the table update matchweek by matchweek, then review your full stats, top scorers, and final standing.' },
                  ].map(({ n, label, desc }) => (
                    <li key={n} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                      <div><span className="font-bold text-white">{label} — </span>{desc}</div>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Tips</h3>
                <ul className="space-y-2">
                  {[
                    'Keep at least 18 players — fatigue accumulates over 38 games and your bench matters.',
                    'Cover all positions. A squad with no backup striker will run out of steam by March.',
                    "Don't blow the whole budget on one player — squad depth beats one superstar.",
                    'High-stamina players (80+) accumulate less fatigue; crucial for title pushes.',
                    'Picking a weaker club and overperforming earns significantly more Director Score.',
                    'Saving budget counts too — frugal squad-building is rewarded in the scoring.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500 shrink-0">›</span>{tip}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                <p className="text-emerald-300 text-xs">
                  <span className="font-bold">Leaderboard:</span> Your result is automatically saved when the season ends. Rankings use Director Score — not just points — so a mid-table finish with Hull can rank above a title win with Man City.
                </p>
              </section>
            </>
          )}

          {/* ── DIRECTOR SCORE ──────────────────────────────────────────── */}
          {tab === 'Director Score' && (
            <>
              <section>
                <h3 className="font-black text-white mb-2">What is the Director Score?</h3>
                <p>
                  A single 0–1000 number that measures the quality of your season relative to what was expected of your club. Winning the league with Man City is fine — winning it with Hull is historic.
                </p>
              </section>

              <section>
                <h3 className="font-black text-white mb-3">The Formula</h3>
                <p className="mb-3 text-gray-400 text-xs">All components are normalised to 0–1 and combined polynomially. Weights sum to exactly 1.0 so the theoretical max is 1000.</p>
                <div className="space-y-2">
                  {[
                    { weight: '50%', name: 'Position', desc: 'Where you finished. 1st = full marks, 20th = near zero. Uses a slight upward curve (^1.1) so the top spots are worth materially more than mid-table.' },
                    { weight: '13%', name: 'Underdog bonus', desc: 'How far above your expected position you finished, scaled by club difficulty. Tier 1 clubs earn zero underdog points no matter how well they do. Tier 4 clubs can earn the full 130 points.' },
                    { weight: '9%', name: 'Attack flair', desc: 'Goals scored vs the baseline of 30. 90+ goals = full marks. Uses a steeper curve (^1.5) — incremental goals near the top are worth more.' },
                    { weight: '9%', name: 'Defensive solidity', desc: 'Goals conceded. 20 conceded = full marks, 80+ = zero. Same steep curve as attack.' },
                    { weight: '6%', name: 'Win rate', desc: 'Fraction of games won out of 38. Rewards teams that win matches rather than grind draws.' },
                    { weight: '5%', name: 'Squad balance', desc: 'How well all four position lines (GK, DEF, MID, FWD) are covered. A team with no backup goalkeeper loses points here.' },
                    { weight: '4%', name: 'Sponsor tier', desc: 'Whether you landed a large, medium, or small sponsor deal. Bigger sponsors = more points. Concave curve (^0.7) means even a small deal is worth something.' },
                    { weight: '4%', name: 'Budget efficiency', desc: 'How much of your starting budget you didn\'t spend. Frugal directors are rewarded.' },
                  ].map(({ weight, name, desc }) => (
                    <div key={name} className="flex gap-3 bg-gray-900/40 rounded-lg px-3 py-2">
                      <span className="text-emerald-400 font-black text-xs w-8 shrink-0 mt-0.5">{weight}</span>
                      <div>
                        <span className="font-bold text-white text-xs">{name} — </span>
                        <span className="text-xs">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-black text-white mb-3">Club Tiers</h3>
                <p className="mb-3 text-xs text-gray-400">Tiers control the underdog multiplier — how much credit you get for beating expectations.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 pr-4 text-gray-500 font-semibold">Tier</th>
                        <th className="text-left py-2 pr-4 text-gray-500 font-semibold">Clubs</th>
                        <th className="text-left py-2 pr-4 text-gray-500 font-semibold">Expected</th>
                        <th className="text-right py-2 text-gray-500 font-semibold">Underdog×</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLUB_TIERS.map(row => (
                        <tr key={row.tier} className="border-b border-gray-800/40">
                          <td className="py-2 pr-4 font-bold text-white">{row.tier} — {row.label}</td>
                          <td className="py-2 pr-4 text-gray-400">{row.clubs}</td>
                          <td className="py-2 pr-4 text-gray-400">{row.expected}</td>
                          <td className="py-2 text-right font-mono text-emerald-400">{row.multiplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Example Scores</h3>
                <div className="space-y-1.5 text-xs">
                  {[
                    { scenario: 'Man City — win the title, big sponsor, lots of goals', score: '~780–800' },
                    { scenario: 'Newcastle — win the title', score: '~860–880' },
                    { scenario: 'Brighton — top 4 finish', score: '~720–750' },
                    { scenario: 'Hull City — win the title', score: '~960–1000' },
                    { scenario: 'Hull City — top 4 finish', score: '~830–860' },
                    { scenario: 'Man City — relegated', score: '~100–150' },
                  ].map(({ scenario, score }) => (
                    <div key={scenario} className="flex justify-between gap-4 bg-gray-900/40 rounded-lg px-3 py-2">
                      <span className="text-gray-300">{scenario}</span>
                      <span className="font-black text-emerald-400 shrink-0">{score}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── SIMULATION ──────────────────────────────────────────────── */}
          {tab === 'Simulation' && (
            <>
              <section>
                <h3 className="font-black text-white mb-2">The Match Engine</h3>
                <p className="mb-2">
                  Each of the 380 Premier League fixtures is simulated using a <span className="text-white font-semibold">Poisson goal model</span> inspired by the Dixon-Coles method:
                </p>
                <ol className="space-y-2 ml-2">
                  {[
                    'Each team\'s attack and defence strength is computed from squad ratings.',
                    'Expected goals for each side are calculated using the strength differential, a league-average baseline (1.36 goals per team per game), and a home advantage multiplier.',
                    'Actual goals are sampled from a Poisson distribution using those expected values.',
                    'Goal scorers and assisters are picked by weighted probability from the squad.',
                  ].map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs"><span className="text-emerald-500 shrink-0 font-bold">{i + 1}.</span>{s}</li>
                  ))}
                </ol>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Player Attributes</h3>
                <p className="mb-3 text-xs text-gray-400">Sourced from FIFA ratings. Each player carries 8 attributes that feed directly into the model:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { attr: 'fin (Finishing)', use: 'FWD scoring weight — primary goal threat' },
                    { attr: 'pac (Pace)', use: 'Bonus multiplier on finishing for fast forwards' },
                    { attr: 'sho (Shooting)', use: 'MID scoring weight' },
                    { attr: 'pas (Passing)', use: 'Assist probability (60% weight)' },
                    { attr: 'dri (Dribbling)', use: 'Assist probability (40% weight)' },
                    { attr: 'def (Defending)', use: 'DEF strength calculation' },
                    { attr: 'phy (Physic)', use: 'DEF strength calculation' },
                    { attr: 'sta (Stamina)', use: 'Fatigue rate per match' },
                  ].map(({ attr, use }) => (
                    <div key={attr} className="bg-gray-900/40 rounded-lg px-3 py-2">
                      <div className="font-mono font-bold text-emerald-400">{attr}</div>
                      <div className="text-gray-400 mt-0.5">{use}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Fatigue & Squad Depth</h3>
                <p>
                  Players accumulate fatigue across 38 matchweeks. High-stamina players (80+) gain 0.75 fatigue per match; average (60–79) gain 1.0; low (&lt;60) gain 1.25. Fatigue reduces effective strength, which is why rotating a 22–25 man squad outperforms a rigid XI over a full season.
                </p>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Squad Strength Calculation</h3>
                <p className="mb-1 text-xs text-gray-400">Attack and defence are computed separately using attribute blends:</p>
                <div className="space-y-2 text-xs font-mono bg-gray-900/40 rounded-lg px-4 py-3">
                  <div><span className="text-emerald-400">FWD rating</span> = overall×0.40 + fin×0.35 + sho×0.15 + pac×0.10</div>
                  <div><span className="text-emerald-400">DEF rating</span> = overall×0.45 + def×0.35 + phy×0.20</div>
                  <div><span className="text-gray-500 text-[10px]">MID contributes to both attack and defence</span></div>
                </div>
              </section>

              <section>
                <h3 className="font-black text-white mb-2">Transfer Chain</h3>
                <p>
                  When you buy a player, their old club needs a replacement. The simulation resolves a cascading chain: each club that loses a player automatically signs the best available free agent at that position. This mirrors how real transfer windows unfold and ensures every squad stays competitive throughout the season.
                </p>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
