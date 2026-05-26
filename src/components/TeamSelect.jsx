import { useState } from 'react';
import { CLUB_COLORS, CLUB_BUDGETS } from '../data/budgets.js';
import { CLUB_LOGOS, CLUB_EMOJI } from '../data/clubLogos.js';

const CLUBS = [
  { name: 'Arsenal',             emoji: '🔴', slug: 'Arsenal' },
  { name: 'Aston Villa',         emoji: '🟣', slug: 'Aston-Villa' },
  { name: 'Brentford',           emoji: '🐝', slug: 'Brentford' },
  { name: 'Brighton',            emoji: '🔵', slug: 'Brighton-and-Hove-Albion' },
  { name: 'Bournemouth',         emoji: '🍒', slug: 'Bournemouth' },
  { name: 'Chelsea',             emoji: '🔵', slug: 'Chelsea' },
  { name: 'Crystal Palace',      emoji: '🦅', slug: 'Crystal-Palace' },
  { name: 'Coventry City',       emoji: '🩵', slug: 'Coventry-City' },
  { name: 'Everton',             emoji: '🔵', slug: 'Everton' },
  { name: 'Fulham',              emoji: '⚫', slug: 'Fulham' },
  { name: 'Hull City',           emoji: '🟠', slug: 'Hull-City' },
  { name: 'Ipswich Town',        emoji: '🔵', slug: 'Ipswich-Town' },
  { name: 'Leeds United',        emoji: '⚪', slug: 'Leeds-United' },
  { name: 'Liverpool',           emoji: '🔴', slug: 'Liverpool' },
  { name: 'Manchester City',     emoji: '🩵', slug: 'Manchester-City' },
  { name: 'Manchester United',   emoji: '🔴', slug: 'Manchester-United' },
  { name: 'Newcastle United',    emoji: '⚫', slug: 'Newcastle-United' },
  { name: 'Nottingham Forest',   emoji: '🌲', slug: 'Nottingham-Forest' },
  { name: 'Sunderland',          emoji: '🔴', slug: 'Sunderland' },
  { name: 'Tottenham Hotspur',   emoji: '⚪', slug: 'Tottenham-Hotspur' },
];

const TIER_LABELS = {
  big:   'Top Club',
  mid:   'Mid-Table',
  small: 'Underdog',
};

function getTier(club) {
  const budget = CLUB_BUDGETS[club] ?? 30_000_000;
  if (budget >= 80_000_000) return 'big';
  if (budget >= 45_000_000) return 'mid';
  return 'small';
}

function formatBudget(v) {
  return `£${(v / 1_000_000).toFixed(0)}M`;
}

export default function TeamSelect({ onSelectClub }) {
  const [hoveredClub, setHoveredClub] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  function handleClick(clubName) {
    setSelectedClub(clubName);
    setTimeout(() => onSelectClub(clubName), 300);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-2">Step 1 of 4</div>
          <h1 className="text-4xl font-black text-white mb-2">Choose Your Club</h1>
          <p className="text-gray-400">Pick the Premier League side you want to take charge of</p>
        </div>

        {/* Club grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {CLUBS.map(({ name }) => {
            const color = CLUB_COLORS[name] ?? '#6b7280';
            const tier = getTier(name);
            const budget = CLUB_BUDGETS[name] ?? 30_000_000;
            const isSelected = selectedClub === name;
            const isHovered = hoveredClub === name;
            const logoUrl = CLUB_LOGOS[name];
            const emoji = CLUB_EMOJI[name] ?? '⚽';

            return (
              <button
                key={name}
                onClick={() => handleClick(name)}
                onMouseEnter={() => setHoveredClub(name)}
                onMouseLeave={() => setHoveredClub(null)}
                className="relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center group"
                style={{
                  borderColor: isSelected || isHovered ? color : 'rgba(255,255,255,0.08)',
                  backgroundColor: isSelected || isHovered ? `${color}18` : 'rgba(255,255,255,0.03)',
                  boxShadow: isSelected || isHovered ? `0 0 20px ${color}30` : 'none',
                  transform: isSelected ? 'scale(0.96)' : isHovered ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {/* Crest logo with emoji fallback */}
                <div className="w-12 h-12 mb-2 flex items-center justify-center bg-white rounded-lg p-1">
                  {logoUrl
                    ? <img src={logoUrl} alt={name} className="w-full h-full object-contain"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                    : null}
                  <span className="text-2xl leading-none" style={{ display: logoUrl ? 'none' : 'block' }}>{emoji}</span>
                </div>

                {/* Club name */}
                <div className="text-xs font-bold text-white leading-tight mb-1">{name}</div>

                {/* Budget */}
                <div className="text-xs text-gray-500">{formatBudget(budget)}</div>

                {/* Tier badge */}
                <div
                  className="mt-2 px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${color}25`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {TIER_LABELS[tier]}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl border-2 animate-pulse" style={{ borderColor: color }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
