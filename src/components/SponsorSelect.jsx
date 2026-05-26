import { useState } from 'react';
import { getSponsors } from '../data/sponsors.js';
import { CLUB_COLORS } from '../data/budgets.js';

function formatBonus(v) {
  return `+£${(v / 1_000_000).toFixed(0)}M`;
}

const TOTAL_PITCHES = 3;

// pitch state per card: null | 'pitching' | 'accepted' | 'rejected'

export default function SponsorSelect({ club, onSelectSponsor, onBack }) {
  const sponsors = getSponsors(club);
  const color = CLUB_COLORS[club] ?? '#10b981';

  const [pitchesUsed, setPitchesUsed] = useState(0);
  const [cardStates, setCardStates] = useState({}); // { [sponsorName]: 'pitching'|'accepted'|'rejected' }
  const [activePitch, setActivePitch] = useState(null); // name of card currently animating
  const [noSponsor, setNoSponsor] = useState(false);
  const [accepted, setAccepted] = useState(null); // winning sponsor object

  const pitchesLeft = TOTAL_PITCHES - pitchesUsed;
  const isPitching = activePitch !== null;

  function handlePitch(sponsor) {
    if (isPitching || pitchesLeft <= 0 || cardStates[sponsor.name]) return;

    const newUsed = pitchesUsed + 1;
    setPitchesUsed(newUsed);
    setActivePitch(sponsor.name);
    setCardStates(prev => ({ ...prev, [sponsor.name]: 'pitching' }));

    setTimeout(() => {
      const success = Math.random() * 100 < sponsor.chance;
      if (success) {
        setCardStates(prev => ({ ...prev, [sponsor.name]: 'accepted' }));
        setActivePitch(null);
        setAccepted(sponsor);
        setTimeout(() => onSelectSponsor(sponsor), 1800);
      } else {
        setCardStates(prev => ({ ...prev, [sponsor.name]: 'rejected' }));
        setActivePitch(null);
        if (newUsed >= TOTAL_PITCHES) {
          setTimeout(() => setNoSponsor(true), 600);
        }
      }
    }, 1800);
  }

  // No-sponsor failure screen
  if (noSponsor) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">😬</div>
          <h2 className="text-3xl font-black text-white mb-3">No Deal This Season</h2>
          <p className="text-gray-400 mb-2">
            You burned through all 3 pitches without landing a sponsor.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            You'll have to make do with your base budget — no bonus injection this window.
          </p>
          <button
            onClick={() => onSelectSponsor(null)}
            className="px-10 py-3 rounded-xl font-bold text-white bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Continue to Transfers →
          </button>
        </div>
      </div>
    );
  }

  // Accepted screen
  if (accepted) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🤝</div>
          <h2 className="text-3xl font-black text-white mb-3">Deal Signed!</h2>
          <p className="text-xl font-bold mb-1" style={{ color }}>{accepted.name}</p>
          <p className="text-gray-400 text-sm mb-4">{accepted.type}</p>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-lg font-black mb-6"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}50` }}
          >
            💰 {formatBonus(accepted.bonus)} added to your budget
          </div>
          <p className="text-gray-500 text-sm">Heading to the transfer room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-2">Step 2 of 4</div>
          <h1 className="text-4xl font-black text-white mb-2">Land a Sponsor</h1>
          <p className="text-gray-400">
            <span className="font-semibold" style={{ color }}>{club}</span> — pitch to sponsors and hope they say yes
          </p>
        </div>

        {/* Pitch counter */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {Array.from({ length: TOTAL_PITCHES }).map((_, i) => {
            const used = i < pitchesUsed;
            return (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                  borderColor: used ? '#ef4444' : color,
                  backgroundColor: used ? '#ef444420' : `${color}15`,
                  color: used ? '#ef4444' : color,
                }}
              >
                {used ? '✗' : i + 1}
              </div>
            );
          })}
          <span className="text-gray-400 text-sm ml-2">
            {pitchesLeft > 0
              ? `${pitchesLeft} pitch${pitchesLeft === 1 ? '' : 'es'} remaining`
              : 'No pitches left'}
          </span>
        </div>

        {/* Sponsor cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sponsors.map((sponsor) => {
            const state = cardStates[sponsor.name] ?? null;
            const isDisabled = state === 'rejected' || state === 'accepted' || (isPitching && state !== 'pitching') || pitchesLeft <= 0;
            const isPitchingThis = state === 'pitching';
            const isRejected = state === 'rejected';
            const isAcceptedCard = state === 'accepted';

            const chanceColor =
              sponsor.chance >= 70 ? '#22c55e' :
              sponsor.chance >= 40 ? '#f59e0b' :
              sponsor.chance >= 15 ? '#f97316' : '#ef4444';

            return (
              <div
                key={sponsor.name}
                className="relative flex flex-col p-4 rounded-xl border transition-all duration-300"
                style={{
                  borderColor:
                    isAcceptedCard ? '#22c55e' :
                    isRejected     ? '#374151' :
                    isPitchingThis ? color :
                    'rgba(255,255,255,0.08)',
                  backgroundColor:
                    isAcceptedCard ? '#22c55e15' :
                    isRejected     ? 'rgba(255,255,255,0.01)' :
                    isPitchingThis ? `${color}18` :
                    'rgba(255,255,255,0.03)',
                  opacity: isRejected ? 0.45 : 1,
                  boxShadow: isPitchingThis ? `0 0 24px ${color}40` : isAcceptedCard ? '0 0 24px #22c55e40' : 'none',
                }}
              >
                {/* Chance badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{sponsor.type}</span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${chanceColor}20`, color: chanceColor }}
                  >
                    {sponsor.chance}% chance
                  </span>
                </div>

                {/* Name */}
                <div className="text-lg font-black text-white mb-1 leading-tight">{sponsor.name}</div>

                {/* Bonus */}
                <div
                  className="text-sm font-bold mb-4"
                  style={{ color }}
                >
                  {formatBonus(sponsor.bonus)}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action area */}
                {isPitchingThis ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <span className="text-xs text-gray-300 animate-pulse">Pitching…</span>
                    <PitchingDots color={color} />
                  </div>
                ) : isRejected ? (
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <span className="text-red-500 text-lg">✗</span>
                    <span className="text-xs text-red-400 font-semibold">Rejected</span>
                  </div>
                ) : isAcceptedCard ? (
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-xs text-green-400 font-semibold">Accepted!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePitch(sponsor)}
                    disabled={isDisabled}
                    className="w-full py-2 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isDisabled ? '#374151' : `${color}25`,
                      color: isDisabled ? '#6b7280' : color,
                      border: `1px solid ${isDisabled ? '#4b5563' : `${color}50`}`,
                    }}
                  >
                    Pitch →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={onBack}
            disabled={isPitching}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-30"
          >
            ← Back to club select
          </button>
        </div>
      </div>
    </div>
  );
}

function PitchingDots({ color }) {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
