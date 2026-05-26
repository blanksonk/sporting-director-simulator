import { useState } from 'react';
import { FORMATIONS } from '../data/formations.js';
import { CLUB_COLORS } from '../data/budgets.js';
import { pName, pPos } from '../utils/playerName.js';

const ROLE_KEYS = ['captain', 'vc1', 'vc2', 'fkTaker', 'cornerTaker', 'penaltyTaker'];
const ROLE_LABELS = {
  captain:      { label: 'Captain',        icon: 'C',  required: true  },
  vc1:          { label: 'Vice Captain 1',  icon: 'V',  required: false },
  vc2:          { label: 'Vice Captain 2',  icon: 'V',  required: false },
  fkTaker:      { label: 'Free Kick Taker', icon: 'FK', required: false },
  cornerTaker:  { label: 'Corner Taker',    icon: 'CK', required: false },
  penaltyTaker: { label: 'Penalty Taker',   icon: 'PK', required: false },
};

const POS_COLORS = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#10b981', FWD: '#ef4444' };

export default function TacticsRoom({ club, squad, formation: initFormation, onConfirm, onBack }) {
  const [formation, setFormation] = useState(initFormation || '4-3-3');
  const [lineup, setLineup]       = useState({});   // slotId → player
  const [roles, setRoles]         = useState({});   // roleKey → playerId
  const [activeSlot, setActiveSlot] = useState(null); // slotId being filled, or null
  const [panel, setPanel]         = useState('squad'); // 'squad' | 'roles'

  const color  = CLUB_COLORS[club] ?? '#10b981';
  const slots  = FORMATIONS[formation]?.slots ?? [];

  const assignedPlayerIds = new Set(Object.values(lineup).map(p => p?.id).filter(Boolean));
  const allFilled  = slots.every(s => lineup[s.id]);
  const captainSet = !!roles.captain;
  const canConfirm = allFilled && captainSet;

  // ── Formation change ──────────────────────────────────────────────────────
  function handleChangeFormation(f) {
    setFormation(f);
    setLineup({});
    setActiveSlot(null);
  }

  // ── Pitch slot clicked ────────────────────────────────────────────────────
  function handleSlotClick(slot) {
    setActiveSlot(prev => prev === slot.id ? null : slot.id);
    setPanel('squad');
  }

  // ── Assign player to active slot ──────────────────────────────────────────
  function handleAssignPlayer(player) {
    if (!activeSlot) return;
    setLineup(prev => {
      const next = { ...prev };
      // If this player is already in another slot, clear it
      Object.keys(next).forEach(k => { if (next[k]?.id === player.id && k !== activeSlot) delete next[k]; });
      next[activeSlot] = player;
      return next;
    });
    // Auto-advance to next unfilled slot of the same type
    const currentSlotObj = slots.find(s => s.id === activeSlot);
    const nextEmpty = slots.find(s =>
      s.id !== activeSlot &&
      s.role === currentSlotObj?.role &&
      !lineup[s.id] &&
      lineup[s.id]?.id !== player.id
    ) || slots.find(s => s.id !== activeSlot && !lineup[s.id] && s.id !== activeSlot);
    setActiveSlot(nextEmpty?.id ?? null);
  }

  // ── Remove player from slot ───────────────────────────────────────────────
  function handleClearSlot(slotId) {
    setLineup(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    setActiveSlot(slotId);
    setPanel('squad');
  }

  // ── Role assignment ───────────────────────────────────────────────────────
  function handleAssignRole(roleKey, playerId) {
    setRoles(prev => {
      const next = { ...prev };
      if (!playerId) { delete next[roleKey]; return next; }
      // Only captain ↔ VC roles are mutually exclusive with each other.
      // A captain CAN also be penalty/corner/freekick taker.
      const captainVc = ['captain', 'vc1', 'vc2'];
      if (captainVc.includes(roleKey)) {
        captainVc.forEach(k => { if (k !== roleKey && next[k] === playerId) delete next[k]; });
      }
      next[roleKey] = playerId;
      return next;
    });
  }

  function roleOptions(roleKey) {
    const { captain, vc1, vc2 } = roles;
    switch (roleKey) {
      case 'captain':     return squad.filter(p => p.position !== 'GK' && p.id !== vc1  && p.id !== vc2);
      case 'vc1':         return squad.filter(p => p.position !== 'GK' && p.id !== captain && p.id !== vc2);
      case 'vc2':         return squad.filter(p => p.position !== 'GK' && p.id !== captain && p.id !== vc1);
      case 'fkTaker':     return squad;
      case 'cornerTaker': return squad;
      case 'penaltyTaker':return squad.filter(p => p.position !== 'GK');
      default:            return squad;
    }
  }

  // ── Derive eligible players for the active slot ───────────────────────────
  const activeSlotObj = slots.find(s => s.id === activeSlot);
  // All squad players eligible for any slot — position is a suggestion, not a lock
  // Only exclude players already placed in OTHER slots
  const eligiblePlayers = activeSlotObj
    ? squad
        .sort((a, b) => b.overall - a.overall)
    : [];

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getSlotPlayer(slotId) { return lineup[slotId] ?? null; }

  function roleLabel(playerId) {
    if (roles.captain === playerId) return 'C';
    if (roles.vc1 === playerId || roles.vc2 === playerId) return 'V';
    return null;
  }

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
              <span className="text-gray-600">·</span>
              <span className={captainSet ? 'text-yellow-400 font-bold' : 'text-gray-500'}>
                {captainSet ? `C: ${pName(squad.find(p => p.id === roles.captain) || {}).split(' ').pop()}` : 'No captain'}
              </span>
            </div>
            <button onClick={onBack}
              className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors">
              ← Back
            </button>
            <button
              onClick={() => canConfirm && onConfirm(formation, lineup, roles)}
              disabled={!canConfirm}
              className="px-6 py-2 rounded-xl font-bold text-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: color }}
            >
              {canConfirm ? 'Simulate →' : allFilled ? 'Set captain' : `Fill ${11 - Object.keys(lineup).length} slots`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex gap-4 flex-col lg:flex-row">

        {/* ── Left: formation tabs + pitch ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Formation tabs */}
          <div className="flex gap-2 flex-wrap">
            {Object.keys(FORMATIONS).map(f => (
              <button key={f} onClick={() => handleChangeFormation(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold border transition-all"
                style={formation === f
                  ? { backgroundColor: `${color}25`, borderColor: color, color }
                  : { borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af', backgroundColor: 'transparent' }
                }
              >{f}</button>
            ))}
          </div>

          {/* Pitch */}
          <div className="relative w-full rounded-2xl" style={{ paddingBottom: '145%' }}>
            {/* Green pitch background */}
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(180deg, #166534 0%, #15803d 30%, #16a34a 55%, #15803d 80%, #166534 100%)' }}
            >
              {/* Pitch markings SVG */}
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

            {/* Slots — each is an absolutely positioned button, NO z-index tricks needed */}
            {slots.map(slot => {
              const player    = getSlotPlayer(slot.id);
              const isActive  = activeSlot === slot.id;
              const posColor  = POS_COLORS[slot.role] ?? '#6b7280';
              const badge     = player ? roleLabel(player.id) : null;

              return (
                <button
                  key={slot.id}
                  onClick={() => player ? handleClearSlot(slot.id) : handleSlotClick(slot)}
                  onContextMenu={e => { e.preventDefault(); if (player) handleClearSlot(slot.id); }}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%,-50%)', zIndex: 1 }}
                  title={player ? `${pName(player)} — click to remove` : `Click to assign ${slot.role}`}
                >
                  {/* Circle */}
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
                    {/* Captain / VC badge */}
                    {badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                        style={{ backgroundColor: badge === 'C' ? '#facc15' : '#60a5fa', color: '#000' }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  {/* Name label */}
                  <div className="mt-0.5 text-[9px] font-bold leading-tight max-w-[52px] text-center truncate"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)', color: player ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                    {player ? (pName(player)).split(' ').pop() : slot.id.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-600 text-center">
            Click an empty slot to assign · Click a filled slot to remove
          </p>
        </div>

        {/* ── Right: assignment panel + squad + roles ──────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3">

          {/* Panel toggle */}
          <div className="flex rounded-xl border border-gray-800 overflow-hidden">
            {['squad', 'roles'].map(p => (
              <button key={p} onClick={() => { setPanel(p); setActiveSlot(null); }}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                style={panel === p
                  ? { backgroundColor: `${color}25`, color }
                  : { backgroundColor: 'transparent', color: '#6b7280' }
                }
              >{p === 'squad' ? 'Squad & Lineup' : 'Special Roles'}</button>
            ))}
          </div>

          {/* ── SQUAD PANEL ── */}
          {panel === 'squad' && (
            <div className="flex flex-col gap-3">

              {/* Assignment helper */}
              {activeSlot && (
                <div className="rounded-xl p-3 border"
                  style={{ borderColor: `${color}50`, backgroundColor: `${color}12` }}>
                  <div className="text-xs font-bold mb-2" style={{ color }}>
                    Assigning {activeSlotObj?.role} — {activeSlotObj?.id.toUpperCase()}
                  </div>
                  {eligiblePlayers.length === 0 ? (
                    <p className="text-xs text-gray-500">No available {activeSlotObj?.role}s in squad</p>
                  ) : (
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {eligiblePlayers.map(p => {
                        const alreadyElsewhere = assignedPlayerIds.has(p.id) && lineup[activeSlot]?.id !== p.id;
                        return (
                          <button key={p.id} onClick={() => !alreadyElsewhere && handleAssignPlayer(p)}
                            disabled={alreadyElsewhere}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left disabled:opacity-35 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => { if (!alreadyElsewhere) e.currentTarget.style.backgroundColor = `${color}20`; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          >
                            <span className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-black"
                              style={{ backgroundColor: `${color}25`, color }}>
                              {p.overall}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white truncate">{pName(p)}</div>
                              <div className="text-[10px] text-gray-500">
                                {pPos(p)} · Age {p.age}{alreadyElsewhere ? ' · already placed' : ''}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => setActiveSlot(null)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    ✕ Cancel
                  </button>
                </div>
              )}

              {/* Full squad list grouped by position */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Full Squad</span>
                  <span className="text-xs text-gray-500">{squad.length} players</span>
                </div>
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
                          const badge = roleLabel(p.id);
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
                              <span className={`text-xs flex-1 truncate ${inLineup ? 'text-white font-semibold' : 'text-gray-400'}`}>
                                {pName(p)}
                              </span>
                              <div className="flex gap-1">
                                {badge === 'C' && <span className="text-[9px] font-black px-1 py-0.5 rounded bg-yellow-400 text-black">C</span>}
                                {badge === 'V' && <span className="text-[9px] font-black px-1 py-0.5 rounded bg-blue-400 text-black">V</span>}
                                {inLineup && !badge && <span className="text-emerald-400 text-xs">✓</span>}
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
          )}

          {/* ── ROLES PANEL ── */}
          {panel === 'roles' && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-800">
                <p className="text-xs text-gray-500">Captain is required · others optional</p>
              </div>
              <div className="divide-y divide-gray-800/50">
                {ROLE_KEYS.map(roleKey => {
                  const { label, icon, required } = ROLE_LABELS[roleKey];
                  const options = roleOptions(roleKey).sort((a, b) => b.overall - a.overall);
                  const assignedId = roles[roleKey];
                  const assignedPlayer = squad.find(p => p.id === assignedId);

                  return (
                    <div key={roleKey} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded text-[9px] font-black flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20`, color }}>{icon}</span>
                          <span className="text-xs font-semibold text-white">
                            {label}{required && <span className="text-red-400 ml-1">*</span>}
                          </span>
                        </div>
                        {assignedPlayer && (
                          <button onClick={() => handleAssignRole(roleKey, null)}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors">
                            ✕ clear
                          </button>
                        )}
                      </div>
                      <select
                        value={assignedId ?? ''}
                        onChange={e => handleAssignRole(roleKey, e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="">— Not assigned —</option>
                        {options.map(p => (
                          <option key={p.id} value={p.id}>
                            {pName(p)} ({pPos(p)} · {p.overall})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
