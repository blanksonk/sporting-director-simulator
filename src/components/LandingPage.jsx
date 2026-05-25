import { useEffect, useState } from 'react';

export default function LandingPage({ onStart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]" />
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #1e3a5f 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #2d1b4e 0%, transparent 45%),
                            radial-gradient(circle at 60% 80%, #0f2a1a 0%, transparent 40%)`,
        }}
      />

      {/* Pitch lines backdrop */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg, transparent, transparent 60px, rgba(255,255,255,0.5) 60px, rgba(255,255,255,0.5) 61px
          )`,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-widest uppercase">
          Premier League 2024–25
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none mb-4">
          Sporting<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Director
          </span>
        </h1>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white/80 leading-none mb-8">
          Simulator
        </h2>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-gray-400 max-w-md mb-12 leading-relaxed">
          Pick your club. Land the targets. Win the league.<br />
          <span className="text-gray-500 text-sm">380 games. 1,000 futures.</span>
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group relative px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] active:scale-95"
        >
          <span className="relative z-10">Start Season</span>
        </button>

        {/* Feature chips */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          {['Transfer Market', 'Pick Your Formation', 'Season Simulation', 'Monte Carlo Outlook'].map(f => (
            <span key={f} className="px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
    </div>
  );
}
