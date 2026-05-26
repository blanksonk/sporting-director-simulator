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

export default function TransferChainAnimation({
  allPlayers, userSquad, club: userClub, transfers, onComplete,
}) {
  const [items, setItems]       = useState([]);
  const [finished, setFinished] = useState(false);
  const resultRef   = useRef(null);
  const fullLogRef  = useRef([]);
  const onCompleteRef = useRef(onComplete);
  const listRef     = useRef(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Run chain synchronously
    const result = resolveTransferChain(
      allPlayers, userSquad, userClub,
      transfers.bought, transfers.sold,
    );
    resultRef.current = result;

    // Build display log: user's own moves first, then chain
    const log = [];
    transfers.bought.forEach(p => {
      log.push({ type: 'in', club: userClub, player: p, fromClub: p.club, isUser: true });
    });
    transfers.sold.forEach(p => {
      log.push({ type: 'out', club: userClub, player: p, isUser: true });
    });
    result.transferLog.forEach(t => {
      log.push({ type: 'in', club: t.club, player: t.playerIn, fromClub: t.fromClub, isUser: false, depth: t.depth });
    });

    fullLogRef.current = log;

    if (log.length === 0) {
      // No transfers at all — skip straight through
      setTimeout(() => onCompleteRef.current(resultRef.current), 600);
      return;
    }

    // Reveal items one by one
    let idx = 0;
    const DELAY = 380; // ms between each transfer
    const interval = setInterval(() => {
      idx++;
      setItems(log.slice(0, idx));
      if (idx >= log.length) {
        clearInterval(interval);
        setTimeout(() => setFinished(true), 400);
      }
    }, DELAY);

    return () => clearInterval(interval);
  }, []);

  // Auto-proceed 1.5s after finished
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => onCompleteRef.current(resultRef.current), 1500);
    return () => clearTimeout(t);
  }, [finished]);

  // Scroll to bottom as new items appear
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [items]);

  const total = fullLogRef.current.length;
  const shown = items.length;

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-black text-red-400 uppercase tracking-widest">Live</span>
        </div>
        <h1 className="text-2xl font-black text-white">Transfer Window 2026</h1>
        <p className="text-gray-500 text-sm mt-1">Clubs are active in the market…</p>
      </div>

      {/* Transfer feed */}
      <div
        ref={listRef}
        className="w-full max-w-lg flex-1 overflow-y-auto space-y-2 max-h-[60vh]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, i) => (
          <TransferItem key={i} item={item} userClub={userClub} />
        ))}
      </div>

      {/* Progress + controls */}
      <div className="w-full max-w-lg mt-6 space-y-3">
        {/* Progress bar */}
        {total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{shown} / {total} deals</span>
              {finished && <span className="text-emerald-400 font-semibold">Window closed ✓</span>}
            </div>
            <div className="bg-gray-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${total > 0 ? (shown / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onCompleteRef.current(resultRef.current)}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Skip →
          </button>
          {finished && (
            <button
              onClick={() => onCompleteRef.current(resultRef.current)}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all hover:scale-105 active:scale-95"
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
      className="flex items-start gap-3 px-4 py-3 rounded-xl border animate-fade-in"
      style={{
        backgroundColor: isUser ? `${color}10` : 'rgba(17,24,39,0.6)',
        borderColor: isUser ? `${color}40` : 'rgba(55,65,81,0.5)',
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
              style={{ backgroundColor: `${color}20`, color }}>
              Your Move
            </span>
          )}
          {!isUser && depth > 1 && (
            <span className="text-[10px] text-gray-600 font-semibold">chain ×{depth}</span>
          )}
        </div>
        <div className="text-xs text-gray-300 mt-0.5">
          <span className={isIn ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {isIn ? 'signed' : 'released'}
          </span>
          {' '}
          <span className="font-semibold text-white">{pName(player)}</span>
          {' '}
          <span className="text-gray-500">[{pPos(player)} · {player.overall}]</span>
          {isIn && fromClub && (
            <span className="text-gray-500">
              {' from '}
              <span className="text-gray-400">{fromClub}</span>
              {player.value ? <span className="text-gray-600"> · {fmt(player.value)}</span> : null}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
