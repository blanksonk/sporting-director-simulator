import { useState, useEffect, useRef, useCallback } from 'react';
import { CLUB_COLORS } from '../data/budgets.js';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

function fmt(v) {
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  return `£${(v / 1_000).toFixed(0)}K`;
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
  const [toast, setToast] = useState(null);
  const [confirmSim, setConfirmSim] = useState(false);
  const searchTimer = useRef(null);
  const searchCache = useRef(new Map());
  const initialBudget = useRef(budget);
  const color = CLUB_COLORS[club] ?? '#10b981';

  const showToast = useCallback((msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Clear cache whenever squad changes so stale results can't be re-signed
  useEffect(() => {
    searchCache.current.clear();
  }, [squad]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }

    searchTimer.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      if (searchCache.current.has(q)) {
        setSearchResults(searchCache.current.get(q));
        return;
      }

      const squadIds = new Set(squad.map(p => p.id));
      const results = allPlayers
        .filter(p => p.name.toLowerCase().includes(q) && !squadIds.has(p.id))
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 8);

      searchCache.current.set(q, results);
      setSearchResults(results);
    }, 280);

    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, squad, allPlayers]);

  function handleSell(player) {
    setSquad(prev => prev.filter(p => p.id !== player.id));
    setBudget(b => b + player.value);
    setTransfers(t => ({ ...t, sold: [...t.sold, player] }));
    setSellTarget(null);
    showToast(`${player.name} sold for ${fmt(player.value)}`, 'success');
  }

  function handleBuy(player) {
    if (squad.some(p => p.id === player.id)) return; // guard: prevent double-signing
    if (player.value > budget) {
      showToast(`Insufficient funds — need ${fmt(player.value - budget)} more`, 'error');
      return;
    }
    setSquad(prev => [...prev, player]);
    setBudget(b => b - player.value);
    setTransfers(t => ({ ...t, bought: [...t.bought, player] }));
    setSearchQuery('');
    setSearchResults([]);
    showToast(`${player.name} signed!`, 'success');
  }

  function handleSimulate() {
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
          <button
            onClick={handleSimulate}
            className="px-6 py-2.5 rounded-xl font-bold text-black text-sm transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            style={{ backgroundColor: color }}
          >
            Simulate Season →
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Your Squad</h2>
            <div className="text-sm text-gray-500">
              {squad.length} players · {transfers.bought.length} in · {transfers.sold.length} out
            </div>
          </div>

          {POSITIONS.map(pos => (
            <div key={pos} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800/50 flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}30`, color }}>
                  {pos}
                </span>
                <span className="text-gray-500 text-xs">{byPosition[pos].length} players</span>
              </div>
              {byPosition[pos].length === 0 ? (
                <div className="px-4 py-3 text-gray-600 text-sm italic">No {pos}s in squad</div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {byPosition[pos].map(player => (
                    <div
                      key={player.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Overall badge */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          {player.overall}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{player.name}</div>
                          <div className="text-xs text-gray-500">Age {player.age} · {fmt(player.value)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSellTarget(player)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 text-xs font-semibold rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        Sell
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search + stats panel */}
        <div className="space-y-4">
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
                {searchResults.filter(p => !squad.some(s => s.id === p.id)).map(player => {
                  const canAfford = player.value <= budget;
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs font-black"
                          style={{ backgroundColor: canAfford ? `${color}25` : '#374151', color: canAfford ? color : '#6b7280' }}
                        >
                          {player.overall}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{player.name}</div>
                          <div className="text-[10px] text-gray-500">{player.position} · {player.club} · {fmt(player.value)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuy(player)}
                        disabled={!canAfford}
                        className="flex-shrink-0 ml-2 px-2.5 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: canAfford ? `${color}25` : '#374151',
                          color: canAfford ? color : '#6b7280',
                          border: `1px solid ${canAfford ? color + '50' : '#4b5563'}`,
                        }}
                      >
                        Sign
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="mt-3 text-center text-gray-600 text-sm py-4">No players found</div>
            )}
          </div>

          {/* Transfer summary */}
          {(transfers.bought.length > 0 || transfers.sold.length > 0) && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Transfer Activity</h3>
              {transfers.bought.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-emerald-400 font-semibold mb-1">IN</div>
                  {transfers.bought.map(p => (
                    <div key={p.id} className="text-xs text-gray-300 py-0.5">+ {p.name} ({fmt(p.value)})</div>
                  ))}
                </div>
              )}
              {transfers.sold.length > 0 && (
                <div>
                  <div className="text-xs text-red-400 font-semibold mb-1">OUT</div>
                  {transfers.sold.map(p => (
                    <div key={p.id} className="text-xs text-gray-300 py-0.5">− {p.name} ({fmt(p.value)})</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sell confirmation modal */}
      {sellTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Sell {sellTarget.name}?</h3>
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
