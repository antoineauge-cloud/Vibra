import React, { memo } from 'react';

export const CyberScanlinesOverlay: React.FC = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden"
    >
      {/* 1. Authentic Retro CRT Horizontal Scanlines */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-65 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.28) 2px,
            rgba(0, 240, 255, 0.04) 3px
          )`,
          backgroundSize: '100% 3px',
        }}
      />

      {/* 2. Slow Vertical CRT Beam Sweep Animation */}
      <div 
        className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/[0.045] to-transparent pointer-events-none"
        style={{
          animation: 'cyber-crt-sweep 8s linear infinite',
          willChange: 'transform',
        }}
      />

      {/* 3. Subtle CRT Monitor Phosphor Screen Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />

      {/* 4. Fine Grain / Cyber Noise Filter */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
        }}
      />
    </div>
  );
});

CyberScanlinesOverlay.displayName = 'CyberScanlinesOverlay';
