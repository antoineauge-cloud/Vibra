import React, { memo } from 'react';
import { NeonParticles } from './NeonParticles';
import { CyberDustLayer } from './CyberDustLayer';

interface CyberpunkBackgroundProps {
  intensity?: 'subtle' | 'normal' | 'intense';
  showGrid?: boolean;
}

export const CyberpunkBackground: React.FC<CyberpunkBackgroundProps> = memo(({
  intensity = 'intense',
  showGrid = true,
}) => {
  const isIntense = intensity === 'intense';

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#05060e]"
    >
      {/* 1. Base Cyberpunk Vignette & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.18),transparent_65%)] dark:bg-[radial-gradient(ellipse_90%_90%_at_50%_-20%,rgba(0,240,255,0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_80%_100%,rgba(255,0,128,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_90%_80%_at_80%_100%,rgba(255,0,128,0.22),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_10%_90%,rgba(138,43,226,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_70%_at_10%_90%,rgba(138,43,226,0.20),transparent_65%)]" />

      {/* 1.4 Floating Ambient Cyber-Poussière (Cyber-Dust) Particle Layer */}
      <CyberDustLayer className="opacity-25 dark:opacity-35" />

      {/* 1.5 Floating Neon Cyberpunk Particles */}
      <NeonParticles />

      {/* 2. Drifting Neon Aurora Orb 1: Cyan / Electric Teal (Top Left to Center) */}
      <div 
        className="absolute -top-32 -left-32 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none opacity-45 dark:opacity-60 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.8) 0%, rgba(0, 163, 255, 0.4) 45%, transparent 70%)',
          animation: 'cyber-drift-orb-1 18s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* 3. Drifting Neon Aurora Orb 2: Hot Pink / Magenta (Bottom Right to Center) */}
      <div 
        className="absolute -bottom-40 -right-40 w-[550px] h-[550px] sm:w-[720px] sm:h-[720px] rounded-full blur-[100px] sm:blur-[130px] pointer-events-none opacity-40 dark:opacity-55 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 127, 0.8) 0%, rgba(200, 0, 255, 0.35) 50%, transparent 70%)',
          animation: 'cyber-drift-orb-2 22s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* 4. Drifting Neon Aurora Orb 3: Violet / Deep Purple (Center-floating) */}
      <div 
        className="absolute top-1/3 left-1/4 w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] rounded-full blur-[80px] sm:blur-[110px] pointer-events-none opacity-30 dark:opacity-50 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.7) 0%, rgba(99, 102, 241, 0.35) 50%, transparent 70%)',
          animation: 'cyber-drift-orb-3 26s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* 5. Drifting Cyber Laser Beams (Diagonal sliding neon streaks) */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-35 pointer-events-none overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <div 
          className="absolute -top-[100%] left-[15%] w-[2px] h-[200%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent rotate-[35deg]"
          style={{ animation: 'cyber-beam-slide 9s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
        />
        <div 
          className="absolute -top-[100%] left-[55%] w-[2px] h-[200%] bg-gradient-to-b from-transparent via-pink-500 to-transparent rotate-[35deg]"
          style={{ animation: 'cyber-beam-slide 13s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s' }}
        />
        <div 
          className="absolute -top-[100%] left-[85%] w-[1.5px] h-[200%] bg-gradient-to-b from-transparent via-purple-400 to-transparent rotate-[35deg]"
          style={{ animation: 'cyber-beam-slide 11s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s' }}
        />
      </div>

      {/* 6. Sliding Infinite Cyber Perspective Floor Grid (Tron / Synthwave style) */}
      {showGrid && (
        <div className="absolute bottom-0 left-0 right-0 h-[45vh] sm:h-[55vh] overflow-hidden pointer-events-none [perspective:500px]">
          {/* Horizon Line Glow */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] opacity-80" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cyan-500/20 via-pink-500/10 to-transparent blur-md opacity-60 pointer-events-none" />

          {/* Perspective 3D Grid Plane */}
          <div 
            className="absolute inset-x-[-50%] top-0 bottom-[-100%] origin-top opacity-35 dark:opacity-55"
            style={{
              transform: 'rotateX(72deg)',
              transformStyle: 'preserve-3d',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 240, 255, 0.35) 1.5px, transparent 1.5px),
                linear-gradient(to bottom, rgba(255, 0, 128, 0.35) 1.5px, transparent 1.5px)
              `,
              backgroundSize: '54px 54px',
              animation: 'cyber-grid-sliding 2.5s linear infinite',
              willChange: 'background-position',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>
      )}

      {/* 7. Top Cyber Scanline Texture (Very Subtle High-Tech Feel) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.065]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #00f0ff, #00f0ff 1px, transparent 1px, transparent 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* 8. Ambient Cyber Vignette Border to frame the viewport */}
      <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />
    </div>
  );
});

CyberpunkBackground.displayName = 'CyberpunkBackground';
