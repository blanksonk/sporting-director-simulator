import { useState } from 'react';
import { FORMATIONS } from '../data/formations.js';
import { CLUB_COLORS } from '../data/budgets.js';
import { pName, pPos } from '../utils/playerName.js';

const POS_COLORS = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#10b981', FWD: '#ef4444' };

export default function TacticsRoom({ club, squad, formation: initFormation, onConfirm, onBack }) {
  const [formation, setFormation] = useState(initFormation || '4-3-3');
  const [lineup, setLineup]       = useState({});
  const [activeSlot, setActiveSlot] = useState(null);

  const color  = CLUB_COLORS[club] ?? '#10b981';
  const slots  = FORMATIONS[formation]?.slots ?? [];

  const assignedPlayerIds = new Set(Object.values(lineup).map(p => p?.id).filter(Boolean));
  const allFilled  = slots.every(s => lineup[s.id]);
  const canConfirm = allFilled;

  // Auto-captain: highest-rated non-GK in lineup (or squad fallback)
  const lineupPlayers = Object.values(lineup).filter(Boolean);
  const autoCaptain = (lineupPlayers.length > 0 ? lineupPlayers : squad)
    .filter(p => p.position !== 'GK')
    .sort((a, b) => b.overall - a.overall)[0];

  // ── Formation change ──────────────────────────────────────────────────────
  function handleChangeFormation(f) {
    setFormation(f);
    setLineup({});
    setActiveSlot(null);
  }

  // ── Auto-fill lineup ──────────────────────────────────────────────────────
  function autoFill() {
    const newLineup = {};
    const byPos = { GK: [], DEF: [], MID: [], FWD: [] };
    squad.forEach(p => { if (byPos[p.position]) byPos[p.position].push(p); });
    Object.values(byPos).forEach(arr => arr.sort((a, b) => b.overall - a.overall));

    const used = new Set();
    const currentSlots = FORMATIONS[formation]?.slots ?? [];
    currentSlots.forEach(slot => {
      const pool = [...(byPos[slot.role] || []), ...squad].filter(p => !used.has(p.id));
      if (pool[0]) { newLineup[slot.id] = pool[0]; used.add(pool[0].id); }
    });
    setLineup(newLineup);
    setActiveSlot(null);
  }

  // ── Pitch slot clicked ────────────────────────────────────────────────────
  function handleSlotClick(slot) {
    setActiveSlot(prev => prev === slot.id ? null : slot.id);
  }

  // ── Assign player to active slot ──────────────────────────────────────────
  function handleAssignPlayer(player) {
    if (!activeSlot) return;
    setLineup(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k]?.id === player.id && k !== activeSlot) delete next[k]; });
      next[activeSlot] = player;
      return next;
    });
    const currentSlotObj = slots.find(s => s.id === activeSlot);
    const nextEmpty = slots.find(s =>
      s.id !== activeSlot &&
      s.role === currentSlotObj?.role &&
      !lineup[s.id]
    ) || slots.find(s => s.id !== activeSlot && !lineup[s.id]);
    setActiveSlot(nextEmpty?.id ?? null);
  }

  // ── Remove player from slot ───────────────────────────────────────────────
  function handleClearSlot(slotId) {
    setLineup(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    setActiveSlot(slotId);
  }

  function getSlotPlayer(slotId) { return lineup[slotId] ?? null; }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Step 4 of 4 — Tactics</div>
            <div className="font-black text-xl" style={{ color }}>{club}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className={`font-bold ${allFilled ? 'text-emerald-400' : 'text-gray-400'}`}>
                {Object.keys(lineup).length}/11
              </span>
            </div>
            <button onClick={onBack}
              className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors">
              ← Back
            </button>
            <button
              onClick={() => canConfirm && onConfirm(formation, lineup, { captain: autoCaptain?.id })}
              disabled={!canConfirm}
              className="px-6 py-2 rounded-xl font-bold text-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: color }}
            >
              {canConfirm ? 'Simulate →' : `Fill ${11 - Object.keys(lineup).length} slots`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex gap-4 flex-col lg:flex-row">

        {/* ── Left: formation tabs + pitch ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Formation tabs + autofill */}
          <div className="flex gap-2 flex-wrap items-center">
            {Object.keys(FORMATIONS).map(f => (
              <button key={f} onClick={() => handleChangeFormation(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold border transition-all"
                style={formation === f
                  ? { backgroundColor: `${color}25`, borderColor: color, color }
                  : { borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af', backgroundColor: 'transparent' }
                }
              >{f}</button>
            ))}
            <button onClick={autoFill}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all ml-auto">
              Auto-fill ✦
            </button>
          </div>

          {/* Pitch */}
          <div className="relative w-full rounded-2xl" style={{ paddingBottom: '145%' }}>
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(180deg, #166534 0%, #15803d 30%, #16a34a 55%, #15803d 80%, #166534 100%)' }}
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 145" preserveAspectRatio="none">
                <rect x="2" y="2" width="96" height="141" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5"/>
                <line x1="2" y1="72.5" x2="98" y2="72.5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
                <circle cx="50" cy="72.5" r="9" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
                <rect x="22" y="2" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
                <rect x="22" y="123" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
                <rect x="36" y="2" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
                <rect x="36" y="135" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4"/>
              </svg>
            </div>

            {slots.map(slot => {
              const player    = getSlotPlayer(slot.id);
              const isActive  = activeSlot === slot.id;
              const posColor  = POS_COLORS[slot.role] ?? '#6b7280';
              const isCaptain = autoCaptain && player?.id === autoCaptain.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => player ? handleClearSlot(slot.id) : handleSlotClick(slot)}
                  onContextMenu={e => { e.preventDefault(); if (player) handleClearSlot(slot.id); }}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%,-50%)', zIndex: 1 }}
                  title={player ? `${pName(player)} — click to remove` : `Click to assign ${slot.role}`}
                >
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all relative"
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.35)'
                        : player
                          ? `${posColor}cc`
                          : 'rgba(0,0,0,0.3)',
                      borderColor: isActive
                        ? '#fff'
                        : player ? posColor : 'rgba(255,255,255,0.5)',
                      boxShadow: isActive
                        ? '0 0 0 3px rgba(255,255,255,0.4)'
                        : player ? `0 0 10px ${posColor}80` : 'none',
                      color: player ? '#000' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {player ? player.overall : <span className="text-base leading-none">+</span>}
                    {isCaptain && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={{ backgroundColor: '#facc15', color: '#000' }}>C</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-col items-center gap-0 max-w-[56px]">
                    <div className="text-[9px] font-bold leading-tight text-center truncate w-full"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)', color: player ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                      {player ? (pName(player)).split(' ').pop() : slot.id.toUpperCase()}
                    </div>
                    {player && (
                      <div className="text-[8px] font-semibold leading-tight text-center truncate w-full"
                        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)', color: POS_COLORS[player.position] ?? '#9ca3af' }}>
                        {pPos(player)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-600 text-center">
            Click an empty slot to assign · Click a filled slot to remove
          </p>
        </div>

        {/* ── Right: squad list ────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Squad</span>
              <span className="text-xs text-gray-500">{squad.length} players</span>
            </div>
            {activeSlot && (
              <div className="px-4 py-2 bg-gray-800/40 border-b border-gray-800 text-xs text-gray-400">
                Assigning <span className="font-bold text-white">{slots.find(s => s.id === activeSlot)?.role}</span> — tap a player below
              </div>
            )}
            <div className="max-h-[50vh] overflow-y-auto">
              {['GK', 'DEF', 'MID', 'FWD'].map(pos => {
                const posPlayers = squad.filter(p => p.position === pos).sort((a, b) => b.overall - a.overall);
                if (!posPlayers.length) return null;
                const posColor = POS_COLORS[pos];
                return (
                  <div key={pos}>
                    <div className="px-4 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ color: posColor, backgroundColor: `${posColor}15` }}>
                      {pos}
                    </div>
                    {posPlayers.map(p => {
                      const inLineup = assignedPlayerIds.has(p.id);
                      const canAssign = !!activeSlot && !inLineup;
                      const isCaptain = autoCaptain?.id === p.id;
                      return (
                        <button key={p.id}
                          onClick={() => canAssign ? handleAssignPlayer(p) : undefined}
                          className="w-full flex items-center gap-2.5 px-4 py-2 border-t border-gray-800/40 transition-colors text-left hover:bg-gray-800/40"
                          style={{ cursor: canAssign ? 'pointer' : 'default' }}
                        >
                          <span className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                            style={{ backgroundColor: inLineup ? `${posColor}30` : 'rgba(255,255,255,0.06)', color: inLineup ? posColor : '#6b7280' }}>
                            {p.overall}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs truncate ${inLineup ? 'text-white font-semibold' : 'text-gray-400'}`}>
                              {pName(p)}
                            </div>
                            <div className="text-[9px] truncate" style={{ color: POS_COLORS[p.position] ?? '#6b7280' }}>
                              {pPos(p)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {isCaptain && inLineup && <span className="text-[9px] font-black px-1 py-0.5 rounded bg-yellow-400 text-black">C</span>}
                            {inLineup && !isCaptain && <span className="text-emerald-400 text-xs">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
