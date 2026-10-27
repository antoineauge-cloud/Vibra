import React, { useState } from 'react';
import { X, Moon, Clock, Check, PowerOff, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimerRemaining, startSleepTimer, cancelSleepTimer } = usePlayer();
  const [customMinutes, setCustomMinutes] = useState('20');

  if (!isOpen) return null;

  const presets = [
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min (1h)', minutes: 60 },
  ];

  const formatRemaining = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCustomStart = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 360) {
      startSleepTimer(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#07081a]/80 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden neon-border-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-xs shadow-cyan-500/30">
              <Moon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Minuteur de Sommeil</h3>
              <p className="text-xs text-slate-400">Extinction automatique de la musique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Timer Status */}
        {sleepTimerRemaining !== null ? (
          <div className="mt-4 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                  Minuteur actif
                </div>
                <div className="text-xl font-mono font-extrabold text-white">
                  {formatRemaining(sleepTimerRemaining)}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                cancelSleepTimer();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Annuler</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            La lecture s'estompera doucement au cours des 20 dernières secondes avant de s'arrêter pour vous laisser vous endormir paisiblement.
          </div>
        )}

        {/* Preset Buttons */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Sélection rapide :
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.minutes}
                onClick={() => {
                  startSleepTimer(p.minutes);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-white font-semibold text-xs transition flex items-center justify-between group"
              >
                <span>{p.label}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom duration form */}
        <form onSubmit={handleCustomStart} className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Durée personnalisée :
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="360"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-hidden"
              placeholder="ex: 25"
            />
            <span className="text-xs text-slate-400">minutes</span>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Démarrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
