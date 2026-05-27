import { useState, useEffect, useRef, useCallback } from 'react';
import { CLUB_COLORS } from '../data/budgets.js';
import { pName, pPos } from '../utils/playerName.js';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];
const POS_ORDER  = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

const ATTRS = ['pac', 'sho', 'pas', 'dri', 'def', 'fin', 'sta'];
const ATTR_LABEL = { pac: 'PAC', sho: 'SHO', pas: 'PAS', dri: 'DRI', def: 'DEF', fin: 'FIN', sta: 'STA' };

function fmt(v) {
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  return `£${(v / 1_000).toFixed(0)}K`;
}

function statColor(v) {
  if (v == null) return '#6b7280';
  if (v >= 80) return '#10b981';
  if (v >= 65) return '#f59e0b';
  if (v >= 50) return '#f97316';
  return '#ef4444';
}

function StatBars({ player }) {
  return (
    <div className="grid grid-cols-7 gap-x-1.5 gap-y-0.5 mt-2">
      {ATTRS.map(a => {
        const v = player[a];
        const pct = v != null ? Math.min(100, v) : 0;
        const c = statColor(v);
        return (
          <div key={a} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-gray-500">{ATTR_LABEL[a]}</span>
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: c }} />
            </div>
            <span className="text-[9px] font-bold tabular-nums" style={{ color: c }}>{v ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

// Chance a player accepts your approach — elite players are harder to land
function signChance(overall) {
  // 65 OVR → 95%, 75 → 84%, 82 → 73%, 88 → 63%, 92 → 56%, 95 → 52%
  return Math.min(95, Math.max(35, Math.round(108 - (overall - 60) * 1.6)));
}

function chanceColor(pct) {
  if (pct >= 75) return '#22c55e';
  if (pct >= 55) return '#f59e0b';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

// Strip diacritics so "arda guler" matches "Arda Güler", "mbappe" matches "Mbappé"
function normalize(str) {
  return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function BudgetBar({ budget, initial }) {
  const pct = Math.max(0, Math.min(100, (budget / initial) * 100));
  const color = pct > 40 ? '#10b981' : pct > 15 ? '#f59e0b' : '#ef4444';
  return (
    <div className="bg-gray-800 rounded-full h-2 w-full overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function TransferRoom({
  club, squad, setSquad, budget, setBudget,
  transfers, setTransfers, allPlayers, onSimulate,
}) {
  const [sellTarget, setSellTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sortKey, setSortKey] = useState('pos');
  const [sortDir, setSortDir] = useState(1);
  const [toast, setToast] = useState(null);
  const [confirmSim, setConfirmSim] = useState(false);
  const [pendingSignId, setPendingSignId] = useState(null);
  const searchTimer = useRef(null);
  const searchCache = useRef(new Map());
  const initialBudget = useRef(budget);
  const color = CLUB_COLORS[club] ?? '#10b981';

  const rejectedIds = new Set((transfers.rejected || []).map(p => p.id));
  const squadIds    = new Set(squad.map(p => p.id));

  const showToast = useCallback((msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Clear cache whenever squad or rejected list changes
  useEffect(() => {
    searchCache.current.clear();
  }, [squad, transfers.rejected]);

  // Debounced search — excludes squad members and rejected players
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }

    searchTimer.current = setTimeout(() => {
      const q = normalize(searchQuery);
      if (searchCache.current.has(q)) {
        setSearchResults(searchCache.current.get(q));
        return;
      }

      const results = allPlayers
        .filter(p => {
          if (squadIds.has(p.id) || rejectedIds.has(p.id)) return false;
          return normalize(p.name).includes(q) || normalize(p.longName).includes(q);
        })
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 10);

      searchCache.current.set(q, results);
      setSearchResults(results);
    }, 280);

    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, squad, allPlayers, transfers.rejected]);

  const MIN_REQS = { GK: 1, DEF: 3, MID: 3, FWD: 2 };
  const MIN_TOTAL = 18;

  function squadIssues(s) {
    const issues = [];
    const total = s.length;
    if (total < MIN_TOTAL) issues.push(`${MIN_TOTAL - total} more player${MIN_TOTAL - total === 1 ? '' : 's'} needed (min ${MIN_TOTAL})`);
    for (const [pos, min] of Object.entries(MIN_REQS)) {
      const count = s.filter(p => p.position === pos).length;
      if (count < min) issues.push(`${min - count} more ${pos}${min - count > 1 ? 's' : ''} needed`);
    }
    return issues;
  }

  const squadWarnings = squadIssues(squad);
  const squadOk = squadWarnings.length === 0;

  function handleSell(player) {
    const afterSell = squad.filter(p => p.id !== player.id);
    if (afterSell.length < MIN_TOTAL) {
      setSellTarget(null);
      showToast(`Cannot drop below ${MIN_TOTAL} players`, 'error');
      return;
    }
    setSquad(afterSell);
    setBudget(b => b + player.value);
    setTransfers(t => ({ ...t, sold: [...t.sold, player] }));
    setSellTarget(null);
    showToast(`${pName(player)} sold for ${fmt(player.value)}`, 'success');
  }

  function handleSign(player) {
    if (squadIds.has(player.id) || rejectedIds.has(player.id) || pendingSignId) return;
    if (player.value > budget) {
      showToast(`Insufficient funds — need ${fmt(player.value - budget)} more`, 'error');
      return;
    }
    setPendingSignId(player.id);

    setTimeout(() => {
      const chance = signChance(player.overall);
      const accepted = Math.random() * 100 < chance;
      setPendingSignId(null);

      if (accepted) {
        setSquad(prev => [...prev, player]);
        setBudget(b => b - player.value);
        setTransfers(t => ({ ...t, bought: [...t.bought, player] }));
        setSearchQuery('');
        setSearchResults([]);
        showToast(`${pName(player)} signed!`, 'success');
      } else {
        setTransfers(t => ({ ...t, rejected: [...(t.rejected || []), player] }));
        showToast(`${pName(player)} rejected your approach`, 'error');
      }
    }, 1500);
  }

  function handleSimulate() {
    if (!squadOk) return;
    if (transfers.bought.length === 0 && transfers.sold.length === 0) {
      setConfirmSim(true);
      return;
    }
    onSimulate();
  }

  const byPosition = POSITIONS.reduce((acc, pos) => {
    acc[pos] = squad.filter(p => p.position === pos);
    return acc;
  }, {});

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  const sortedSquad = [...squad].sort((a, b) => {
    if (sortKey === 'pos') {
      const pd = (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9);
      if (pd !== 0) return pd;
      return (b.overall - a.overall);
    }
    if (sortKey === 'name') return pName(a).localeCompare(pName(b)) * sortDir;
    if (sortKey === 'age')  return (a.age - b.age) * sortDir;
    if (sortKey === 'val')  return (a.value - b.value) * sortDir;
    const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
    return (bv - av) * sortDir;
  });

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Step 3 of 4 — Transfer Window</div>
            <div className="font-black text-white text-xl" style={{ color }}>{club}</div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Budget</span>
              <span className="font-bold text-white">{fmt(budget)}</span>
            </div>
            <BudgetBar budget={budget} initial={initialBudget.current} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleSimulate}
              disabled={!squadOk}
              className="px-6 py-2.5 rounded-xl font-bold text-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:scale-105 active:enabled:scale-95 hover:enabled:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              style={{ backgroundColor: color }}
            >
              Simulate Season →
            </button>
            {!squadOk && (
              <div className="text-[10px] text-red-400 text-right max-w-[180px]">
                {squadWarnings[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white">Your Squad</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{squad.length} players · {transfers.bought.length} in · {transfers.sold.length} out</span>
              {!squadOk && (
                <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                  ⚠ {squadWarnings[0]}
                </span>
              )}
              {squadOk && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  ✓ Squad ready
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/40">
                    {/* Sticky name col */}
                    <th className="sticky left-0 z-10 bg-gray-800/80 text-left px-3 py-2 font-semibold text-gray-400 cursor-pointer hover:text-white whitespace-nowrap"
                      onClick={() => handleSort('name')}>
                      Name {sortKey === 'name' ? (sortDir === -1 ? '↓' : '↑') : ''}
                    </th>
                    {[
                      { k: 'pos',     l: 'POS' },
                      { k: 'overall', l: 'OVR' },
                      { k: 'age',     l: 'Age' },
                      ...ATTRS.map(a => ({ k: a, l: ATTR_LABEL[a] })),
                      { k: 'val',     l: 'Value' },
                    ].map(({ k, l }) => (
                      <th key={k}
                        className="px-2 py-2 font-semibold text-gray-400 cursor-pointer hover:text-white text-center whitespace-nowrap"
                        onClick={() => handleSort(k)}>
                        {l}{sortKey === k ? (sortDir === -1 ? ' ↓' : ' ↑') : ''}
                      </th>
                    ))}
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sortedSquad.map(player => (
                    <tr key={player.id}
                      className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors group">
                      <td className="sticky left-0 z-10 bg-[#0f1117] group-hover:bg-gray-800/30 px-3 py-2 font-semibold text-white whitespace-nowrap max-w-[130px] truncate">
                        {pName(player)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ backgroundColor: `${color}25`, color }}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center font-black" style={{ color }}>{player.overall}</td>
                      <td className="px-2 py-2 text-center text-gray-400">{player.age}</td>
                      {ATTRS.map(a => (
                        <td key={a} className="px-2 py-2 text-center font-semibold tabular-nums"
                          style={{ color: statColor(player[a]) }}>
                          {player[a] ?? '—'}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center text-gray-500 whitespace-nowrap">{fmt(player.value)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => squad.length > MIN_TOTAL ? setSellTarget(player) : showToast(`Cannot drop below ${MIN_TOTAL} players`, 'error')}
                          className="opacity-40 group-hover:opacity-100 px-2 py-1 text-[10px] font-semibold rounded border transition-all whitespace-nowrap"
                          style={squad.length > MIN_TOTAL
                            ? { borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }
                            : { borderColor: 'rgba(107,114,128,0.3)', color: '#4b5563', cursor: 'not-allowed' }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Search + stats panel */}
        <div className="space-y-4 order-first lg:order-last">
          {/* Search */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-bold text-white mb-3">Sign a Player</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search players..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >✕</button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
                {searchResults.map(player => {
                  const canAfford = player.value <= budget;
                  const isPending = pendingSignId === player.id;
                  const isDisabled = !canAfford || !!pendingSignId;
                  const chance = signChance(player.overall);
                  const cc = chanceColor(chance);
                  return (
                    <div
                      key={player.id}
                      className="p-2.5 rounded-lg border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs font-black"
                            style={{ backgroundColor: canAfford ? `${color}25` : '#374151', color: canAfford ? color : '#6b7280' }}
                          >
                            {player.overall}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{pName(player)}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                              <span>{pPos(player)}</span>
                              <span>·</span>
                              <span>{player.club}</span>
                              <span>·</span>
                              <span>{fmt(player.value)}</span>
                              <span>·</span>
                              <span style={{ color: cc }} className="font-semibold">{chance}% chance</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSign(player)}
                          disabled={isDisabled}
                          className="flex-shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 min-w-[48px] text-center"
                          style={{
                            backgroundColor: canAfford ? `${color}25` : '#374151',
                            color: canAfford ? color : '#6b7280',
                            border: `1px solid ${canAfford ? color + '50' : '#4b5563'}`,
                          }}
                        >
                          {isPending ? '…' : 'Sign'}
                        </button>
                      </div>
                      <StatBars player={player} />
                    </div>
                  );
                })}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="mt-3 text-center text-gray-600 text-sm py-4">No players found</div>
            )}
          </div>

          {/* Transfer activity — always visible */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-800/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Transfer Activity</h3>
              <span className="text-xs text-gray-500">
                {transfers.bought.length} in · {transfers.sold.length} out · {(transfers.rejected || []).length} rejected
              </span>
            </div>
            {/* IN / OUT */}
            <div className="grid grid-cols-2 divide-x divide-gray-800 border-b border-gray-800">
              <div className="p-3 min-h-[100px]">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">IN</div>
                {transfers.bought.length === 0
                  ? <p className="text-xs text-gray-600 italic">No signings yet</p>
                  : transfers.bought.map(p => (
                    <div key={p.id} className="text-xs text-gray-300 py-0.5 leading-snug">
                      <span className="text-emerald-500 mr-1">+</span>{pName(p)}
                      <span className="text-gray-600 ml-1 text-[10px]">{pPos(p)}</span>
                    </div>
                  ))
                }
              </div>
              <div className="p-3 min-h-[100px]">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">OUT</div>
                {transfers.sold.length === 0
                  ? <p className="text-xs text-gray-600 italic">No sales yet</p>
                  : transfers.sold.map(p => (
                    <div key={p.id} className="text-xs text-gray-300 py-0.5 leading-snug">
                      <span className="text-red-500 mr-1">−</span>{pName(p)}
                      <span className="text-gray-600 ml-1 text-[10px]">{pPos(p)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
            {/* REJECTED */}
            <div className="p-3">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Rejected Approaches</div>
              {(transfers.rejected || []).length === 0
                ? <p className="text-xs text-gray-600 italic">No rejections yet</p>
                : <div className="flex flex-wrap gap-1.5">
                    {(transfers.rejected || []).map(p => (
                      <span key={p.id}
                        className="text-[10px] px-2 py-0.5 rounded border font-semibold"
                        style={{ borderColor: '#374151', color: '#6b7280', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        title={`${pName(p)} · OVR ${p.overall} · ${pPos(p)}`}
                      >
                        {pName(p)}
                      </span>
                    ))}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Sell confirmation modal */}
      {sellTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Sell {pName(sellTarget)}?</h3>
            <p className="text-gray-400 text-sm mb-4">
              You'll receive <span className="text-emerald-400 font-bold">{fmt(sellTarget.value)}</span> and lose this player permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSellTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors font-semibold text-sm"
              >Cancel</button>
              <button
                onClick={() => handleSell(sellTarget)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-colors"
              >Confirm Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* No-transfers confirmation modal */}
      {confirmSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Simulate with current squad?</h3>
            <p className="text-gray-400 text-sm mb-4">You haven't made any transfers. Head into the season as is?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSim(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors font-semibold text-sm"
              >Make Transfers</button>
              <button
                onClick={() => { setConfirmSim(false); onSimulate(); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-black text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: color }}
              >Simulate →</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all"
          style={{
            backgroundColor: toast.type === 'success' ? '#064e3b' : '#450a0a',
            color: toast.type === 'success' ? '#6ee7b7' : '#fca5a5',
            border: `1px solid ${toast.type === 'success' ? '#10b98140' : '#ef444440'}`,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
