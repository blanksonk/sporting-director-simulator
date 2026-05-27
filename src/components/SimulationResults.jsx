import { useState, useEffect, useRef } from 'react';
import { resolveTransferChain } from '../utils/transfers.js';
import { simulateSeason, runProjectedOutlook } from '../utils/simulation.js';
import { CLUB_COLORS } from '../data/budgets.js';
import { CLUB_LOGOS, CLUB_EMOJI } from '../data/clubLogos.js';
import { pName, pPos } from '../utils/playerName.js';
import { saveSession } from '../lib/saveSession.js';

const TABS = ['Overview', 'Season Stats', 'My Matches', 'Transfer Window'];

function fmt(v) {
  if (!v) return '£0';
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  return `£${(v / 1_000).toFixed(0)}K`;
}

function zoneStrip(pos) {
  if (pos === 1)  return '#f59e0b';
  if (pos <= 4)   return '#3b82f6';
  if (pos <= 6)   return '#f97316';
  if (pos >= 18)  return '#ef4444';
  return null;
}

function ordinal(n) {
  if (n === 11 || n === 12 || n === 13) return `${n}th`;
  const r = n % 10;
  return `${n}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`;
}

function ClubLogo({ club, size = 6 }) {
  const [failed, setFailed] = useState(false);
  const logo = CLUB_LOGOS[club];
  const emoji = CLUB_EMOJI[club] ?? '⚽';
  const px = { 4: 'w-4 h-4', 5: 'w-5 h-5', 6: 'w-6 h-6', 7: 'w-7 h-7', 8: 'w-8 h-8', 10: 'w-10 h-10' }[size] ?? `w-${size} h-${size}`;
  if (!logo || failed) return <span className="text-base leading-none">{emoji}</span>;
  return (
    <div className={`${px} bg-white rounded p-0.5 flex items-center justify-center shrink-0`}>
      <img src={logo} alt={club} className="w-full h-full object-contain"
        onError={() => setFailed(true)} />
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
      <div className="text-3xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-white">{label}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function TransferClubCard({ club, ins, outs, isUser, color }) {
  const [open, setOpen] = useState(isUser);
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
      style={isUser ? { borderLeftWidth: 3, borderLeftColor: color } : {}}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <ClubLogo club={club} size={5} />
          <span className="font-bold text-sm" style={{ color: isUser ? color : '#e5e7eb' }}>
            {club}{isUser ? ' (You)' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {ins.length > 0 && <span className="text-emerald-400 font-semibold">+{ins.length} in</span>}
          {outs.length > 0 && <span className="text-red-400 font-semibold">-{outs.length} out</span>}
          <span className="text-gray-600">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-2 divide-x divide-gray-800 border-t border-gray-800">
          <div className="px-4 py-3 min-h-[60px]">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">In</div>
            {ins.length === 0
              ? <p className="text-xs text-gray-600 italic">None</p>
              : ins.map((p, i) => (
                <div key={p.id ?? i} className="text-xs text-gray-300 py-0.5 flex items-center gap-1">
                  <span className="text-emerald-500">+</span>
                  <span className="font-semibold">{pName(p)}</span>
                  <span className="text-gray-600 text-[10px]">{pPos(p)} · {p.overall}</span>
                </div>
              ))
            }
          </div>
          <div className="px-4 py-3 min-h-[60px]">
            <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Out</div>
            {outs.length === 0
              ? <p className="text-xs text-gray-600 italic">None</p>
              : outs.map((p, i) => (
                <div key={p.id ?? i} className="text-xs text-gray-300 py-0.5 flex items-center gap-1">
                  <span className="text-red-500">−</span>
                  <span className="font-semibold">{pName(p)}</span>
                  <span className="text-gray-600 text-[10px]">{pPos(p)} · {p.overall}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function BarStat({ label, pct, color, note }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%{note ? ` · ${note}` : ''}</span>
      </div>
      <div className="bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(100,pct)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function SimulationResults({ club, squad, allPlayers, transfers, formation, lineup, roles, username, startingBudget, budgetRemaining, resolvedData, simulationResults, onPlayAgain, onLeaderboard }) {
  const [tab, setTab]       = useState('Overview');
  const [results, setResults] = useState(null);
  const [outlook, setOutlook] = useState(null);
  const [leagueTransfers, setLeagueTransfers] = useState(null);
  const [loading, setLoading] = useState(true);
  const color   = CLUB_COLORS[club] ?? '#10b981';
  const didRun  = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    setTimeout(() => {
      // Use pre-resolved chain if available (from TransferChainAnimation), else recompute
      const { updatedSquads, incomings, outgoings } = resolvedData
        ?? resolveTransferChain(allPlayers, squad, club, transfers.bought, transfers.sold);
      // Use pre-computed season result from SeasonAnimation if available, else recompute
      const season = simulationResults
        ?? simulateSeason(updatedSquads, club, roles);
      const proj   = runProjectedOutlook(updatedSquads, club, roles, 1000);
      setResults(season);
      setOutlook(proj);
      const clubList = [...incomings.keys()];
      const summary = clubList
        .map(c => ({ club: c, in: incomings.get(c) ?? [], out: outgoings.get(c) ?? [] }))
        .filter(r => r.in.length > 0 || r.out.length > 0)
        .sort((a, b) => {
          if (a.club === club) return -1;
          if (b.club === club) return 1;
          return (b.in.length + b.out.length) - (a.in.length + a.out.length);
        });
      setLeagueTransfers(summary);
      setLoading(false);
      saveSession({ username, club, results: season, transfers, formation, startingBudget, budgetRemaining });
    }, 60);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${color}30`, borderTopColor: color }} />
        <div className="text-gray-400 text-sm">Simulating season…</div>
      </div>
    );
  }

  const { table, userFixtures, leagueTopScorers, leagueTopAssisters, userStats } = results;
  const userRow = table.find(r => r.club === club);
  const userStatsArr  = Object.values(userStats);
  const myTopScorer   = [...userStatsArr].sort((a, b) => b.goals   - a.goals   || b.assists - a.assists)[0];
  const myTopAssister = [...userStatsArr].sort((a, b) => b.assists - a.assists || b.goals   - a.goals  )[0];
  const leagueTopScorer = leagueTopScorers[0];

  // Season record
  const wins = userFixtures.filter(f => f.userGoals > f.oppGoals).length;
  const draws = userFixtures.filter(f => f.userGoals === f.oppGoals).length;
  const losses = userFixtures.filter(f => f.userGoals < f.oppGoals).length;
  const gf = userFixtures.reduce((s, f) => s + f.userGoals, 0);
  const ga = userFixtures.reduce((s, f) => s + f.oppGoals, 0);

  const zoneColor = userRow?.position <= 4 ? '#3b82f6' : userRow?.position >= 18 ? '#ef4444' : '#10b981';
  const zoneLabel = userRow?.position <= 1 ? 'Champions 🏆'
    : userRow?.position <= 4 ? 'Champions League'
    : userRow?.position <= 6 ? 'Europa League'
    : userRow?.position >= 18 ? 'Relegated 🔻'
    : 'Mid-table';

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <ClubLogo club={club} size={8} />
            <div>
              <div className="text-xs text-gray-500 tracking-widest uppercase">Season Complete</div>
              <div className="font-black text-lg" style={{ color }}>{club}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userRow && (
              <div className="text-right">
                <div className="text-2xl font-black text-white">{ordinal(userRow.position)}</div>
                <div className="text-xs" style={{ color: zoneColor }}>{zoneLabel}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={onLeaderboard}
                className="px-4 py-2 rounded-xl border border-emerald-700/50 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors">
                🏆 Leaderboard
              </button>
              <button onClick={onPlayAgain}
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Play Again
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto flex gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { backgroundColor: `${color}25`, color, border: `1px solid ${color}50` }
                : { color: '#6b7280', border: '1px solid transparent' }
              }>{t}</button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-6">

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'Overview' && (
          <div className="space-y-6">

            {/* Season record row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Final Position" value={ordinal(userRow.position)} sub={zoneLabel} color={zoneColor} />
              <StatCard label="Points" value={userRow.pts} sub={`${wins}W ${draws}D ${losses}L`} color={color} />
              <StatCard label="Goals For" value={gf} sub={`${ga} conceded`} color="#10b981" />
              <StatCard label="Goal Diff" value={userRow.gd > 0 ? `+${userRow.gd}` : userRow.gd} sub="season" color={userRow.gd >= 0 ? '#10b981' : '#ef4444'} />
            </div>

            {/* Pre-season odds — no expected finish shown (avoids confusion with actual result) */}
            {outlook && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Pre-Season Odds</h3>
                  <span className="text-[10px] text-gray-500">Based on your squad strength</span>
                </div>
                <div className="space-y-3">
                  <BarStat label="Title chance" pct={outlook.pctTitle} color="#f59e0b" />
                  <BarStat label="Top 4 chance" pct={outlook.pctTop4}  color="#3b82f6" />
                  <BarStat label="Relegation risk" pct={outlook.pctRelegation} color="#ef4444" />
                </div>
              </div>
            )}

            {/* Top performers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* My top scorer */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Your Top Scorer</div>
                {myTopScorer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ backgroundColor: `${color}25`, color }}>{myTopScorer.goals}</div>
                    <div>
                      <div className="font-bold text-white">{pName(myTopScorer.player)}</div>
                      <div className="text-xs text-gray-400">{myTopScorer.goals} goals · {myTopScorer.assists} assists</div>
                    </div>
                  </div>
                ) : <p className="text-gray-500 text-sm">No goals scored</p>}
              </div>

              {/* My top assister */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Your Top Assister</div>
                {myTopAssister ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ backgroundColor: `${color}25`, color }}>{myTopAssister.assists}</div>
                    <div>
                      <div className="font-bold text-white">{pName(myTopAssister.player)}</div>
                      <div className="text-xs text-gray-400">{myTopAssister.assists} assists · {myTopAssister.goals} goals</div>
                    </div>
                  </div>
                ) : <p className="text-gray-500 text-sm">No assists recorded</p>}
              </div>

              {/* League top scorer */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">League Golden Boot</div>
                {leagueTopScorer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black bg-yellow-400/20 text-yellow-400">
                      {leagueTopScorer.goals}
                    </div>
                    <div>
                      <div className="font-bold text-white">{pName(leagueTopScorer.player)}</div>
                      <div className="text-xs text-gray-400">{leagueTopScorer.club} · {leagueTopScorer.goals} goals</div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Transfers summary */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="text-xs font-black text-gray-500 uppercase tracking-widest px-4 pt-4 pb-2">Transfer Window</div>
                {transfers.bought.length === 0 && transfers.sold.length === 0 && (transfers.rejected || []).length === 0 ? (
                  <p className="text-gray-500 text-sm px-4 pb-4">No transfer activity</p>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {transfers.bought.length > 0 && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">In</div>
                        {transfers.bought.map(p => (
                          <div key={p.id} className="text-xs text-gray-300 py-0.5">
                            <span className="text-emerald-500 mr-1">+</span>{pName(p)} <span className="text-gray-600">{pPos(p)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {transfers.sold.length > 0 && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1.5">Out</div>
                        {transfers.sold.map(p => (
                          <div key={p.id} className="text-xs text-gray-300 py-0.5">
                            <span className="text-red-500 mr-1">−</span>{pName(p)} <span className="text-gray-600">{pPos(p)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(transfers.rejected || []).length > 0 && (
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Rejected Your Approach</div>
                        {(transfers.rejected || []).map(p => (
                          <div key={p.id} className="text-xs text-gray-600 py-0.5">
                            <span className="mr-1">✗</span>{pName(p)} <span className="text-gray-700">{pPos(p)} · OVR {p.overall}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: SEASON STATS
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'Season Stats' && (
          <div className="space-y-6">

            {/* League Table */}
            <div>
              <h2 className="text-base font-black text-white mb-3 uppercase tracking-wide">Final League Table</h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider py-2 bg-gray-800/40"
                  style={{ gridTemplateColumns: '4px 28px 20px 1fr 26px 26px 26px 26px 32px 32px 32px 36px' }}>
                  <span></span><span></span><span>#</span><span className="pl-1">Club</span>
                  <span className="text-center">P</span><span className="text-center">W</span>
                  <span className="text-center">D</span><span className="text-center">L</span>
                  <span className="text-center">GF</span><span className="text-center">GA</span>
                  <span className="text-center">GD</span><span className="text-center">Pts</span>
                </div>
                {table.map((row) => {
                  const isUser = row.club === club;
                  const zc = zoneStrip(row.position);
                  return (
                    <div key={row.club} className="grid items-center py-2 border-t border-gray-800/40 text-sm"
                      style={{
                        gridTemplateColumns: '4px 28px 20px 1fr 26px 26px 26px 26px 32px 32px 32px 36px',
                        backgroundColor: isUser ? `${color}12` : undefined,
                      }}>
                      {/* Zone colour strip */}
                      <div className="self-stretch" style={{ backgroundColor: zc ?? 'transparent' }} />
                      <div className="flex items-center pl-2">
                        <ClubLogo club={row.club} size={5} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: zc ?? (isUser ? color : '#6b7280') }}>{row.position}</span>
                      <span className="text-xs font-semibold truncate" style={{ color: isUser ? color : '#d1d5db' }}>
                        {row.club}{isUser ? ' ◀' : ''}
                      </span>
                      {[row.p, row.w, row.d, row.l, row.gf, row.ga].map((v, idx) => (
                        <span key={idx} className="text-center text-xs text-gray-400">{v}</span>
                      ))}
                      <span className="text-center text-xs" style={{ color: row.gd >= 0 ? '#10b981' : '#ef4444' }}>
                        {row.gd > 0 ? '+' : ''}{row.gd}
                      </span>
                      <span className="text-center text-sm font-black" style={{ color: isUser ? color : '#f3f4f6' }}>{row.pts}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span><span className="inline-block w-2 h-4 rounded-sm bg-yellow-400 mr-1.5 align-middle" />Champion</span>
                <span><span className="inline-block w-2 h-4 rounded-sm bg-blue-500 mr-1.5 align-middle" />Champions League</span>
                <span><span className="inline-block w-2 h-4 rounded-sm bg-orange-500 mr-1.5 align-middle" />Europa League</span>
                <span><span className="inline-block w-2 h-4 rounded-sm bg-red-500 mr-1.5 align-middle" />Relegation</span>
              </div>
            </div>

            {/* Top Scorers + Top Assisters side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Scorers */}
              <div>
                <h2 className="text-base font-black text-white mb-3 uppercase tracking-wide">Top Scorers</h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-800/40"
                    style={{ gridTemplateColumns: '20px 1fr 80px 40px 40px' }}>
                    <span>#</span><span>Player</span><span>Club</span>
                    <span className="text-center">⚽</span><span className="text-center">🅰</span>
                  </div>
                  {leagueTopScorers.slice(0, 20).map((s, i) => {
                    const isUser = s.club === club;
                    return (
                      <div key={s.player.id}
                        className="grid items-center px-3 py-2 border-t border-gray-800/40 text-xs"
                        style={{ gridTemplateColumns: '20px 1fr 80px 40px 40px', backgroundColor: isUser ? `${color}12` : undefined }}>
                        <span className="text-gray-500 font-bold">{i + 1}</span>
                        <span className="font-semibold truncate" style={{ color: isUser ? color : '#e5e7eb' }}>{pName(s.player)}</span>
                        <span className="text-gray-500 truncate text-[10px]">{s.club}</span>
                        <span className="text-center font-black text-white">{s.goals}</span>
                        <span className="text-center text-gray-400">{s.assists}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Assisters */}
              <div>
                <h2 className="text-base font-black text-white mb-3 uppercase tracking-wide">Top Assisters</h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-800/40"
                    style={{ gridTemplateColumns: '20px 1fr 80px 40px 40px' }}>
                    <span>#</span><span>Player</span><span>Club</span>
                    <span className="text-center">🅰</span><span className="text-center">⚽</span>
                  </div>
                  {leagueTopAssisters.slice(0, 20).map((s, i) => {
                    const isUser = s.club === club;
                    return (
                      <div key={s.player.id}
                        className="grid items-center px-3 py-2 border-t border-gray-800/40 text-xs"
                        style={{ gridTemplateColumns: '20px 1fr 80px 40px 40px', backgroundColor: isUser ? `${color}12` : undefined }}>
                        <span className="text-gray-500 font-bold">{i + 1}</span>
                        <span className="font-semibold truncate" style={{ color: isUser ? color : '#e5e7eb' }}>{pName(s.player)}</span>
                        <span className="text-gray-500 truncate text-[10px]">{s.club}</span>
                        <span className="text-center font-black text-white">{s.assists}</span>
                        <span className="text-center text-gray-400">{s.goals}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* My squad stats */}
            <div>
              <h2 className="text-base font-black text-white mb-3 uppercase tracking-wide">{club} — Player Stats</h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-800/40"
                  style={{ gridTemplateColumns: '28px 1fr 40px 36px 36px 36px 44px' }}>
                  <span>OVR</span><span>Name</span><span>POS</span>
                  <span className="text-center">⚽</span><span className="text-center">🅰</span>
                  <span className="text-center">🟨</span><span className="text-center">Saves</span>
                </div>
                {Object.values(userStats)
                  .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.player.overall - a.player.overall)
                  .map(({ player, goals, assists, yellowCards, saves }) => (
                    <div key={player.id}
                      className="grid items-center px-3 py-2 border-t border-gray-800/40 text-xs"
                      style={{ gridTemplateColumns: '28px 1fr 40px 36px 36px 36px 44px' }}>
                      <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black"
                        style={{ backgroundColor: `${color}20`, color }}>{player.overall}</span>
                      <span className="font-semibold text-white truncate">{pName(player)}</span>
                      <span className="text-gray-500 text-[10px]">{player.position}</span>
                      <span className="text-center font-bold text-white">{goals || '—'}</span>
                      <span className="text-center text-gray-400">{assists || '—'}</span>
                      <span className="text-center">{yellowCards > 0 ? <span className="text-yellow-400">{yellowCards}</span> : '—'}</span>
                      <span className="text-center text-gray-400">{player.position === 'GK' ? saves : '—'}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: TRANSFER WINDOW
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'Transfer Window' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-black text-white uppercase tracking-wide">Summer Transfer Window</h2>
              <span className="text-xs text-gray-500">{leagueTransfers?.length ?? 0} clubs active</span>
            </div>

            {(!leagueTransfers || leagueTransfers.length === 0) && (
              <div className="text-center py-16 text-gray-500">No transfer activity across the league</div>
            )}

            {leagueTransfers?.map(({ club: c, in: ins, out: outs }) => {
              const isUser = c === club;
              const cColor = CLUB_COLORS[c] ?? '#6b7280';
              return (
                <TransferClubCard key={c} club={c} ins={ins} outs={outs} isUser={isUser} color={cColor} />
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: MY MATCHES
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'My Matches' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-white uppercase tracking-wide">My 38 Matches</h2>
              <div className="text-sm text-gray-500">
                <span className="text-white font-bold">{wins}W</span> {draws}D {losses}L
                <span className="ml-3 text-white font-bold">{gf}</span> scored
                <span className="ml-1 text-gray-500">/ {ga} conceded</span>
              </div>
            </div>

            {userFixtures.map((fixture, i) => {
              const won  = fixture.userGoals > fixture.oppGoals;
              const drew = fixture.userGoals === fixture.oppGoals;
              const resultColor = won ? '#10b981' : drew ? '#f59e0b' : '#ef4444';
              const resultLabel = won ? 'W' : drew ? 'D' : 'L';

              const myScorers   = fixture.events.filter(e => e.scorer).map(e => `${pName(e.scorer).split(' ').pop()} ${e.minute}'`);
              const oppScorers  = fixture.oppEvents.filter(e => e.scorer).map(e => `${pName(e.scorer).split(' ').pop()} ${e.minute}'`);

              return (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: resultColor }}>
                  <div className="flex items-center gap-3">
                    {/* Result badge */}
                    <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-black"
                      style={{ backgroundColor: `${resultColor}25`, color: resultColor }}>{resultLabel}</div>

                    {/* Home team */}
                    <div className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className={`text-xs font-semibold ${fixture.isHome ? 'text-white' : 'text-gray-400'}`}>
                        {fixture.home}
                      </span>
                      <ClubLogo club={fixture.home} size={4} />
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 font-black text-white text-sm px-3 py-1 bg-gray-800 rounded">
                      {fixture.homeGoals}–{fixture.awayGoals}
                    </div>

                    {/* Away team */}
                    <div className="flex items-center gap-1.5 flex-1">
                      <ClubLogo club={fixture.away} size={4} />
                      <span className={`text-xs font-semibold ${!fixture.isHome ? 'text-white' : 'text-gray-400'}`}>
                        {fixture.away}
                      </span>
                    </div>

                    {/* Matchweek */}
                    <div className="text-[10px] text-gray-600 flex-shrink-0 w-8 text-right">MW{fixture.matchweek}</div>
                  </div>

                  {/* Scorers */}
                  {(myScorers.length > 0 || oppScorers.length > 0) && (
                    <div className="mt-1.5 flex gap-4 text-[10px] text-gray-500 pl-9">
                      {fixture.isHome
                        ? <><span className="text-gray-400">{myScorers.join(', ')}</span>{oppScorers.length > 0 && <span>{oppScorers.join(', ')}</span>}</>
                        : <><span>{oppScorers.join(', ')}</span>{myScorers.length > 0 && <span className="text-gray-400">{myScorers.join(', ')}</span>}</>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
