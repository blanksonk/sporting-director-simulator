import { useState, useEffect, useRef } from 'react';
import { resolveTransferChain } from '../utils/transfers.js';
import { CLUB_LOGOS, CLUB_EMOJI } from '../data/clubLogos.js';
import { CLUB_COLORS } from '../data/budgets.js';
import { pName, pPos } from '../utils/playerName.js';

function ClubLogo({ club }) {
  const [failed, setFailed] = useState(false);
  const logo = CLUB_LOGOS[club];
  const emoji = CLUB_EMOJI[club] ?? '⚽';
  if (!logo || failed) return <span className="text-sm leading-none">{emoji}</span>;
  return (
    <div className="w-5 h-5 bg-white rounded p-0.5 flex items-center justify-center shrink-0">
      <img src={logo} alt={club} className="w-full h-full object-contain" onError={() => setFailed(true)} />
    </div>
  );
}

function fmt(v) {
  if (!v) return '';
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`;
  return `£${(v / 1_000).toFixed(0)}K`;
}

const ITEM_DELAY = 600; // ms between each transfer reveal
const MIN_SCREEN_MS = 3000; // minimum time on screen regardless

export default function TransferChainAnimation({
  allPlayers, userSquad, club: userClub, transfers, onComplete,
}) {
  const [phase, setPhase]     = useState('opening'); // 'opening' | 'active' | 'closed'
  const [items, setItems]     = useState([]);
  const resultRef             = useRef(null);
  const fullLogRef            = useRef([]);
  const onCompleteRef         = useRef(onComplete);
  const listRef               = useRef(null);
  const startTimeRef          = useRef(Date.now());

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    // Compute chain synchronously
    const result = resolveTransferChain(
      allPlayers, userSquad, userClub,
      transfers.bought ?? [], transfers.sold ?? [],
    );
    resultRef.current = result;

    // Build full display log
    const log = [];
    (transfers.bought ?? []).forEach(p => {
      log.push({ type: 'in', club: userClub, player: p, fromClub: p.club, isUser: true });
    });
    (transfers.sold ?? []).forEach(p => {
      log.push({ type: 'out', club: userClub, player: p, isUser: true });
    });
    result.transferLog.forEach(t => {
      log.push({ type: 'in', club: t.club, player: t.playerIn, fromClub: t.fromClub, isUser: false, depth: t.depth });
    });
    fullLogRef.current = log;
    startTimeRef.current = Date.now();

    // 800ms opening splash, then start revealing
    const openTimer = setTimeout(() => {
      setPhase('active');

      if (log.length === 0) {
        // No transfers at all — show "quiet window" briefly then close
        setTimeout(() => setPhase('closed'), 1500);
        return;
      }

      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setItems(log.slice(0, idx));
        if (idx >= log.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('closed'), 600);
        }
      }, ITEM_DELAY);

      // Store cleanup reference
      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(openTimer);
  }, []);

  // When closed: respect minimum screen time, then advance
  useEffect(() => {
    if (phase !== 'closed') return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_SCREEN_MS - elapsed);
    const t = setTimeout(() => onCompleteRef.current(resultRef.current), remaining);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-scroll feed
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [items]);

  const total = fullLogRef.current.length;
  const shown = items.length;
  const color = CLUB_COLORS[userClub] ?? '#10b981';

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-start">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 w-full bg-[#0f1117]/95 backdrop-blur border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
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
                {phase === 'closed' ? 'Window Closed' : 'Live'}
              </span>
            </div>
            <div className="font-black text-white text-lg">Summer Transfer Window</div>
            <div className="text-xs text-gray-500">2026–27 season</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{shown}</div>
            <div className="text-xs text-gray-500">deal{shown !== 1 ? 's' : ''} done</div>
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="max-w-lg mx-auto mt-3">
            <div className="bg-gray-800 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${(shown / total) * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div
        ref={listRef}
        className="w-full max-w-lg flex-1 px-4 py-4 space-y-2 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {phase === 'opening' && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin border-gray-700 border-t-emerald-500" />
            <p className="text-gray-400 text-sm">Opening the transfer window…</p>
          </div>
        )}

        {phase !== 'opening' && items.length === 0 && fullLogRef.current.length === 0 && (
          <div className="animate-fade-in text-center py-16">
            <div className="text-3xl mb-3">🤝</div>
            <p className="text-gray-400 text-sm">No transfer activity this window</p>
          </div>
        )}

        {items.map((item, i) => (
          <TransferItem key={i} item={item} userClub={userClub} />
        ))}

        {phase === 'closed' && total > 0 && (
          <div className="animate-fade-in text-center py-6 border-t border-gray-800 mt-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
              Transfer Window Closed · {total} deal{total !== 1 ? 's' : ''} completed
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 w-full bg-[#0f1117]/95 backdrop-blur border-t border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
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
              Set Tactics →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TransferItem({ item, userClub }) {
  const { type, club, player, fromClub, isUser, depth } = item;
  const color = CLUB_COLORS[club] ?? '#6b7280';
  const isIn = type === 'in';

  return (
    <div
      className="animate-fade-in flex items-start gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: isUser ? `${color}12` : 'rgba(17,24,39,0.7)',
        borderColor: isUser ? `${color}50` : 'rgba(55,65,81,0.6)',
      }}
    >
      <ClubLogo club={club} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm" style={{ color: isUser ? color : '#e5e7eb' }}>
            {club}{isUser ? ' (You)' : ''}
          </span>
          {isUser && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ backgroundColor: `${color}25`, color }}>
              Your Move
            </span>
          )}
          {!isUser && depth > 1 && (
            <span className="text-[10px] text-gray-600 font-semibold">chain ×{depth}</span>
          )}
        </div>
        <p className="text-xs text-gray-300 mt-0.5">
          <span className={isIn ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {isIn ? 'signed' : 'released'}
          </span>
          {' '}
          <span className="font-semibold text-white">{pName(player)}</span>
          {' '}
          <span className="text-gray-500">[{pPos(player)} · {player.overall}]</span>
          {isIn && fromClub && (
            <span className="text-gray-500">
              {' from '}<span className="text-gray-400">{fromClub}</span>
              {player.value ? <span className="text-gray-600"> · {fmt(player.value)}</span> : null}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
