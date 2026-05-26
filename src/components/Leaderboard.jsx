import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { CLUB_LOGOS, CLUB_EMOJI } from '../data/clubLogos.js';

function ClubLogo({ club }) {
  const [failed, setFailed] = useState(false);
  const logo = CLUB_LOGOS[club];
  const emoji = CLUB_EMOJI[club] ?? '⚽';
  if (!logo || failed) return <span className="text-base leading-none">{emoji}</span>;
  return (
    <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
      <img src={logo} alt={club} className="w-full h-full object-contain" onError={() => setFailed(true)} />
    </div>
  );
}

const ZONE_COLORS = {
  'Champions':        '#f59e0b',
  'Champions League': '#3b82f6',
  'Europa League':    '#f97316',
  'Mid-table':        '#6b7280',
  'Relegated':        '#ef4444',
};

function ordinal(n) {
  if (n === 11 || n === 12 || n === 13) return `${n}th`;
  const r = n % 10;
  return `${n}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function fmtBudget(v) {
  if (v == null) return '—';
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `£${(v / 1_000).toFixed(0)}K`;
  return `£${v}`;
}

export default function Leaderboard({ onBack }) {
  const [sessions, setSessions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [countRes, dataRes] = await Promise.all([
          supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
          supabase
            .from('game_sessions')
            .select('username, club, final_position, points, outcome_zone, played_at, wins, draws, losses, goals_for, goals_against, starting_budget, budget_remaining, transfers_in, transfers_out')
            .order('points', { ascending: false })
            .order('final_position', { ascending: true })
            .limit(50),
        ]);
        if (dataRes.error) throw dataRes.error;
        setSessions(dataRes.data ?? []);
        setTotalCount(countRes.count ?? 0);
      } catch {
        setError('Could not load leaderboard. Check back later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
              ← Back
            </button>
            <div>
              <div className="text-xs text-gray-500 tracking-widest uppercase">Global</div>
              <div className="font-black text-lg text-emerald-400">Leaderboard</div>
            </div>
          </div>
          {!loading && !error && (
            <div className="text-right">
              <div className="text-2xl font-black text-white">{totalCount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">seasons played</div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-10 h-10 border-4 rounded-full animate-spin border-emerald-500/30 border-t-emerald-500" />
            <div className="text-gray-400 text-sm">Loading results…</div>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-gray-500">{error}</div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-gray-400">No results yet — be the first to complete a season!</div>
          </div>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="space-y-2">
            {sessions.map((row, i) => {
              const zoneColor = ZONE_COLORS[row.outcome_zone] ?? '#6b7280';
              const budgetDiff = row.budget_remaining != null && row.starting_budget != null
                ? row.budget_remaining - row.starting_budget : null;

              return (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: zoneColor }}>

                  {/* Top row: rank, name, club, position, points, date */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-black w-6 text-gray-500 shrink-0">{i + 1}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-white truncate">{row.username}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${zoneColor}20`, color: zoneColor }}>
                          {row.outcome_zone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ClubLogo club={row.club} />
                        <span className="text-xs text-gray-400 truncate">{row.club}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-white text-lg">{row.points}<span className="text-xs text-gray-500 font-normal ml-0.5">pts</span></div>
                      <div className="text-xs font-bold" style={{ color: zoneColor }}>{ordinal(row.final_position)}</div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-[10px] text-gray-600">{formatDate(row.played_at)}</div>
                    </div>
                  </div>

                  {/* Bottom row: stats chips */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9 text-[11px] text-gray-400">
                    {/* W/D/L */}
                    <span>
                      <span className="text-emerald-400 font-bold">{row.wins ?? '—'}W</span>
                      {' '}<span className="text-yellow-400 font-bold">{row.draws ?? '—'}D</span>
                      {' '}<span className="text-red-400 font-bold">{row.losses ?? '—'}L</span>
                    </span>

                    {/* GF / GA */}
                    <span>
                      <span className="text-gray-300">{row.goals_for ?? '—'}</span>
                      <span className="text-gray-600 mx-0.5">:</span>
                      <span className="text-gray-300">{row.goals_against ?? '—'}</span>
                      <span className="text-gray-600 ml-1">goals</span>
                    </span>

                    {/* Budget */}
                    <span>
                      <span className="text-gray-500">{fmtBudget(row.starting_budget)}</span>
                      <span className="text-gray-600 mx-1">→</span>
                      <span className={budgetDiff != null ? (budgetDiff >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-300'}>
                        {fmtBudget(row.budget_remaining)}
                      </span>
                      <span className="text-gray-600 ml-1">budget</span>
                    </span>

                    {/* Transfers */}
                    <span>
                      <span className="text-emerald-400">+{row.transfers_in ?? 0}</span>
                      {' / '}
                      <span className="text-red-400">-{row.transfers_out ?? 0}</span>
                      <span className="text-gray-600 ml-1">transfers</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
