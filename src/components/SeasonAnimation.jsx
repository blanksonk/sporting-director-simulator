import { useState, useEffect, useRef } from 'react';
import { resolveTransferChain } from '../utils/transfers.js';
import { simulateSeason } from '../utils/simulation.js';
import { CLUB_COLORS } from '../data/budgets.js';
import { CLUB_LOGOS, CLUB_EMOJI } from '../data/clubLogos.js';

function ClubLogo({ club, size = 5 }) {
  const [failed, setFailed] = useState(false);
  const logo = CLUB_LOGOS[club];
  const emoji = CLUB_EMOJI[club] ?? '⚽';
  const px = { 4: 'w-4 h-4', 5: 'w-5 h-5', 6: 'w-6 h-6' }[size] ?? 'w-5 h-5';
  if (!logo || failed) return <span className="text-xs leading-none">{emoji}</span>;
  return (
    <div className={`${px} bg-white rounded p-0.5 flex items-center justify-center shrink-0`}>
      <img src={logo} alt={club} className="w-full h-full object-contain" onError={() => setFailed(true)} />
    </div>
  );
}

const MW_DELAY = 2000;
const MIN_SCREEN_MS = 3000;

export default function SeasonAnimation({
  allPlayers, userSquad, club: userClub, transfers, roles, resolvedData, onComplete,
}) {
  const [phase, setPhase]     = useState('opening');
  const [shownMW, setShownMW] = useState(0);
  const resultRef             = useRef(null);
  const snapshotsRef          = useRef([]);
  const onCompleteRef         = useRef(onComplete);
  const startTimeRef          = useRef(Date.now());

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const { updatedSquads } = resolvedData
      ?? resolveTransferChain(allPlayers, userSquad, userClub, transfers.bought ?? [], transfers.sold ?? []);

    const result = simulateSeason(updatedSquads, userClub, roles);
    resultRef.current = result;
    snapshotsRef.current = result.matchweekSnapshots;
    startTimeRef.current = Date.now();

    const openTimer = setTimeout(() => {
      setPhase('active');
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setShownMW(idx);
        if (idx >= snapshotsRef.current.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('closed'), 600);
        }
      }, MW_DELAY);
      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'closed') return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_SCREEN_MS - elapsed);
    const t = setTimeout(() => onCompleteRef.current(resultRef.current), remaining);
    return () => clearTimeout(t);
  }, [phase]);

  const snapshots = snapshotsRef.current;
  const total = snapshots.length; // 38
  const currentSnap = shownMW > 0 ? snapshots[shownMW - 1] : null;
  const prevSnap    = shownMW > 1 ? snapshots[shownMW - 2] : null;
  const color = CLUB_COLORS[userClub] ?? '#10b981';

  // Build position-change map vs previous snapshot
  const prevPositions = {};
  if (prevSnap) prevSnap.tableSnapshot.forEach(r => { prevPositions[r.club] = r.position; });

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 w-full bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: phase === 'closed' ? '#6b7280' : '#ef4444',
                    animation: phase === 'closed' ? 'none' : 'pulse 1s infinite',
                  }}
                />
                <span className="text-xs font-black uppercase tracking-widest"
                  style={{ color: phase === 'closed' ? '#6b7280' : '#ef4444' }}>
                  {phase === 'closed' ? 'Season Over' : 'Live'}
                </span>
              </div>
              <div className="font-black text-white text-base">Season 2026–27</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                {shownMW > 0 ? `MW ${shownMW}` : '—'}
              </div>
              <div className="text-xs text-gray-500">of {total} matchweeks</div>
            </div>
          </div>

          {total > 0 && (
            <div className="bg-gray-800 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{ width: `${(shownMW / total) * 100}%`, backgroundColor: color }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 space-y-4">

        {/* Opening spinner */}
        {phase === 'opening' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin border-gray-700 border-t-emerald-500" />
            <p className="text-gray-400 text-sm">Simulating season…</p>
          </div>
        )}

        {phase !== 'opening' && !currentSnap && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Starting season…</p>
          </div>
        )}

        {currentSnap && (
          <>
            {/* Matchweek results */}
            <div className="animate-fade-in bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-800 bg-gray-800/30">
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  Matchweek {currentSnap.matchweek} Results
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
                {currentSnap.games.map((game, i) => {
                  const isUser = game.isUserGame;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 text-xs"
                      style={isUser ? { backgroundColor: `${color}15` } : {}}
                    >
                      {isUser && (
                        <span className="text-[10px] font-black shrink-0" style={{ color }}>★</span>
                      )}
                      <span className={`flex-1 text-right truncate font-semibold ${isUser ? 'text-white' : 'text-gray-300'}`}>
                        {game.home}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-800 rounded font-black text-white text-[11px] shrink-0 tabular-nums">
                        {game.homeGoals}–{game.awayGoals}
                      </span>
                      <span className={`flex-1 truncate font-semibold ${isUser ? 'text-white' : 'text-gray-300'}`}>
                        {game.away}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table + Scorers */}
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">

              {/* League Table */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-800 bg-gray-800/30">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Standings</span>
                </div>
                <div>
                  {currentSnap.tableSnapshot.map((row) => {
                    const isUser = row.club === userClub;
                    const prev = prevPositions[row.club];
                    const delta = prev != null ? prev - row.position : 0;
                    return (
                      <div
                        key={row.club}
                        className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800/30 last:border-0 text-xs"
                        style={isUser ? { backgroundColor: `${color}15` } : {}}
                      >
                        {/* Position arrow */}
                        <span className="w-3 text-[10px] shrink-0 text-center">
                          {delta > 0 ? <span className="text-emerald-400">▲</span>
                            : delta < 0 ? <span className="text-red-400">▼</span>
                            : <span className="text-gray-700">–</span>}
                        </span>
                        {/* Position number */}
                        <span className="w-5 text-center font-bold shrink-0"
                          style={{ color: row.position <= 4 ? '#3b82f6' : row.position >= 18 ? '#ef4444' : isUser ? color : '#6b7280' }}>
                          {row.position}
                        </span>
                        <ClubLogo club={row.club} size={4} />
                        <span className="flex-1 truncate font-semibold"
                          style={{ color: isUser ? color : '#d1d5db' }}>
                          {row.club}
                        </span>
                        <span className="text-gray-500 w-6 text-center tabular-nums">{row.p}</span>
                        <span className="w-8 text-center tabular-nums"
                          style={{ color: row.gd > 0 ? '#10b981' : row.gd < 0 ? '#ef4444' : '#6b7280' }}>
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </span>
                        <span className="w-7 text-center font-black tabular-nums"
                          style={{ color: isUser ? color : '#f3f4f6' }}>
                          {row.pts}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Scorers */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden h-fit">
                <div className="px-4 py-2 border-b border-gray-800 bg-gray-800/30">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Top Scorers</span>
                </div>
                <div>
                  {currentSnap.topScorers.slice(0, 10).map((s, i) => {
                    const isUser = s.club === userClub;
                    return (
                      <div key={s.playerId ?? i}
                        className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/30 last:border-0 text-xs"
                        style={isUser ? { backgroundColor: `${color}15` } : {}}>
                        <span className="text-gray-600 w-4 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate" style={{ color: isUser ? color : '#e5e7eb' }}>
                            {s.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{s.club}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-black text-white">{s.goals}</span>
                          <span className="text-gray-600 text-[10px]">⚽</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Season over summary */}
            {phase === 'closed' && (() => {
              const userRow = currentSnap.tableSnapshot.find(r => r.club === userClub);
              const zone = userRow?.position <= 1 ? '🏆 Champions'
                : userRow?.position <= 4 ? '🔵 Champions League'
                : userRow?.position <= 6 ? '🟠 Europa League'
                : userRow?.position >= 18 ? '🔻 Relegated'
                : '✅ Mid-table';
              return (
                <div className="animate-fade-in text-center py-6 border-t border-gray-800">
                  <div className="text-2xl font-black text-white mb-1">
                    {userRow ? `${userRow.position <= 20 ? ordinal(userRow.position) : '—'} · ${userRow.pts} pts` : '—'}
                  </div>
                  <div className="text-sm text-gray-400">{zone}</div>
                  <div className="text-xs text-gray-600 mt-1">Season Complete</div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 w-full bg-[#0f1117]/95 backdrop-blur border-t border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={() => onCompleteRef.current(resultRef.current)}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Skip →
          </button>
          {phase === 'closed' && (
            <button
              onClick={() => onCompleteRef.current(resultRef.current)}
              className="flex-1 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: color }}
            >
              View Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ordinal(n) {
  if (n === 11 || n === 12 || n === 13) return `${n}th`;
  const r = n % 10;
  return `${n}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`;
}
