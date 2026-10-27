import React, { useState } from 'react';
import { Volume2, Zap, Flame, Radio, Sparkles, X, Activity, Play } from 'lucide-react';

interface CyberSoundboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SfxItem {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  desc: string;
}

const SFX_LIST: SfxItem[] = [
  { id: 'sub-drop', name: 'Sub-Bass Drop', category: 'Bass', color: 'from-pink-500 to-rose-600', icon: '💥', desc: 'Descente sismique 45Hz' },
  { id: 'laser', name: 'Laser Neon Blast', category: 'Synth', color: 'from-cyan-400 to-blue-600', icon: '⚡', desc: 'Tir plasma haute fréquence' },
  { id: 'glitch', name: 'Glitch Cyberdeck', category: 'FX', color: 'from-purple-500 to-indigo-600', icon: '🎛️', desc: 'Rupture binaire holographique' },
  { id: 'warp', name: 'Hyperspace Sweep', category: 'Sweep', color: 'from-amber-400 to-orange-500', icon: '🚀', desc: 'Montée exponentielle 24-bit' },
  { id: 'boom', name: '808 Cyber Kick', category: 'Drums', color: 'from-emerald-400 to-teal-600', icon: '🥁', desc: 'Impact percutant analogique' },
  { id: 'chime', name: 'Hologram Chime', category: 'Vocal', color: 'from-violet-400 to-fuchsia-600', icon: '✨', desc: 'Harmonique cristal futuriste' },
];

export const CyberSoundboard: React.FC<CyberSoundboardProps> = ({ isOpen, onClose }) => {
  const [activeSfx, setActiveSfx] = useState<string | null>(null);

  if (!isOpen) return null;

  // Synthesize cyberpunk sounds directly with Web Audio API (zero external files, zero latency)
  const triggerSfx = (id: string) => {
    try {
      setActiveSfx(id);
      setTimeout(() => setActiveSfx(null), 400);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (id === 'sub-drop') {
        // Deep 80Hz -> 30Hz sine sweep with sub harmonics
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.85);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      } else if (id === 'laser') {
        // Fast laser chirp 1600Hz -> 180Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (id === 'glitch') {
        // Square wave bit glitch with modulation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.05);
        osc.frequency.setValueAtTime(220, now + 0.1);
        osc.frequency.setValueAtTime(1200, now + 0.16);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (id === 'warp') {
        // Hyperspace riser 120Hz -> 2400Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.7);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (id === 'boom') {
        // 808 kick punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (id === 'chime') {
        // Shimmering chord (dual sine)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.65);
        });
      }
    } catch (e) {
      console.warn('SFX trigger notice:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#07081a]/80 backdrop-blur-2xl border border-pink-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[85vh] flex flex-col neon-border-pink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Cyber Soundboard DJ
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  REAL-TIME SYNTH
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Déclenchez des effets futuristes en direct pendant vos morceaux ou vos radios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SFX Grid */}
        <div className="py-5 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
          {SFX_LIST.map((item) => {
            const isPlayingThis = activeSfx === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => triggerSfx(item.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 group relative overflow-hidden ${
                  isPlayingThis
                    ? 'bg-gradient-to-br from-pink-500/40 to-cyan-500/40 border-pink-400 scale-[1.03] shadow-lg shadow-pink-500/30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-pink-500/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {item.category}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-bold text-xs text-white group-hover:text-pink-300 transition">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>

                {isPlayingThis && (
                  <span className="absolute bottom-1 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Synthèse audio Web Audio sans téléchargement ni latence
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
