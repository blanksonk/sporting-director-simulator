export default function HowToPlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#141720] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <div className="text-xs text-gray-500 tracking-widest uppercase">Guide</div>
            <div className="font-black text-lg text-emerald-400">How to Play</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-700 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[70vh] px-6 py-5 space-y-6 text-sm text-gray-300 leading-relaxed">

          {/* What is a Sporting Director */}
          <section>
            <h3 className="font-black text-white mb-2">What is a Sporting Director?</h3>
            <p>
              You&apos;re not the manager — you&apos;re the person above them. Your job is to
              build the squad: identify targets, negotiate deals, set the budget, and
              choose the tactics framework. Then you hand it over and watch the season unfold.
            </p>
          </section>

          {/* 5 steps */}
          <section>
            <h3 className="font-black text-white mb-3">The 5 Steps</h3>
            <ol className="space-y-3">
              {[
                {
                  n: '1', label: 'Pick your club',
                  desc: 'Choose one of the 20 Premier League clubs. Bigger clubs have higher budgets and stronger squads but less room for glory — winning the title as Man City is expected; doing it with Ipswich is legendary.',
                },
                {
                  n: '2', label: 'Land a sponsor',
                  desc: 'Pitch one of eight sponsor deals. Bigger deals offer more money but are harder to close — the chance percentage is the probability they accept. If they decline, you go into the transfer window with your base budget only.',
                },
                {
                  n: '3', label: 'Hit the transfer market',
                  desc: 'Buy and sell players within your budget. Every player has a price and rating. Balance is key: a deep squad of 22–25 players will outperform a tight XI of superstars over a 38-game season.',
                },
                {
                  n: '4', label: 'Set your tactics',
                  desc: 'Pick a formation and assign roles (Attack / Support / Defend) to your starting XI. Roles affect how players contribute to attack and defence in the simulation.',
                },
                {
                  n: '5', label: 'Simulate the season',
                  desc: 'Your 38-game fixture list is simulated in one shot using a statistical model. Goals, results, and the final table are generated — including player stats like goals and assists.',
                },
              ].map(({ n, label, desc }) => (
                <li key={n} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {n}
                  </span>
                  <div>
                    <span className="font-bold text-white">{label} — </span>
                    {desc}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Simulation */}
          <section>
            <h3 className="font-black text-white mb-2">How the Simulation Works</h3>
            <p className="mb-2">
              Each match uses a <span className="text-white font-semibold">Poisson goal model</span> — the expected goals for each team are
              calculated from squad strength, then actual goals are sampled randomly from that
              distribution. Home teams get a small advantage.
            </p>
            <p>
              Goal scorers are picked by weighted probability: forwards are most likely to score,
              midfielders occasionally chip in. Star players (high overall rating) score more often.
            </p>
          </section>

          {/* Tips */}
          <section>
            <h3 className="font-black text-white mb-2">Tips</h3>
            <ul className="space-y-2">
              {[
                'Keep at least 18 players — fatigue and rotation matter.',
                'Cover all positions. A squad with no backup striker will struggle.',
                'Don\'t blow the whole budget on one player — squad depth beats one superstar.',
                'The sponsor gamble is worth it on big clubs: a 30% chance at £60M often beats the safe £10M deal.',
                'Picking a weaker club and overperforming earns more respect on the leaderboard.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">›</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          {/* Leaderboard note */}
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
            <p className="text-emerald-300 text-xs">
              <span className="font-bold">Leaderboard:</span> Your result is automatically saved when the season ends.
              Rankings are based on final points, then league position. Everyone plays in the same
              2026–27 fixture calendar, so results are directly comparable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
