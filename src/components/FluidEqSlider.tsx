import React, { useState, useRef, useEffect } from 'react';

interface FluidEqSliderProps {
  label: string;
  subLabel?: string;
  frequency: string;
  value: number; // -12 to +12
  onChange: (value: number) => void;
  disabled?: boolean;
  color: 'rose' | 'purple' | 'cyan';
  orientation?: 'horizontal' | 'vertical';
  showDetails?: boolean;
}

export const FluidEqSlider: React.FC<FluidEqSliderProps> = ({
  label,
  subLabel,
  frequency,
  value,
  onChange,
  disabled = false,
  color,
  orientation = 'horizontal',
  showDetails = true,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [hasChangedRecently, setHasChangedRecently] = useState(false);

  // Trigger pulse highlight animation when setting changes (e.g. from preset)
  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
      setHasChangedRecently(true);
      const timer = setTimeout(() => setHasChangedRecently(false), 500);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  // Convert -12..+12 to 0..100%
  const clampedVal = Math.max(-12, Math.min(12, value));
  const percent = ((clampedVal - -12) / 24) * 100;
  // Percentage for fill from 0 dB (center, 50%)
  const centerPercent = 50;
  const isPositive = clampedVal >= 0;
  const fillLeft = isPositive ? centerPercent : percent;
  const fillWidth = Math.abs(clampedVal / 24) * 100;

  // Color schemes
  const colorMap = {
    rose: {
      text: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500',
      bgLight: 'bg-rose-500/15',
      border: 'border-rose-500/30',
      gradient: 'from-rose-500 to-pink-500',
      glow: 'rgba(244, 63, 94, 0.5)',
      thumbRing: 'ring-rose-400/50',
    },
    purple: {
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-600',
      bgLight: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      gradient: 'from-purple-600 to-indigo-500',
      glow: 'rgba(168, 85, 247, 0.5)',
      thumbRing: 'ring-purple-400/50',
    },
    cyan: {
      text: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-500',
      bgLight: 'bg-cyan-500/15',
      border: 'border-cyan-500/30',
      gradient: 'from-cyan-500 to-teal-400',
      glow: 'rgba(6, 182, 212, 0.5)',
      thumbRing: 'ring-cyan-400/50',
    },
  };

  const c = colorMap[color];

  // Dynamic CSS transition: zero delay when user is actively sliding, fluid spring easing when transitioning via preset
  const transitionStyle = isInteracting
    ? 'none'
    : 'left 450ms cubic-bezier(0.34, 1.56, 0.64, 1), width 450ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), bottom 450ms cubic-bezier(0.34, 1.56, 0.64, 1), height 450ms cubic-bezier(0.34, 1.56, 0.64, 1)';

  if (orientation === 'vertical') {
    return (
      <div 
        data-no-swipe="true" 
        className="flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm select-none transition-all"
      >
        {/* Header with band name and dB badge */}
        <div className="flex items-center justify-between w-full">
          <span className={`font-bold text-xs ${c.text}`}>{label}</span>
          <span
            className={`font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full ${c.bgLight} ${c.text} transition-transform duration-300 ${
              hasChangedRecently ? 'scale-110 shadow-xs' : 'scale-100'
            }`}
          >
            {clampedVal > 0 ? `+${clampedVal}` : clampedVal} dB
          </span>
        </div>

        {/* Vertical motorized slider track */}
        <div className="relative h-36 w-12 flex items-center justify-center my-1">
          {/* Subtle dB scale tick marks */}
          <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-1 text-[8px] font-mono text-slate-400 dark:text-slate-500 pointer-events-none">
            <span>+12</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">0</span>
            <span>-12</span>
          </div>

          {/* Track groove */}
          <div className="relative h-32 w-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shadow-inner flex flex-col justify-end">
            {/* Center 0 dB line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400/40 dark:bg-white/20 -translate-y-1/2 z-10" />

            {/* Active bidirectional fill bar from 0 dB center */}
            <div
              className={`absolute left-0 right-0 rounded-full bg-gradient-to-t ${c.gradient} opacity-90`}
              style={{
                bottom: clampedVal >= 0 ? '50%' : `${percent}%`,
                height: `${Math.abs(clampedVal / 24) * 100}%`,
                transition: transitionStyle,
              }}
            />
          </div>

          {/* Motorized Knob / Thumb with fluid animation */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
            style={{
              bottom: `calc(1rem + ${percent * 0.72}%)`,
              transition: transitionStyle,
            }}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 ${c.border} shadow-lg flex items-center justify-center transform transition-transform ${
                isInteracting || hasChangedRecently ? 'scale-115 ring-4 ' + c.thumbRing : 'scale-100'
              }`}
              style={{
                boxShadow: hasChangedRecently ? `0 0 14px ${c.glow}` : undefined,
              }}
            >
              <div className={`w-2 h-2 rounded-full ${c.bg} shadow-xs`} />
            </div>
          </div>

          {/* Transparent full-size HTML input for perfect accessibility & mouse/touch dragging */}
          <input
            type="range"
            data-no-swipe="true"
            min="-12"
            max="12"
            step="1"
            disabled={disabled}
            value={clampedVal}
            onPointerDown={() => setIsInteracting(true)}
            onPointerUp={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-30 -rotate-90"
            aria-label={`Réglage ${label}`}
          />
        </div>

        {/* Frequency & Description details */}
        {showDetails && (
          <div className="text-[10px] text-center text-slate-500 dark:text-slate-400 leading-tight">
            <div className="font-semibold text-slate-700 dark:text-slate-300">{frequency}</div>
            {subLabel && <div className="truncate max-w-[90px]">{subLabel}</div>}
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout for MiniPlayer
  return (
    <div 
      data-no-swipe="true"
      className="flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/10 select-none transition-all hover:border-purple-300 dark:hover:border-purple-500/30"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${c.bg} shrink-0`} />
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{label}</span>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">({frequency})</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md ${c.bgLight} ${c.text} transition-transform duration-300 ${
              hasChangedRecently ? 'scale-110 shadow-xs' : 'scale-100'
            }`}
          >
            {clampedVal > 0 ? `+${clampedVal}` : clampedVal} dB
          </span>
        </div>
      </div>

      {/* Horizontal motorized slider track */}
      <div className="relative h-6 flex items-center justify-center">
        {/* Background track */}
        <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shadow-inner">
          {/* Center 0 dB marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400/40 dark:bg-white/30 -translate-x-1/2 z-10" />

          {/* Active fill bar starting from 0 dB center */}
          <div
            className={`absolute top-0 bottom-0 rounded-full bg-gradient-to-r ${c.gradient}`}
            style={{
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              transition: transitionStyle,
            }}
          />
        </div>

        {/* Fluid Motorized Thumb / Slider Head */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
          style={{
            left: `${percent}%`,
            transition: transitionStyle,
          }}
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-white dark:bg-slate-900 border-2 ${c.border} shadow-md flex items-center justify-center transform transition-transform ${
              isInteracting || hasChangedRecently ? 'scale-125 ring-2 ' + c.thumbRing : 'scale-100'
            }`}
            style={{
              boxShadow: hasChangedRecently ? `0 0 10px ${c.glow}` : undefined,
            }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${c.bg}`} />
          </div>
        </div>

        {/* Transparent native range slider for smooth touch & mouse scrub */}
        <input
          type="range"
          data-no-swipe="true"
          min="-12"
          max="12"
          step="1"
          disabled={disabled}
          value={clampedVal}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
          aria-label={`Curseur ${label}`}
        />
      </div>

      {/* Sublabel */}
      {subLabel && showDetails && (
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium px-0.5">
          <span>-12 dB</span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">{subLabel}</span>
          <span>+12 dB</span>
        </div>
      )}
    </div>
  );
};
