import { useState } from 'react';
import { getSponsors } from '../data/sponsors.js';
import { CLUB_COLORS } from '../data/budgets.js';

function formatBonus(v) {
  return `+£${(v / 1_000_000).toFixed(0)}M`;
}

export default function SponsorSelect({ club, onSelectSponsor, onBack }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const sponsors = getSponsors(club);
  const color = CLUB_COLORS[club] ?? '#10b981';

  function handleConfirm() {
    if (!selected) return;
    setConfirmed(true);
    setTimeout(() => onSelectSponsor(selected), 400);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-2">Step 2 of 4</div>
          <h1 className="text-4xl font-black text-white mb-2">Choose Your Shirt Sponsor</h1>
          <p className="text-gray-400">
            <span className="font-semibold" style={{ color }}>{club}</span> — pick the deal that fits your ambition
          </p>
        </div>

        {/* Sponsor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {sponsors.map((sponsor) => {
            const isSelected = selected?.name === sponsor.name;
            return (
              <button
                key={sponsor.name}
                onClick={() => setSelected(sponsor)}
                className="relative text-left p-6 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: isSelected ? color : 'rgba(255,255,255,0.08)',
                  backgroundColor: isSelected ? `${color}18` : 'rgba(255,255,255,0.03)',
                  boxShadow: isSelected ? `0 0 24px ${color}30` : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Sponsor name */}
                <div className="text-2xl font-black text-white mb-1">{sponsor.name}</div>

                {/* Tagline */}
                <div className="text-gray-400 text-sm mb-4 italic">"{sponsor.tagline}"</div>

                {/* Budget bonus */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{ backgroundColor: `${color}25`, color: color, border: `1px solid ${color}50` }}
                >
                  <span className="text-lg">💰</span>
                  {formatBonus(sponsor.bonus)} budget injection
                </div>

                {/* Selected tick */}
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: color, color: '#000' }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action row */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-semibold"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || confirmed}
            className="px-10 py-3 rounded-xl font-bold text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ backgroundColor: selected ? color : '#6b7280' }}
          >
            {confirmed ? 'Confirmed!' : 'Sign Deal →'}
          </button>
        </div>
      </div>
    </div>
  );
}
